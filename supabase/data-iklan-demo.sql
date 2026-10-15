-- =================================================================
-- Jejak Jajan - Iklan DEMO untuk expo (merek fiktif, gambar di public/iklan-demo/)
-- Opsional. Jalankan sekali di Supabase Dashboard > SQL Editor.
-- Hapus lewat /admin?tab=iklan bila sudah ada sponsor asli.
-- =================================================================

insert into iklan (judul, link_url, media_url, jenis, aktif) values
  ('Klepon Ceria (demo)', null, '/iklan-demo/klepon-ceria.png', 'foto', true),
  ('Cubit! Cubit! (demo)', null, '/iklan-demo/cubit-cubit.png', 'foto', true),
  ('Lapis Cilik (demo)', null, '/iklan-demo/lapis-cilik.png', 'foto', true);
