-- Storage RLS for the order-media bucket (private, progress photos/videos).
-- See skills/backend-storage.md and skills/backend-data-model.md.
--
-- Manual step first (Supabase dashboard, not SQL): create the bucket itself —
-- Storage → New bucket → name "order-media" → Public bucket: OFF.
--
-- A private bucket ships with NO storage.objects policies, so without the
-- policies below nobody — not even the owner — could upload to it or
-- generate a signed URL from it (createSignedUrl still checks the SELECT
-- policy on storage.objects). This mirrors the owner-insert / authenticated-
-- read split already defined for the order_updates table itself.

create policy "owner insert order media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'order-media' and my_role() = 'owner'
);

create policy "authenticated read order media"
on storage.objects for select
to authenticated
using (
  bucket_id = 'order-media' and my_role() is not null
);

-- No update/delete policy: nobody can overwrite or remove uploaded media,
-- not even the owner — same append-only spirit as rentals/payments. If a
-- photo is wrong, upload a new one; the old row/file stays as history.
