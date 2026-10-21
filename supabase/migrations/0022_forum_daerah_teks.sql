-- =================================================================
-- Jejak Jajan - Forum: daerah diketik bebas (opsional), bukan pilihan provinsi
-- Jalankan setelah 0021 di Supabase Dashboard > SQL Editor.
-- =================================================================

alter table requests add column if not exists daerah text;
alter table requests drop constraint if exists requests_daerah_check;
alter table requests add constraint requests_daerah_check check (daerah is null or char_length(daerah) <= 80);
