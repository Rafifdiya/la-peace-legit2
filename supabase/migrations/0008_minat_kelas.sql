-- =================================================================
-- Jejak Jajan - daftar minat "Kelas Bersama Penjual" (segera hadir)
-- Validasi model bisnis (docs/05 Tema A poin 5): berapa orang tertarik
-- kelas/workshop berbayar bersama penjual asli.
-- Jalankan setelah 0007 di Supabase Dashboard > SQL Editor.
-- =================================================================

create table minat_kelas (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 200),
  jajanan text check (length(jajanan) <= 100),
  user_id uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Satu email cukup sekali (huruf besar/kecil dianggap sama)
create unique index minat_kelas_email_unik on minat_kelas (lower(email));

alter table minat_kelas enable row level security;

-- Siapa saja boleh mendaftar (termasuk belum login); hanya admin yang bisa membaca.
create policy "daftar minat kelas" on minat_kelas for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));
create policy "admin baca minat kelas" on minat_kelas for select using (is_admin());
