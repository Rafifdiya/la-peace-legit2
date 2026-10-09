-- =================================================================
-- Jejak Jajan - schema awal (MVP + request, simpan, konfirmasi lokasi)
-- Jalankan sekali di Supabase Dashboard > SQL Editor.
-- Acuan: docs/03-desain.txt bagian 7.
-- =================================================================

-- ---------- Tipe ----------
create type content_status as enum ('pending', 'approved', 'rejected', 'hidden');
create type rarity_level as enum ('umum', 'mulai_langka', 'hampir_punah', 'punah');
create type user_role as enum ('user', 'admin');
create type sighting_kind as enum ('kios_tetap', 'keliling', 'musiman');
create type difficulty as enum ('mudah', 'sedang', 'sulit');

-- ---------- Referensi ----------
create table provinces (
  id smallint generated always as identity primary key,
  nama text not null unique,
  slug text not null unique,
  kode text
);

create table categories (
  id smallint generated always as identity primary key,
  nama text not null unique,
  slug text not null unique
);

-- ---------- Profil ----------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique check (username ~ '^[a-z0-9_]{3,30}$'),
  nama_tampil text check (char_length(nama_tampil) <= 60),
  avatar_url text,
  daerah text,
  bio text check (char_length(bio) <= 300),
  role user_role not null default 'user',
  created_at timestamptz not null default now()
);

-- Cek admin. security definer agar tidak memicu RLS rekursif di profiles.
create function is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Profil otomatis dibuat saat user daftar.
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nama_tampil, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- User biasa tidak boleh mengubah role sendiri.
create function protect_role() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Tidak boleh mengubah role';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on profiles
  for each row execute function protect_role();

-- ---------- Jajanan ----------
create table snacks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nama text not null check (char_length(nama) between 2 and 80),
  nama_lain text[] not null default '{}',
  province_id smallint references provinces (id),
  daerah_detail text,
  category_id smallint references categories (id),
  deskripsi_singkat text check (char_length(deskripsi_singkat) <= 200),
  cerita text,
  sumber_info text,
  cara_masak text[] not null default '{}',
  rasa text[] not null default '{}',
  bahan_utama text[] not null default '{}',
  cover_url text,
  status content_status not null default 'pending',
  created_by uuid references profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index snacks_status_created_idx on snacks (status, created_at desc);
create index snacks_province_idx on snacks (province_id);
create index snacks_category_idx on snacks (category_id);

create table snack_photos (
  id uuid primary key default gen_random_uuid(),
  snack_id uuid not null references snacks (id) on delete cascade,
  url text not null,
  caption text,
  kredit text,
  status content_status not null default 'pending',
  uploaded_by uuid references profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index snack_photos_snack_idx on snack_photos (snack_id);

create table recipes (
  id uuid primary key default gen_random_uuid(),
  snack_id uuid not null references snacks (id) on delete cascade,
  judul_versi text not null,
  bahan jsonb not null default '[]',
  porsi smallint check (porsi > 0),
  waktu_menit smallint check (waktu_menit > 0),
  kesulitan difficulty,
  video_url text,
  verified boolean not null default false,
  status content_status not null default 'pending',
  created_by uuid references profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index recipes_snack_idx on recipes (snack_id);

create table recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id) on delete cascade,
  urutan smallint not null check (urutan > 0),
  instruksi text not null,
  foto_url text,
  video_url text,
  unique (recipe_id, urutan)
);

