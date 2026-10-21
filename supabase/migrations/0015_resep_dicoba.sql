-- =================================================================
-- Jejak Jajan - "Saya sudah coba" (bukti komunitas bahwa resep berhasil)
-- Menjawab feedback: "Bagaimana user tahu resep pasti berhasil?"
-- 1 user 1 laporan per jajanan (bisa diubah / dihapus), foto hasil opsional.
-- Jalankan setelah 0014 di Supabase Dashboard > SQL Editor.
-- =================================================================

create table resep_dicoba (
  id uuid primary key default gen_random_uuid(),
  snack_id uuid not null references snacks (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade default auth.uid(),
  berhasil boolean not null,
  catatan text check (char_length(catatan) <= 280),
  foto_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (snack_id, user_id)
);
create index resep_dicoba_snack_idx on resep_dicoba (snack_id, created_at desc);

alter table resep_dicoba enable row level security;

-- Semua orang boleh melihat (jumlah & foto hasil tampil di halaman jajanan)
create policy "baca resep dicoba" on resep_dicoba for select using (true);
create policy "tambah laporan sendiri" on resep_dicoba for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "ubah laporan sendiri" on resep_dicoba for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- Pemilik atau admin (moderasi foto / catatan tidak pantas) boleh menghapus
create policy "hapus laporan sendiri atau admin" on resep_dicoba for delete to authenticated
  using (user_id = (select auth.uid()) or is_admin());

-- Foto hasil memakai bucket "foto" (folder milik user), sudah diatur di 0001.
