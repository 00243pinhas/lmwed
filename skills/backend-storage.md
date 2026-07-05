# SKILL: Backend Storage
## Read this before handling any file, photo, or video upload.
## Used for: custom order progress media (the bride's magic-link page).

---

## What this is for
Linda receives dress-progress photos/videos from the Istanbul atelier (as she already
does today via WhatsApp) and uploads them to an order. The bride views them on her
private magic-link page. This skill covers storing and serving that media.

Phase 2 model: LINDA uploads (she curates what's client-worthy). Atelier-direct
upload is a later permission flip — same storage, same table.

---

## Supabase Storage setup
- Bucket name: `order-media`
- Bucket visibility: **private** (never public — these are client photos)
- Access is granted through signed URLs with short expiry, never public links.

---

## Upload flow (owner only)
Uploads happen from an authenticated owner session, server-side or via the
owner dashboard. Never from an unauthenticated context.

```ts
// 1. Upload the file to storage under a path keyed by order
const path = `${orderId}/${crypto.randomUUID()}-${filename}`
const { error: upErr } = await supabase.storage
  .from('order-media').upload(path, file, { upsert: false })

// 2. Record the update row (points at the stored path)
await supabase.from('order_updates').insert({
  order_id: orderId,
  uploaded_by: user.id,          // from session, never client body
  media_url: path,               // store the PATH, not a public URL
  media_type: isVideo ? 'video' : 'image',
  caption,
  stage,
})
```

Store the storage PATH in `media_url`, not a signed URL — signed URLs expire.
Generate fresh signed URLs at read time.

---

## Serving media to the bride (magic-link page)
The bride's page `/my-dress/[token]` uses a service-role read (one of the two
allowed service-role uses). It:
1. Looks up the order by `share_token`.
2. Fetches that order's `order_updates`.
3. Generates a short-lived signed URL for each media path.

```ts
const { data: signed } = await supabaseService.storage
  .from('order-media')
  .createSignedUrl(update.media_url, 60 * 60)   // 1 hour expiry
```
The bride's browser receives temporary URLs that expire — she can view, but the
media is never permanently public and never guessable.

---

## Rules
- Bucket is PRIVATE. No public URLs, ever.
- Store paths in the database, generate signed URLs on read (1h expiry).
- Uploads: owner session only. uploaded_by comes from the session, never the body.
- Keep videos short (<60s) to stay within free-tier storage/bandwidth at Linda's scale.
- Validate file type and size before upload (images: jpg/png/webp; video: mp4).
- One folder per order (`{orderId}/...`) keeps media organized and easy to manage.
- Never expose the service role key to the browser — signed URLs are generated
  server-side and only the temporary URL is sent to the bride.

---

## Why signed URLs instead of public
A public bucket means anyone with a link sees the photos forever. Signed URLs
expire in an hour, so even if a link leaks it dies quickly. For a bride's private
dress photos, this is the correct level of protection — luxury clients expect
their images handled carefully, and it costs nothing to do it right.

---

## File validation
```ts
const okImage = ['image/jpeg','image/png','image/webp']
const okVideo = ['video/mp4']
if (![...okImage, ...okVideo].includes(file.type)) {
  return Response.json({ ok: false, error: 'Unsupported file type' }, { status: 400 })
}
// size cap, e.g. 25MB
if (file.size > 25 * 1024 * 1024) {
  return Response.json({ ok: false, error: 'File too large' }, { status: 400 })
}
```
