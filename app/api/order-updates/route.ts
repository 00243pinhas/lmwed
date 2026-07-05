// POST /api/order-updates — owner uploads a progress photo/video to a custom
// order. See skills/backend-storage.md, skills/backend-orders.md,
// skills/backend-security.md.
//
// Owner-only, enforced here AND at RLS (both the order_updates table policy
// and the order-media storage policy — migrations 001/002 and 009). The
// bride's viewing page is a separate, later piece; this route only handles
// Linda's own upload.
import { randomUUID } from 'crypto'
import { z } from 'zod'

import { createUserScopedClient } from '@/lib/supabase'

const OK_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const OK_VIDEO_TYPES = ['video/mp4']
const MAX_BYTES = 25 * 1024 * 1024

const metaSchema = z.object({
  orderId: z.string().uuid(),
  caption: z.string().max(500).optional(),
  stage: z
    .enum(['consultation', 'design', 'measurements', 'production', 'arrived', 'delivered'])
    .optional(),
})

export async function POST(req: Request) {
  try {
    // 1. Parse + validate input FIRST — never trust the client
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return Response.json({ ok: false, error: 'No file provided' }, { status: 400 })
    }

    const rawCaption = formData.get('caption')
    const rawStage = formData.get('stage')
    const parsed = metaSchema.safeParse({
      orderId: formData.get('orderId'),
      caption: typeof rawCaption === 'string' && rawCaption.trim() !== '' ? rawCaption : undefined,
      stage: typeof rawStage === 'string' && rawStage.trim() !== '' ? rawStage : undefined,
    })
    if (!parsed.success) {
      return Response.json({ ok: false, error: 'Invalid input' }, { status: 400 })
    }
    const input = parsed.data

    const isImage = OK_IMAGE_TYPES.includes(file.type)
    const isVideo = OK_VIDEO_TYPES.includes(file.type)
    if (!isImage && !isVideo) {
      return Response.json(
        { ok: false, error: 'Unsupported file type — use JPG, PNG, WEBP, or MP4' },
        { status: 400 }
      )
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ ok: false, error: 'File is too large — 25MB max' }, { status: 400 })
    }

    // 2. Require authentication AND the owner role — the middleware only
    // guards /dashboard/*, not /api/*, so this route must check both itself.
    const supabase = await createUserScopedClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, active')
      .eq('id', user.id)
      .single()

    if (!profile?.active) {
      return Response.json({ ok: false, error: 'Account inactive' }, { status: 403 })
    }

    if (profile.role !== 'owner') {
      return Response.json({ ok: false, error: 'Not allowed' }, { status: 403 })
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('id', input.orderId)
      .single()

    if (!order) {
      return Response.json({ ok: false, error: 'Order not found' }, { status: 404 })
    }

    // 3. Upload the file under a path keyed by order id, then record the
    // update row. uploaded_by comes from the session, never the request body.
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${input.orderId}/${randomUUID()}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('order-media')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error('POST /api/order-updates upload failed', uploadError)
      return Response.json({ ok: false, error: 'Could not upload file' }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('order_updates')
      .insert({
        order_id: input.orderId,
        uploaded_by: user.id,
        media_url: path,
        media_type: isVideo ? 'video' : 'image',
        caption: input.caption ?? null,
        stage: input.stage ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('POST /api/order-updates insert failed', error)
      // Best-effort cleanup so a failed insert doesn't leave an orphaned file.
      await supabase.storage.from('order-media').remove([path])
      return Response.json({ ok: false, error: 'Could not save progress update' }, { status: 500 })
    }

    // 4. Consistent success shape
    return Response.json({ ok: true, data }, { status: 200 })
  } catch (err) {
    console.error('POST /api/order-updates failed', err)
    return Response.json({ ok: false, error: 'Something went wrong' }, { status: 500 })
  }
}
