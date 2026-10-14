-- =================================================================
-- Jejak Jajan - nama tampil unik (tidak peduli huruf besar/kecil)
-- Jalankan setelah 0005 di Supabase Dashboard > SQL Editor.
-- =================================================================

-- Trigger profil baru: pakai nama dari form daftar, tapi kosongkan jika
-- sudah dipakai (supaya pendaftaran tidak gagal karena index unik).
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_nama text := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');
begin
  if v_nama is not null and exists (
    select 1 from public.profiles where lower(nama_tampil) = lower(v_nama)
  ) then
    v_nama := null;
  end if;
  insert into public.profiles (id, nama_tampil, avatar_url)
  values (new.id, v_nama, new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

create unique index profiles_nama_tampil_unik on profiles (lower(nama_tampil));
