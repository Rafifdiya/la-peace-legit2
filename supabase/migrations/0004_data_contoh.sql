-- =================================================================
-- Jejak Jajan - data contoh (26 jajanan dari template dummy).
-- Jalankan setelah 0003. Cerita & resep masih contoh, ganti dengan data asli tim.
-- Hapus semua: delete from snacks where created_by is null;
-- =================================================================

begin;

-- Klepon
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('klepon', 'Klepon', array['Kelepon']::text[], (select id from provinces where nama = 'Jawa Tengah'),
  (select id from categories where nama = 'Kue basah'), 'Bola ketan isi gula merah, dibalur kelapa parut.', 'Klepon dikenal di Jawa Tengah sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'umum', 'approved', null, '2026-09-28');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'klepon'), 'Versi rumahan', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 45, 'mudah', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Klepon.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'klepon'), 'Pasar Tengah', 'Jawa Tengah', (select id from provinces where nama = 'Jawa Tengah'), 'kios_tetap', 'https://maps.google.com/?q=-7.15,110.14', -7.15, 110.14, '2026-02-11', '2026-02-11', 'https://gofood.co.id', true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'klepon'), 'Pedagang keliling depan sekolah', 'Jawa Tengah', (select id from provinces where nama = 'Jawa Tengah'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Kue Ape
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('kue-ape', 'Kue Ape', array['Kue Tetek', 'Serabi Jakarta']::text[], (select id from provinces where nama = 'DKI Jakarta'),
  (select id from categories where nama = 'Kue basah'), 'Kue tipis renyah di pinggir, empuk di tengah, warna hijau pandan.', 'Kue Ape dikenal di DKI Jakarta sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'mulai_langka', 'approved', null, '2026-09-27');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'kue-ape'), 'Versi Mbah Sri', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 60, 'sedang', null, false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Kue Ape.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-ape'), 'Pasar Jakarta', 'DKI Jakarta', (select id from provinces where nama = 'DKI Jakarta'), 'kios_tetap', 'https://maps.google.com/?q=-6.2,106.82', -6.19, 106.83, '2026-09-20', '2026-09-20', null, true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-ape'), 'Pedagang keliling depan sekolah', 'DKI Jakarta', (select id from provinces where nama = 'DKI Jakarta'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Kue Rangi
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('kue-rangi', 'Kue Rangi', array['Sagu Rangi']::text[], (select id from provinces where nama = 'DKI Jakarta'),
  (select id from categories where nama = 'Kue kering'), 'Kelapa dan sagu dipanggang di cetakan, disiram gula merah kental.', 'Kue Rangi dikenal di DKI Jakarta sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'hampir_punah', 'approved', null, '2026-09-26');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-rangi'), 'Pasar Jakarta', 'DKI Jakarta', (select id from provinces where nama = 'DKI Jakarta'), 'kios_tetap', 'https://maps.google.com/?q=-6.2,106.82', -6.180000000000001, 106.83999999999999, '2026-02-11', '2026-02-11', null, true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-rangi'), 'Pedagang keliling depan sekolah', 'DKI Jakarta', (select id from provinces where nama = 'DKI Jakarta'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Kue Cucur
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('kue-cucur', 'Kue Cucur', array['Cucur']::text[], (select id from provinces where nama = 'DKI Jakarta'),
  (select id from categories where nama = 'Gorengan'), 'Kue goreng bertopi dari tepung beras dan gula merah.', 'Kue Cucur dikenal di DKI Jakarta sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'mulai_langka', 'approved', null, '2026-09-25');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'kue-cucur'), 'Versi Mbah Sri', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 90, 'mudah', null, false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Kue Cucur.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

-- Getuk Lindri
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('getuk-lindri', 'Getuk Lindri', array['Gethuk']::text[], (select id from provinces where nama = 'Jawa Tengah'),
  (select id from categories where nama = 'Kue basah'), 'Singkong tumbuk berwarna-warni, ditabur kelapa parut.', 'Getuk Lindri dikenal di Jawa Tengah sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'umum', 'approved', null, '2026-09-24');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'getuk-lindri'), 'Versi rumahan', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 45, 'sedang', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Getuk Lindri.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'getuk-lindri'), 'Pasar Tengah', 'Jawa Tengah', (select id from provinces where nama = 'Jawa Tengah'), 'kios_tetap', 'https://maps.google.com/?q=-7.15,110.14', -7.11, 110.15, '2026-02-11', '2026-02-11', null, true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'getuk-lindri'), 'Pedagang keliling depan sekolah', 'Jawa Tengah', (select id from provinces where nama = 'Jawa Tengah'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Gatot
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('gatot', 'Gatot', array[]::text[], (select id from provinces where nama = 'DI Yogyakarta'),
  (select id from categories where nama = 'Kue basah'), 'Gaplek singkong kukus bertekstur kenyal, disajikan dengan kelapa.', 'Gatot dikenal di DI Yogyakarta sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'mulai_langka', 'approved', null, '2026-09-23');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'gatot'), 'Pasar Yogyakarta', 'DI Yogyakarta', (select id from provinces where nama = 'DI Yogyakarta'), 'kios_tetap', 'https://maps.google.com/?q=-7.8,110.36', -7.8, 110.38, '2026-09-20', '2026-09-20', null, true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'gatot'), 'Pedagang keliling depan sekolah', 'DI Yogyakarta', (select id from provinces where nama = 'DI Yogyakarta'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Kue Putu
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('kue-putu', 'Kue Putu', array['Putu Bambu']::text[], (select id from provinces where nama = 'Jawa Timur'),
  (select id from categories where nama = 'Kue basah'), 'Tepung beras isi gula merah dikukus dalam tabung bambu, bersiul.', 'Kue Putu dikenal di Jawa Timur sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'mulai_langka', 'approved', null, '2026-09-22');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'kue-putu'), 'Versi rumahan', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 75, 'mudah', null, false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Kue Putu.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-putu'), 'Pasar Timur', 'Jawa Timur', (select id from provinces where nama = 'Jawa Timur'), 'kios_tetap', 'https://maps.google.com/?q=-7.25,112.75', -7.24, 112.75, '2026-02-11', '2026-02-11', 'https://gofood.co.id', true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-putu'), 'Pedagang keliling depan sekolah', 'Jawa Timur', (select id from provinces where nama = 'Jawa Timur'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Lupis
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('lupis', 'Lupis', array['Lopis']::text[], (select id from provinces where nama = 'Jawa Barat'),
  (select id from categories where nama = 'Kue basah'), 'Ketan segitiga dibungkus daun pisang, disiram kinca.', 'Lupis dikenal di Jawa Barat sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'umum', 'approved', null, '2026-09-21');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'lupis'), 'Versi Mbah Sri', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 90, 'sedang', null, false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Lupis.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

-- Kue Gandos
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('kue-gandos', 'Kue Gandos', array['Bandros']::text[], (select id from provinces where nama = 'Jawa Barat'),
  (select id from categories where nama = 'Kue basah'), 'Adonan kelapa dan tepung beras dipanggang di cetakan setengah lingkaran.', 'Kue Gandos dikenal di Jawa Barat sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'mulai_langka', 'approved', null, '2026-09-20');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-gandos'), 'Pasar Barat', 'Jawa Barat', (select id from provinces where nama = 'Jawa Barat'), 'kios_tetap', 'https://maps.google.com/?q=-6.91,107.61', -6.88, 107.63, '2026-02-11', '2026-02-11', null, true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-gandos'), 'Pedagang keliling depan sekolah', 'Jawa Barat', (select id from provinces where nama = 'Jawa Barat'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Clorot
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('clorot', 'Clorot', array['Celorot']::text[], (select id from provinces where nama = 'Jawa Tengah'),
  (select id from categories where nama = 'Kue basah'), 'Adonan manis dalam gulungan janur kerucut.', 'Clorot dikenal di Jawa Tengah sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'hampir_punah', 'approved', null, '2026-09-19');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'clorot'), 'Versi Mbah Sri', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 60, 'mudah', null, false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Clorot.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'clorot'), 'Pasar Tengah', 'Jawa Tengah', (select id from provinces where nama = 'Jawa Tengah'), 'kios_tetap', 'https://maps.google.com/?q=-7.15,110.14', -7.11, 110.14, '2026-09-20', '2026-09-20', 'https://gofood.co.id', true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'clorot'), 'Pedagang keliling depan sekolah', 'Jawa Tengah', (select id from provinces where nama = 'Jawa Tengah'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Kue Jongkong
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('kue-jongkong', 'Kue Jongkong', array[]::text[], (select id from provinces where nama = 'Kepulauan Riau'),
  (select id from categories where nama = 'Kue basah'), 'Puding tepung beras berlapis gula merah dalam daun pisang.', 'Kue Jongkong dikenal di Kepulauan Riau sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'hampir_punah', 'approved', null, '2026-09-18');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'kue-jongkong'), 'Versi rumahan', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 75, 'sedang', null, true, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Kue Jongkong.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

-- Bingka Kentang
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('bingka-kentang', 'Bingka Kentang', array['Bingka']::text[], (select id from provinces where nama = 'Kalimantan Selatan'),
  (select id from categories where nama = 'Kue panggang'), 'Kue panggang lembut berbentuk bunga dari kentang dan santan.', 'Bingka Kentang dikenal di Kalimantan Selatan sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'mulai_langka', 'approved', null, '2026-09-17');

-- Kue Lumpang
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('kue-lumpang', 'Kue Lumpang', array[]::text[], (select id from provinces where nama = 'Sumatera Utara'),
  (select id from categories where nama = 'Kue basah'), 'Kue kukus berbentuk mangkuk kecil dengan kelapa parut.', 'Kue Lumpang dikenal di Sumatera Utara sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'hampir_punah', 'approved', null, '2026-09-16');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'kue-lumpang'), 'Versi rumahan', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 45, 'mudah', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Kue Lumpang.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

-- Lemang
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('lemang', 'Lemang', array[]::text[], (select id from provinces where nama = 'Sumatera Barat'),
  (select id from categories where nama = 'Olahan ketan'), 'Ketan santan dimasak dalam bambu di atas bara api.', 'Lemang dikenal di Sumatera Barat sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'umum', 'approved', null, '2026-09-15');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'lemang'), 'Versi Mbah Sri', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 60, 'sedang', null, false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Lemang.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'lemang'), 'Pasar Barat', 'Sumatera Barat', (select id from provinces where nama = 'Sumatera Barat'), 'kios_tetap', 'https://maps.google.com/?q=-0.95,100.35', -0.9199999999999999, 100.36, '2026-09-20', '2026-09-20', null, true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'lemang'), 'Pedagang keliling depan sekolah', 'Sumatera Barat', (select id from provinces where nama = 'Sumatera Barat'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Lapek Bugis
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('kue-lapek-bugis', 'Lapek Bugis', array['Kue Bugis']::text[], (select id from provinces where nama = 'Sumatera Barat'),
  (select id from categories where nama = 'Kue basah'), 'Ketan hitam isi kelapa gula merah, dibungkus daun pisang.', 'Lapek Bugis dikenal di Sumatera Barat sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'mulai_langka', 'approved', null, '2026-09-14');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-lapek-bugis'), 'Pasar Barat', 'Sumatera Barat', (select id from provinces where nama = 'Sumatera Barat'), 'kios_tetap', 'https://maps.google.com/?q=-0.95,100.35', -0.9099999999999999, 100.36999999999999, '2026-02-11', '2026-02-11', null, true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-lapek-bugis'), 'Pedagang keliling depan sekolah', 'Sumatera Barat', (select id from provinces where nama = 'Sumatera Barat'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Barongko
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('barongko', 'Barongko', array[]::text[], (select id from provinces where nama = 'Sulawesi Selatan'),
  (select id from categories where nama = 'Kue basah'), 'Pisang dihaluskan dengan telur dan santan, dikukus dalam daun pisang.', 'Barongko dikenal di Sulawesi Selatan sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'mulai_langka', 'approved', null, '2026-09-13');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'barongko'), 'Versi Mbah Sri', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 90, 'mudah', null, true, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Barongko.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

-- Kue Bagea
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('kue-bagea', 'Kue Bagea', array['Bagea']::text[], (select id from provinces where nama = 'Maluku'),
  (select id from categories where nama = 'Kue kering'), 'Kue sagu keras beraroma kenari dan cengkih.', 'Kue Bagea dikenal di Maluku sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'hampir_punah', 'approved', null, '2026-09-12');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'kue-bagea'), 'Versi rumahan', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 45, 'sedang', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Kue Bagea.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

-- Sagu Lempeng
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('papeda-bakar', 'Sagu Lempeng', array['Sagu Bakar']::text[], (select id from provinces where nama = 'Papua'),
  (select id from categories where nama = 'Kue kering'), 'Lempengan sagu dipanggang, teman minum teh.', 'Sagu Lempeng dikenal di Papua sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'mulai_langka', 'approved', null, '2026-09-11');

-- Jaja Laklak
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('jaja-laklak', 'Jaja Laklak', array['Laklak']::text[], (select id from provinces where nama = 'Bali'),
  (select id from categories where nama = 'Kue basah'), 'Serabi kecil hijau dengan kelapa parut dan gula merah cair.', 'Jaja Laklak dikenal di Bali sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'umum', 'approved', null, '2026-09-10');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'jaja-laklak'), 'Versi rumahan', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 75, 'mudah', null, false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Jaja Laklak.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'jaja-laklak'), 'Pasar Bali', 'Bali', (select id from provinces where nama = 'Bali'), 'kios_tetap', 'https://maps.google.com/?q=-8.65,115.22', -8.620000000000001, 115.22, '2026-02-11', '2026-02-11', 'https://gofood.co.id', true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'jaja-laklak'), 'Pedagang keliling depan sekolah', 'Bali', (select id from provinces where nama = 'Bali'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Jaja Uli
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('jaja-uli', 'Jaja Uli', array[]::text[], (select id from provinces where nama = 'Bali'),
  (select id from categories where nama = 'Olahan ketan'), 'Ketan tumbuk padat, biasa dihidangkan saat upacara.', 'Jaja Uli dikenal di Bali sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'mulai_langka', 'approved', null, '2026-09-09');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'jaja-uli'), 'Versi Mbah Sri', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 90, 'sedang', null, false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Jaja Uli.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

-- Kue Satu
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('kue-satu', 'Kue Satu', array['Koya']::text[], (select id from provinces where nama = 'Jawa Timur'),
  (select id from categories where nama = 'Kue kering'), 'Kue kacang hijau sangrai dicetak motif, lumer di mulut.', 'Kue Satu dikenal di Jawa Timur sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'mulai_langka', 'approved', null, '2026-09-08');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-satu'), 'Pasar Timur', 'Jawa Timur', (select id from provinces where nama = 'Jawa Timur'), 'kios_tetap', 'https://maps.google.com/?q=-7.25,112.75', -7.25, 112.77, '2026-02-11', '2026-02-11', null, true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-satu'), 'Pedagang keliling depan sekolah', 'Jawa Timur', (select id from provinces where nama = 'Jawa Timur'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Gemblong
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('gemblong', 'Gemblong', array['Jemblem']::text[], (select id from provinces where nama = 'Jawa Barat'),
  (select id from categories where nama = 'Gorengan'), 'Ketan goreng berbalut gula merah karamel.', 'Gemblong dikenal di Jawa Barat sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'umum', 'approved', null, '2026-09-07');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'gemblong'), 'Versi Mbah Sri', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 60, 'mudah', null, false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Gemblong.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'gemblong'), 'Pasar Barat', 'Jawa Barat', (select id from provinces where nama = 'Jawa Barat'), 'kios_tetap', 'https://maps.google.com/?q=-6.91,107.61', -6.9, 107.61, '2026-09-20', '2026-09-20', 'https://gofood.co.id', true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'gemblong'), 'Pedagang keliling depan sekolah', 'Jawa Barat', (select id from provinces where nama = 'Jawa Barat'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Kue Pancong
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('kue-pancong', 'Kue Pancong', array['Bandros Betawi']::text[], (select id from provinces where nama = 'DKI Jakarta'),
  (select id from categories where nama = 'Kue basah'), 'Kue kelapa setengah matang, lembek di dalam.', 'Kue Pancong dikenal di DKI Jakarta sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'mulai_langka', 'approved', null, '2026-09-06');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'kue-pancong'), 'Versi rumahan', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 75, 'sedang', null, false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Kue Pancong.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-pancong'), 'Pasar Jakarta', 'DKI Jakarta', (select id from provinces where nama = 'DKI Jakarta'), 'kios_tetap', 'https://maps.google.com/?q=-6.2,106.82', -6.180000000000001, 106.83, '2026-02-11', '2026-02-11', null, true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-pancong'), 'Pedagang keliling depan sekolah', 'DKI Jakarta', (select id from provinces where nama = 'DKI Jakarta'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Wajik Klethik
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('wajik-klethik', 'Wajik Klethik', array[]::text[], (select id from provinces where nama = 'Jawa Timur'),
  (select id from categories where nama = 'Olahan ketan'), 'Ketan gula merah kering yang dibungkus kulit jagung.', 'Wajik Klethik dikenal di Jawa Timur sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'hampir_punah', 'approved', null, '2026-09-05');

-- Kue Sengkulun
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('kue-sengkulun', 'Kue Sengkulun', array[]::text[], (select id from provinces where nama = 'DKI Jakarta'),
  (select id from categories where nama = 'Kue basah'), 'Kue ketan kenyal berwarna, kini hampir tak ada yang menjual.', 'Kue Sengkulun dikenal di DKI Jakarta sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'punah', 'approved', null, '2026-09-04');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'kue-sengkulun'), 'Versi rumahan', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 45, 'mudah', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', false, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Kue Sengkulun.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-sengkulun'), 'Pasar Jakarta', 'DKI Jakarta', (select id from provinces where nama = 'DKI Jakarta'), 'kios_tetap', 'https://maps.google.com/?q=-6.2,106.82', -6.16, 106.82, '2026-02-11', '2026-02-11', 'https://gofood.co.id', true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'kue-sengkulun'), 'Pedagang keliling depan sekolah', 'DKI Jakarta', (select id from provinces where nama = 'DKI Jakarta'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

-- Dodol Garut
insert into snacks (slug, nama, nama_lain, province_id, category_id, deskripsi_singkat, cerita, rarity_awal, status, created_by, created_at)
values ('dodol-garut', 'Dodol Garut', array['Dodol']::text[], (select id from provinces where nama = 'Jawa Barat'),
  (select id from categories where nama = 'Kue basah'), 'Dodol ketan manis kenyal khas Garut.', 'Dodol Garut dikenal di Jawa Barat sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.', 'umum', 'approved', null, '2026-09-03');

with r as (
  insert into recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, status, created_by)
  values ((select id from snacks where slug = 'dodol-garut'), 'Versi Mbah Sri', '["250 g tepung beras","150 g gula merah","200 ml santan","1/2 butir kelapa parut","Sejumput garam"]'::jsonb, 20, 60, 'sedang', null, true, 'approved', null)
  returning id
)
insert into recipe_steps (recipe_id, urutan, instruksi) values
  ((select id from r), 1, 'Siapkan semua bahan Dodol Garut.'),
  ((select id from r), 2, 'Campur tepung dan santan hingga adonan halus.'),
  ((select id from r), 3, 'Masak sesuai cara tradisional (kukus/panggang/goreng).'),
  ((select id from r), 4, 'Angkat, dinginkan sebentar, lalu sajikan.');

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'dodol-garut'), 'Pasar Barat', 'Jawa Barat', (select id from provinces where nama = 'Jawa Barat'), 'kios_tetap', 'https://maps.google.com/?q=-6.91,107.61', -6.91, 107.62, '2026-09-20', '2026-09-20', null, true, 'approved', null);

insert into sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, izin_publik, status, created_by)
values ((select id from snacks where slug = 'dodol-garut'), 'Pedagang keliling depan sekolah', 'Jawa Barat', (select id from provinces where nama = 'Jawa Barat'), 'keliling', null, null, null, '2026-08-02', '2026-08-02', null, true, 'approved', null);

commit;
