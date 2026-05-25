-- 014 — Storage Bucket & Policies

-- Bucket private untuk foto check-in
insert into storage.buckets (id, name, public)
values ('check-in-photos', 'check-in-photos', false);

-- Trainer hanya upload ke folder sendiri
create policy "Trainer upload own" on storage.objects
  for insert with check (
    bucket_id = 'check-in-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trainer lihat folder sendiri, admin lihat semua
create policy "Read own photos" on storage.objects
  for select using (
    bucket_id = 'check-in-photos' and (
      is_admin() or
      auth.uid()::text = (storage.foldername(name))[1]
    )
  );
