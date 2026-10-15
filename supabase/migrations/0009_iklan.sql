-- =================================================================
-- Jejak Jajan - iklan sponsor di sidebar (khusus admin)
-- Monetisasi docs/05 Tema A poin 1 (sponsor brand bahan kue lokal).
-- Jalankan setelah 0008 di Supabase Dashboard > SQL Editor.
-- =================================================================

create table iklan (
  id uuid primary key default gen_random_uuid(),
  judul text not null check (length(trim(judul)) between 2 and 80),
  link_url text check (link_url ~* '^https?://'),
  media_url text not null,
  jenis text not null check (jenis in ('foto', 'video')),
  aktif boolean not null default true,
  created_by uuid references profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table iklan enable row level security;

-- Pengunjung hanya melihat iklan aktif; admin melihat & mengelola semua.
create policy "baca iklan aktif" on iklan for select using (aktif or is_admin());
create policy "admin kelola iklan" on iklan for all using (is_admin()) with check (is_admin());

-- Storage: bucket publik "iklan", maks 2 MB, foto/GIF/video. Hanya admin yang unggah & hapus.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('iklan', 'iklan', true, 2097152,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']);

create policy "admin unggah iklan" on storage.objects for insert to authenticated
  with check (bucket_id = 'iklan' and public.is_admin());
create policy "admin hapus iklan" on storage.objects for delete to authenticated
  using (bucket_id = 'iklan' and public.is_admin());
