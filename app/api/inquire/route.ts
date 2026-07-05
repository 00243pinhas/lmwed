// POST /api/inquire — public inquiry form submission.
// Public route: brides are never authenticated, so this is one of only two
// allowed uses of the service-role client (see skills/backend-security.md).
import { z } from 'zod'
import { Resend } from 'resend'

import { createServiceRoleClient } from '@/lib/supabase'

// Enum values match the CHECK constraints / documented values in
// skills/backend-data-model.md exactly — never invent new ones here.
const inquirySchema = z.object({
  firstName: z.string().min(1),
  city: z.string().min(1),
  whatsapp: z.string().min(1),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  serviceType: z.enum(['custom', 'rental', 'not_sure']),
  silhouette: z.string().optional(),
  dreamDress: z.string().min(1),
  inspirationLink: z.union([z.string().url(), z.literal('')]).optional(),
  weddingMonth: z.string().min(1),
  weddingYear: z.string().min(1),
  weddingCity: z.string().min(1),
  budget: z.enum(['under_500', '500_1200', '1200_2500', '2500_plus']),
  foundUs: z.enum(['instagram', 'tiktok', 'friend', 'other']),
})

const budgetLabels: Record<string, string> = {
  under_500: 'Under $500',
  '500_1200': '$500–$1,200',
  '1200_2500': '$1,200–$2,500',
  '2500_plus': '$2,500+',
}

const serviceLabels: Record<string, string> = {
  custom: 'Custom Gown',
  rental: 'Rental',
  not_sure: 'Not sure yet',
}

const foundUsLabels: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  friend: 'A friend',
  other: 'Other',
}

function isWithinWeeks(month: string, year: string, weeks: number): boolean {
  const date = new Date(`${month} 1, ${year}`)
  if (Number.isNaN(date.getTime())) return false

  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const diffWeeks = (date.getTime() - Date.now()) / msPerWeek
  return diffWeeks >= 0 && diffWeeks <= weeks
}

function qualificationTag(budget: string, weddingMonth: string, weddingYear: string): string {
  const highBudget = budget === '1200_2500' || budget === '2500_plus'
  const lowBudget = budget === 'under_500'
  const rush = isWithinWeeks(weddingMonth, weddingYear, 8)

  if (lowBudget) return '🔴 LOW-BUDGET'
  if (rush) return '🔴 RUSH'
  if (highBudget) return '🟢 HIGH-FIT'
  return '🟡 REVIEW'
}

function buildEmailBody(input: z.infer<typeof inquirySchema>, tag: string): string {
  return `New inquiry from the website

Name:        ${input.firstName}
City:        ${input.city}
WhatsApp:    ${input.whatsapp}
Email:       ${input.email || '—'}

Service:     ${serviceLabels[input.serviceType]}
Silhouette:  ${input.silhouette || '—'}
Vision:      ${input.dreamDress}
Inspiration: ${input.inspirationLink || '—'}

Wedding:     ${input.weddingMonth} ${input.weddingYear}, ${input.weddingCity}
Budget:      ${budgetLabels[input.budget]}
Found us:    ${foundUsLabels[input.foundUs]}

Tag:         ${tag}`
}

export async function POST(req: Request) {
  try {
    // 1. Parse + validate input FIRST — never trust the client
    const body = await req.json()
    const parsed = inquirySchema.safeParse(body)
    if (!parsed.success) {
      // DEBUG ONLY — remove before shipping. Logs exactly which fields failed
      // and why; the client still only ever sees the generic message below.
      console.error('POST /api/inquire validation failed', parsed.error.flatten())
      return Response.json({ ok: false, error: 'Invalid input' }, { status: 400 })
    }
    const input = parsed.data

    // 2. Save to the database BEFORE sending any email — never lose a lead
    // to a mail failure. Service-role client: brides aren't authenticated.
    const supabase = createServiceRoleClient()
    const { error: insertError } = await supabase
      .from('inquiries')
      .insert({
        first_name: input.firstName,
        city: input.city,
        whatsapp: input.whatsapp,
        email: input.email || null,
        service_type: input.serviceType,
        silhouette: input.silhouette || null,
        dress_description: input.dreamDress,
        inspiration_link: input.inspirationLink || null,
        wedding_month: input.weddingMonth,
        wedding_year: input.weddingYear,
        wedding_city: input.weddingCity,
        budget_range: input.budget,
        found_us: input.foundUs,
      })
      .select()
      .single()

    if (insertError) {
      console.error('POST /api/inquire insert failed', insertError)
      return Response.json({ ok: false, error: 'Could not save inquiry' }, { status: 500 })
    }

    // 3. Email Linda — best-effort. If it fails, the inquiry is already safe.
    try {
      // DEBUG ONLY — remove before shipping. Never log the key value itself.
      console.log('Resend send: preparing', {
        hasResendKey: Boolean(process.env.RESEND_API_KEY),
        hasLindaEmail: Boolean(process.env.LINDA_EMAIL),
        lindaEmail: process.env.LINDA_EMAIL,
      })

      const resend = new Resend(process.env.RESEND_API_KEY)
      const tag = qualificationTag(input.budget, input.weddingMonth, input.weddingYear)

      const { data: sendData, error: sendError } = await resend.emails.send({
        from: 'LM Weddyli <onboarding@resend.dev>',
        to: process.env.LINDA_EMAIL!,
        subject: `${tag} New inquiry — ${input.firstName}, ${input.weddingCity}`,
        text: buildEmailBody(input, tag),
      })

      // resend v6 returns { data, error } instead of throwing on API-level
      // failures (bad key, bad recipient, etc.) — a try/catch alone misses
      // these, so the error field must be checked explicitly.
      if (sendError) {
        console.error('Inquiry saved but email failed', sendError)
      } else {
        console.log('Resend send succeeded', sendData)
      }
    } catch (mailErr) {
      console.error('Inquiry saved but email failed (threw)', mailErr)
      // do NOT fail the request — the inquiry is safely stored
    }

    // 4. Consistent success shape
    return Response.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('POST /api/inquire failed', err)
    return Response.json({ ok: false, error: 'Something went wrong' }, { status: 500 })
  }
}
