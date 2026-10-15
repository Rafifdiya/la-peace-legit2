-- =================================================================
-- Jejak Jajan - Pengaturan profil
-- 1) Nama asli (nama_tampil) terkunci setelah pendaftaran selesai.
-- 2) Bucket "avatar" untuk foto profil (maks 2 MB).
-- Jalankan setelah 0012 di Supabase Dashboard > SQL Editor.
-- =================================================================

-- Saat daftar, nama diisi bersamaan dengan username pertama kali
-- (username lama masih kosong). Setelah itu hanya admin yang bisa mengubah.
create function protect_nama() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.nama_tampil is distinct from old.nama_tampil
     and old.username is not null
     and (select auth.uid()) is not null
     and not public.is_admin() then
    raise exception 'Nama asli tidak bisa diubah';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_nama before update on profiles
  for each row execute function protect_nama();

-- Foto profil: bucket publik, maks 2 MB, file di folder <user_id>/...
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatar', 'avatar', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "upload avatar sendiri" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatar' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "hapus avatar sendiri" on storage.objects for delete to authenticated
  using (bucket_id = 'avatar' and (storage.foldername(name))[1] = (select auth.uid())::text);