create table sightings (
  id uuid primary key default gen_random_uuid(),
  snack_id uuid not null references snacks (id) on delete cascade,
  nama_tempat text not null,
  area text not null,
  province_id smallint references provinces (id),
  jenis sighting_kind not null,
  maps_url text,
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  tanggal_terlihat date,
  last_confirmed_at timestamptz,
  order_url text,
  izin_publik boolean not null default false,
  status content_status not null default 'pending',
  created_by uuid references profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index sightings_snack_idx on sightings (snack_id);

create table sighting_confirmations (
  id uuid primary key default gen_random_uuid(),
  sighting_id uuid not null references sightings (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade default auth.uid(),
  masih_ada boolean not null,
  created_at timestamptz not null default now()
);
create index sighting_conf_sighting_idx on sighting_confirmations (sighting_id);

-- Konfirmasi "masih ada" memperbarui last_confirmed_at.
create function touch_sighting() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.masih_ada then
    update public.sightings set last_confirmed_at = now() where id = new.sighting_id;
  end if;
  return new;
end;
$$;

create trigger sighting_confirmed
  after insert on sighting_confirmations
  for each row execute function touch_sighting();

-- ---------- Interaksi user ----------
create table rarity_votes (
  user_id uuid not null references profiles (id) on delete cascade default auth.uid(),
  snack_id uuid not null references snacks (id) on delete cascade,
  nilai rarity_level not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, snack_id)
);

create table saves (
  user_id uuid not null references profiles (id) on delete cascade default auth.uid(),
  snack_id uuid not null references snacks (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, snack_id)
);

-- Label kelangkaan = suara terbanyak, tampil jika min. 3 suara.
create view snack_rarity with (security_invoker = true) as
select snack_id, jumlah_vote,
       case when jumlah_vote >= 3 then nilai end as label
from (
  select snack_id, nilai,
         sum(count(*)) over (partition by snack_id) as jumlah_vote,
         row_number() over (partition by snack_id order by count(*) desc, nilai desc) as rn
  from rarity_votes
  group by snack_id, nilai
) t
where rn = 1;

-- ---------- Request jajanan ----------
create table requests (
  id uuid primary key default gen_random_uuid(),
  judul text not null check (char_length(judul) between 3 and 100),
  deskripsi text,
  province_id smallint references provinces (id),
  status text not null default 'open' check (status in ('open', 'answered')),
  answered_snack_id uuid references snacks (id) on delete set null,
  created_by uuid references profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table request_answers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests (id) on delete cascade,
  user_id uuid references profiles (id) on delete set null default auth.uid(),
  snack_id uuid references snacks (id) on delete set null,
  isi text not null,
  created_at timestamptz not null default now()
);

-- ---------- Moderasi ----------
create table reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('snack', 'recipe', 'sighting', 'comment', 'photo')),
  target_id uuid not null,
  alasan text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  reported_by uuid references profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table moderation_logs (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  aksi text not null check (aksi in ('approve', 'reject', 'hide', 'edit')),
  alasan text,
  admin_id uuid references profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

-- =================================================================
-- RLS: publik baca yang approved; user kelola kiriman sendiri yang
-- masih pending/rejected; hanya admin ubah status (bukan kiriman sendiri).
-- =================================================================
alter table provinces enable row level security;
alter table categories enable row level security;
alter table profiles enable row level security;
alter table snacks enable row level security;
alter table snack_photos enable row level security;
alter table recipes enable row level security;
alter table recipe_steps enable row level security;
alter table sightings enable row level security;
alter table sighting_confirmations enable row level security;
alter table rarity_votes enable row level security;
alter table saves enable row level security;
alter table requests enable row level security;
alter table request_answers enable row level security;
alter table reports enable row level security;
alter table moderation_logs enable row level security;

-- Referensi: semua boleh baca, admin kelola.
create policy "baca provinsi" on provinces for select using (true);
create policy "admin kelola provinsi" on provinces for all using (is_admin()) with check (is_admin());
create policy "baca kategori" on categories for select using (true);
create policy "admin kelola kategori" on categories for all using (is_admin()) with check (is_admin());

-- Profil: publik baca, user ubah profil sendiri.
create policy "baca profil" on profiles for select using (true);
create policy "ubah profil sendiri" on profiles for update
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "admin ubah profil" on profiles for update using (is_admin());

-- Konten berstatus (snacks, snack_photos, recipes, sightings): pola sama.
create policy "baca jajanan" on snacks for select
  using (status = 'approved' or created_by = (select auth.uid()) or is_admin());
create policy "kirim jajanan" on snacks for insert to authenticated
  with check (created_by = (select auth.uid()) and status = 'pending');
create policy "edit kiriman jajanan" on snacks for update to authenticated
  using (created_by = (select auth.uid()) and status in ('pending', 'rejected'))
  with check (created_by = (select auth.uid()) and status = 'pending');
create policy "admin moderasi jajanan" on snacks for update
  using (is_admin() and created_by is distinct from (select auth.uid()));
create policy "admin hapus jajanan" on snacks for delete using (is_admin());

create policy "baca foto" on snack_photos for select
  using (status = 'approved' or uploaded_by = (select auth.uid()) or is_admin());
create policy "kirim foto" on snack_photos for insert to authenticated
  with check (uploaded_by = (select auth.uid()) and status = 'pending');
create policy "admin moderasi foto" on snack_photos for update
  using (is_admin() and uploaded_by is distinct from (select auth.uid()));
create policy "hapus foto" on snack_photos for delete
  using (is_admin() or (uploaded_by = (select auth.uid()) and status <> 'approved'));

create policy "baca resep" on recipes for select
  using (status = 'approved' or created_by = (select auth.uid()) or is_admin());
create policy "kirim resep" on recipes for insert to authenticated
  with check (created_by = (select auth.uid()) and status = 'pending' and verified = false);
create policy "edit kiriman resep" on recipes for update to authenticated
  using (created_by = (select auth.uid()) and status in ('pending', 'rejected'))
  with check (created_by = (select auth.uid()) and status = 'pending' and verified = false);
create policy "admin moderasi resep" on recipes for update
  using (is_admin() and created_by is distinct from (select auth.uid()));
create policy "admin hapus resep" on recipes for delete using (is_admin());

-- Langkah resep ikut hak akses resep induknya.
create policy "baca langkah" on recipe_steps for select
  using (exists (select 1 from recipes r where r.id = recipe_id));
create policy "kelola langkah sendiri" on recipe_steps for all to authenticated
  using (exists (select 1 from recipes r where r.id = recipe_id
                 and r.created_by = (select auth.uid()) and r.status in ('pending', 'rejected')))
  with check (exists (select 1 from recipes r where r.id = recipe_id
                      and r.created_by = (select auth.uid()) and r.status in ('pending', 'rejected')));
create policy "admin kelola langkah" on recipe_steps for all using (is_admin()) with check (is_admin());

create policy "baca lokasi" on sightings for select
  using (status = 'approved' or created_by = (select auth.uid()) or is_admin());
create policy "kirim lokasi" on sightings for insert to authenticated
  with check (created_by = (select auth.uid()) and status = 'pending');
create policy "edit kiriman lokasi" on sightings for update to authenticated
  using (created_by = (select auth.uid()) and status in ('pending', 'rejected'))
  with check (created_by = (select auth.uid()) and status = 'pending');
create policy "admin moderasi lokasi" on sightings for update
  using (is_admin() and created_by is distinct from (select auth.uid()));
create policy "admin hapus lokasi" on sightings for delete using (is_admin());

-- Konfirmasi lokasi: publik baca, user tambah atas nama sendiri.
create policy "baca konfirmasi" on sighting_confirmations for select using (true);
create policy "konfirmasi lokasi" on sighting_confirmations for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Vote kelangkaan: publik baca (untuk label), user kelola vote sendiri.
create policy "baca vote" on rarity_votes for select using (true);
create policy "vote sendiri" on rarity_votes for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "ubah vote sendiri" on rarity_votes for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "hapus vote sendiri" on rarity_votes for delete to authenticated
  using (user_id = (select auth.uid()));

-- Simpan: hanya pemilik.
create policy "kelola simpanan sendiri" on saves for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Request: publik baca, user buat; admin kelola.
create policy "baca request" on requests for select using (true);
create policy "buat request" on requests for insert to authenticated
  with check (created_by = (select auth.uid()) and status = 'open');
create policy "admin kelola request" on requests for update using (is_admin());
create policy "baca jawaban" on request_answers for select using (true);
create policy "jawab request" on request_answers for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Laporan: user kirim, hanya admin baca & selesaikan.
create policy "kirim laporan" on reports for insert to authenticated
  with check (reported_by = (select auth.uid()) and status = 'open');
create policy "admin baca laporan" on reports for select using (is_admin());
create policy "admin selesaikan laporan" on reports for update using (is_admin());

create policy "admin log moderasi" on moderation_logs for all
  using (is_admin()) with check (is_admin() and admin_id = (select auth.uid()));

-- =================================================================
-- Storage foto: bucket publik, maks 2 MB, jpg/png/webp.
-- File disimpan di folder <user_id>/...
-- =================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('foto', 'foto', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "upload foto ke folder sendiri" on storage.objects for insert to authenticated
  with check (bucket_id = 'foto' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "hapus foto sendiri" on storage.objects for delete to authenticated
  using (bucket_id = 'foto' and (storage.foldername(name))[1] = (select auth.uid())::text);
