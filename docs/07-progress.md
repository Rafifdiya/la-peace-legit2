# Progress Log - Jejak Jajan

Catatan: jam untuk entri lama tidak tercatat, jadi hanya tanggal. Entri baru ditulis dengan jam.

1. **Sebelum 2026-10-07** - Eksplorasi ide (jualan/hampers, marketplace, donasi adopsi penjual, matching penerus) lalu memilih web arsip jajanan tradisional berbasis komunitas.
2. **Sebelum 2026-10-07** - Membuat dokumen awal: docs/01 ide & fitur, 02 survei & wawancara, 03 desain (revisi 1), 04 rencana software engineering.
3. **Sebelum 2026-10-07** - Repo pertama (la-peace-legit) dihapus karena riwayat commit tidak bersih; diganti repo la-peace-legit2 (README + docs).
4. **2026-10-07** - Review Figma "Jejak Jajan": page Design System (warna, font, ~30 komponen) dan page Desktop (beranda, katalog, detail, upload, profil, request, admin, overlay, toast).
5. **2026-10-07** - Revisi 2 docs/03-desain.txt mengikuti Figma: nama web jadi Jejak Jajan, sitemap & flow disesuaikan, daftar komponen, design token, schema ditambah, rencana template dasar (UI + data dummy, desktop dulu).
6. **2026-10-07** - Commit revisi 2 di branch `docs/desain-revisi-2`, push, dan buat PR ke main lewat browser.
7. **2026-10-07** - Install GitHub CLI (`gh`); login dari terminal aplikasi gagal, belum beres. Repo diubah jadi private sementara.
8. **2026-10-08** - Menyusun teks presentasi progress (presentasi-progress.txt): opening, masalah, 3 ide ke 1 solusi, Robust Design (CNSY), Value Proposition, demo Figma, penutup.
9. **2026-10-08** - Presentasi progress ke dosen & teman, demo pakai prototype Figma.
10. **2026-10-09** - Feedback presentasi diklasifikasi jadi feedback grid + jawaban per tema (docs/05-feedback-presentasi-1.txt). Isu utama: model bisnis/keuntungan.
11. **2026-10-09** - Revisi 3 docs/03-desain.txt dari feedback: link pesan online di lokasi, penilaian resep berhasil/kurang berhasil, badge terverifikasi, filter kata kasar, kriteria masuk katalog. (Di-commit di entri 14.)
12. **2026-10-09** - Pengaturan commit & PR dirapikan.
13. **2026-10-09** - Membuat PROGRESS.md ini untuk mencatat progress.
14. **2026-10-09 18:24** - Commit `909e321` (docs/03 revisi 3 + docs/05) di branch `docs/desain-revisi-2` dan push. PR otomatis ikut ter-update, belum merge.
15. **2026-10-09 18:27** - Repo la-peace-legit2 diubah jadi public (sebelumnya dicek: tidak ada data pribadi/atribusi di semua commit).
16. **2026-10-09 18:29** - PR #1 `docs/desain-revisi-2` di-merge ke main (`2b1424f`), main lokal di-pull.
17. **2026-10-09 18:34** - Survei & GitHub Issues dibatalkan (keputusan tim). Membuat docs/00-ringkasan-project.txt (di-commit di entri 18).
18. **2026-10-09 18:51** - Branch `feat/template-dasar`: commit ringkasan (`ddb3e04`). Setup Next.js 16.4 + Tailwind 4 + data dummy: beranda, katalog (filter + infinite scroll), detail jajanan (mini map Leaflet lazy), upload langkah 1 (kompresi foto di browser), tentang. Fokus ringan untuk HP RAM 2-4 GB. Build & lint lulus. Kode di-commit (`7f03067`).
19. **2026-10-09 18:55** - Push branch `feat/template-dasar` (2 commit). PR #2 dibuat lewat browser.
20. **2026-10-09 19:04** - PR #2 `feat/template-dasar` di-merge ke main, main lokal di-pull. `gh` sudah login (Rafifdiya), PR berikutnya bisa dari terminal.
21. **2026-10-09 19:13** - Branch `feat/template-lanjutan`: halaman request (list + detail), profil (publik + saya: tab Kontribusi/Tersimpan/Status kiriman), admin (Kiriman/Laporan/Kategori + overlay Tolak), overlay Masuk (`<dialog>` bawaan browser), BottomNav mobile. Build & lint lulus, dicek screenshot mobile 390px & desktop. Di-commit (`3bf93b9`).
22. **2026-10-09 20:33** - Push `feat/template-lanjutan` dan buat PR #3 dari terminal (gh). Belum merge.
23. **2026-10-09 20:34** - PR #3 `feat/template-lanjutan` di-merge ke main (`ca3d3bf`), main lokal di-pull.
24. **2026-10-09 21:05** - Project Supabase dibuat (region Asia-Pacific, automatic RLS aktif); URL + publishable key di `.env.local` (tidak di-commit). Branch `feat/supabase`: install `@supabase/supabase-js` + `@supabase/ssr`, client browser/server, `src/proxy.ts` untuk refresh sesi, migration SQL `0001_schema_awal.sql` (15 tabel + RLS + trigger profil + view label kelangkaan + bucket foto 2 MB) dan `0002_data_referensi.sql` (38 provinsi, 6 kategori). Build & lint lulus. SQL dijalankan di Supabase (15 tabel + view, 38 provinsi).
25. **2026-10-09 21:16** - Commit `701ca13` di `feat/supabase`, push, PR #4 dibuat dari terminal. Belum merge.
26. **2026-10-09 21:20** - PR #4 `feat/supabase` di-merge ke main.
27. **2026-10-09 21:30** - Branch `feat/auth-email`: login email magic link (overlay Masuk aktif, route `/auth/callback`), navbar tampil Masuk / Admin / Keluar / Profil sesuai status login. Login Google ditunda. Build & lint lulus. Dites login sungguhan: berhasil.
28. **2026-10-09 21:40** - Commit `92d0931` di `feat/auth-email`, push, PR #5 dibuat dari terminal. Belum merge.
29. **2026-10-09 21:45** - PR #5 `feat/auth-email` di-merge ke main, main lokal di-pull.
30. **2026-10-09 21:55** - Membuat docs/06-model-bisnis.txt: Business Model Canvas, pendapatan bertahap (afiliasi -> sponsor & e-book -> pemda & kelas), estimasi biaya, ilustrasi titik impas, risiko, jawaban siap untuk dosen, kerangka 1 slide. Commit `3d6c49c`, push, PR #6 dibuat dari terminal. Belum merge.
31. **2026-10-13** - Branch `feat/data-supabase`: katalog, detail, beranda, statistik baca dari Supabase (view `snack_cards`, client publik tanpa cookie + `"use cache"`). Migration `0003_view_katalog.sql` (view katalog, kategori Olahan ketan, kolom `rarity_awal`) dan `0004_data_contoh.sql` (26 jajanan dummy + resep + lokasi). SQL 0003 & 0004 dijalankan di Supabase (sukses). Build & lint lulus, dicek: urut langka, cari nama lain (serabi -> Kue Ape), detail resep + lokasi. Commit `3d6c49c`, push, PR #6 dibuat dari terminal.
32. **2026-10-13** - PR #6 `feat/data-supabase` di-merge ke main (`8dacdd7`), main lokal di-pull.
33. **2026-10-13** - Branch `feat/upload-supabase`: form kontribusi 7 langkah (draft otomatis di perangkat, cek duplikat nama, foto dikompres lalu diunggah ke Storage, foto & video per langkah), kirim lewat fungsi SQL `kirim_jajanan` (satu transaksi, status pending). Admin: cek role, daftar kiriman asli + pratinjau, Setujui/Tolak (alasan wajib) lewat `moderasi_jajanan` + moderation_logs, tanda filter kata kasar. Profil saya: tab Status kiriman dari Supabase. Migration `0005_kirim_moderasi.sql`. Build & lint lulus. SQL 0005 sudah dijalankan di Supabase. Belum: set akun admin, uji alur (2 akun), commit & PR #7 (belum di-commit, ada di branch lokal).
34. **2026-10-14** - Hapus semua data dummy di kode (`src/data/dummy.ts`, `snacks.ts`). Profil (saya & publik), request, dan laporan admin sekarang baca Supabase (`src/lib/komunitas.ts`), tampil kosong kalau belum ada data. Halaman profil saya wajib login (sebelumnya menampilkan status dummy saat keluar) + perbaikan error `Date.now()` saat prerender. Akun admin sudah di-set. Build & lint lulus. Belum: hapus 26 jajanan contoh di Supabase, uji alur 2 akun, commit.
35. **2026-10-14** - Login diganti email + password (Masuk / Daftar) di overlay Masuk, sementara tanpa verifikasi email (Confirm email dimatikan di Supabase). Magic link tidak dipakai lagi.
36. **2026-10-14** - Form Daftar ditambah Nama, Username (cek format & belum dipakai), dan Ulangi password; username & nama langsung tersimpan ke profil.
37. **2026-10-14** - Nama saat daftar wajib unik (huruf besar/kecil dianggap sama) dan tanpa angka; migration `0006_nama_unik.sql` (index unik + trigger profil). Overlay Masuk selalu kembali ke mode Masuk setiap ditutup.
38. **2026-10-14** - Overlay Masuk/Daftar: tidak tertutup saat klik di luar kotak (hanya tombol Tutup atau Esc); tombol tutup jadi ikon X + tulisan "Tutup", hover merah transparan. Username boleh diketik huruf besar (otomatis jadi huruf kecil).
39. **2026-10-14** - Foto utama di form upload bisa ditempel langsung dengan Ctrl+V (gambar dari clipboard ikut dikompres & diunggah). Nama saat daftar: spasi ganda dirapikan.
40. **2026-10-14** - Jarak antar kata di semua kolom isian (input & textarea) dilebarkan sedikit (`word-spacing: 0.08em`).
41. **2026-10-14** - Profil saya untuk admin: tab baru "Moderasi" (daftar kiriman + Setujui/Tolak, sama seperti /admin) dan link ke dashboard admin. Daftar kiriman dipisah jadi komponen `KirimanList` supaya dipakai di dua tempat.
42. **2026-10-14** - Fix error "Date.now() while prerendering" di /admin: tambah `await connection()` (halaman dirender per-request karena butuh sesi login).
43. **2026-10-14** - Moderasi disatukan di Dashboard /admin: tab "Moderasi" di profil dihapus. Tombol Admin di profil admin kini menampilkan jumlah kiriman menunggu, mis. "Admin (3 menunggu)". Link Admin di navbar tetap ada.
44. **2026-10-14** - Profil admin: bagian "Menunggu moderasi (N)" selalu tampil di atas tab, berisi 3 kiriman menunggu terbaru dengan tombol Setujui/Tolak. Lebih dari 3: link "Lihat semua (N)" ke /admin. Tombol Admin kembali tanpa angka.
45. **2026-10-14** - Form upload: waktu resep jadi dropdown rentang (< 10 menit, 10-20, 20-30, 30-60 menit, 1-2 jam, 2-4 jam, > 4 jam), disimpan sebagai batas atas menit; detail jajanan menampilkan label rentang. Profil admin: link "Lihat semua" jadi tombol di kanan bawah kotak moderasi.
46. **2026-10-14** - Tombol "Admin" di header profil admin diganti namanya jadi "Dashboard Moderasi".
47. **2026-10-14** - Beranda: section "Jelajahi per Daerah" (38 tombol provinsi) dihapus, diganti dropdown "Semua daerah" di kotak pencarian hero; hasil diarahkan ke katalog dengan filter provinsi.
48. **2026-10-14** - Navigasi desktop pindah ke sidebar kiri (mirip Cookpad): logo + menu ikon (Beranda, Katalog, Request, Kontribusi, Tentang) dengan penanda halaman aktif. Bar atas tinggal Masuk/Profil + tombol Kontribusi. Mobile tetap bottom nav. Ukuran teks dasar dinaikkan (17px, 18px di layar lebar). Dicek lewat screenshot desktop & mobile.
49. **2026-10-14** - Font ketiga: Caveat (tulisan tangan, weight 600) sebagai aksen. Dipakai untuk tagline beranda "dari dapur nenek, untuk generasi berikutnya", subjudul ajakan kontribusi, dan deskripsi singkat di detail jajanan (gaya kutipan). Judul tetap Fraunces, isi tetap Plus Jakarta Sans. Class baru: `font-hand`.
50. **2026-10-14** - Menu sidebar & tombol "+ Kontribusi" pakai font tulisan tangan (Caveat bold 700), tiap menu punya border oranye transparan (orange-500/40), halaman aktif berlatar oranye tipis.
51. **2026-10-14** - Koreksi entri 50: gaya tulisan tangan + bingkai oranye hanya untuk menu Kontribusi (sidebar & tombol atas); Beranda, Katalog, Request, Tentang kembali normal. Ukuran sidebar & bar atas diperbesar ±5% (lebar sidebar, teks, ikon, tombol Masuk/Kontribusi).
52. **2026-10-14** - Sidebar & bar atas diperbesar lagi ±10% (lebar sidebar 17.6rem, teks menu, ikon, logo, tombol Masuk/Kontribusi).
53. **2026-10-14** - Tombol "+ Kontribusi" di bar atas kembali ke font biasa (semibold, ukuran setara tombol Masuk); bingkai oranye tetap. Gaya tulisan tangan hanya di menu Kontribusi sidebar.
54. **2026-10-14** - Tombol "+ Kontribusi" bar atas tidak bold lagi (font normal).
55. **2026-10-14** - Tagline beranda "dari dapur nenek, untuk generasi berikutnya" diberi animasi mesin ketik (CSS murni: clip-path steps(42), 2.6 detik, kursor berkedip). Tetap jalan walau mode "kurangi animasi" aktif (Windows Animation effects mati di laptop user, penyebab animasi tidak terlihat).
56. **2026-10-14** - Teks isi diperbesar 10%: token Tailwind --text-xs/sm/base/lg dinaikkan 10% di globals.css (paragraf, tombol, form, kartu, label). Judul (text-xl ke atas) tidak berubah.
57. **2026-10-14** - Subjudul beranda ("Arsip jajanan tradisional...") diperbesar 20% (1.32rem) dan area teks dilebarkan (max-w-2xl).
58. **2026-10-14** - Subjudul beranda warnanya digelapkan (text-ink, sama dengan teks utama).
59. **2026-10-14** - Kotak cari beranda: placeholder & ikon kaca pembesar digelapkan (placeholder text-ink/80, ikon text-ink).
60. **2026-10-14** - Link "Lihat semua" di beranda (Hampir Punah & Baru Ditambahkan) diperbesar 20% (1.155rem).
61. **2026-10-14** - Link "Lihat semua" beranda: selalu bergaris bawah (underline-offset-4) dan tebal (semibold); hover jadi cokelat lebih gelap.
62. **2026-10-14** - Kotak cari beranda diperbesar 20%: lebar, padding, ikon, teks input, dropdown daerah, dan tombol Cari.
63. **2026-10-14** - Ikon profil di bar atas (saat login) diganti jadi lingkaran cokelat (bg-brand) dengan ikon putih dan cincin oranye transparan, supaya tidak menyatu dengan background krem.
64. **2026-10-14** - Commit `d361b28` di branch `feat/upload-supabase` (semua pekerjaan entri 33-63, tanpa docs/06), push ke GitHub, PR #7 dibuat: https://github.com/Rafifdiya/la-peace-legit2/pull/7 (belum merge, tunggu tes alur kirim -> moderasi).
65. **2026-10-14** - Konteks project untuk tim: bagian "Konteks Project" ditambahkan di `AGENTS.md` (stack, struktur, setup, aturan) dan log progres versi bersih di `docs/07-progress.md`. Commit `ae500e3`, masuk PR #7. Mulai sekarang entri progres juga ditulis di docs/07.
66. **2026-10-14** - Keputusan: kiriman admin tetap harus disetujui admin, boleh admin itu sendiri. Migration `0007_admin_setujui_sendiri.sql`: policy update admin di snacks, snack_photos, recipes, sightings tidak lagi mengecualikan kiriman sendiri; pesan error moderasi_jajanan disesuaikan. Perlu dijalankan di SQL Editor.
67. **2026-10-14** - Beranda: section Hampir Punah & Baru Ditambahkan jadi carousel geser (maks. 8 jajanan, scroll-snap CSS + tombol panah di desktop, scrollbar disembunyikan). Kartu terakhir "Buka Katalog" (bingkai putus-putus oranye) ke katalog sesuai urutan section. Komponen baru `src/components/Carousel.tsx`.
68. **2026-10-14** - Carousel beranda: batang geser ditampilkan lagi dengan gaya tipis (jalur krem, pegangan cokelat), class `.geser` di globals.css.
69. **2026-10-14** - Fix peringatan LCP Next.js: 3 kartu pertama di carousel Hampir Punah (beranda) dan grid katalog memuat foto lebih awal (prop `utama` di SnackCard -> loading eager + preload); kartu lain tetap lazy.
70. **2026-10-14** - Halaman baru `/kelas` "Kelas Bersama Penjual" (segera hadir, docs/05 Tema A poin 5): penjelasan kelas dari penjual asli, bagi hasil, resep tetap gratis + form "Daftar minat" (email & jajanan, server action). Migration `0008_minat_kelas.sql` (tabel minat_kelas, email unik, insert terbuka, baca khusus admin). Menu "Kelas" di sidebar + link di footer; dashboard admin menampilkan jumlah "Minat kelas". Perlu jalankan 0008 di SQL Editor.
71. **2026-10-14** - docs/00-ringkasan-project.txt diperbarui: status development terkini, login email, model bisnis lengkap (afiliasi, kelas + daftar minat, freemium), fitur Kelas, catatan desain yang belum disinkron ke Figma, daftar dokumen 06-07 + AGENTS.md.
72. **2026-10-14** - Urutan sidebar: menu Kelas dipindah ke atas Kontribusi (Beranda, Katalog, Request, Kelas, Kontribusi, Tentang).
73. **2026-10-14** - Katalog: panel cari & filter diperbesar 15% (lebar 276px, teks, padding, input, tombol). Kotak cari jadi kapsul dengan ikon kaca pembesar & bingkai oranye. Urutkan tambah "Terlama" (created_at naik). Kartu jajanan: label kelangkaan tidak terpecah (nowrap) & pindah ke baris bawah bila sempit.
74. **2026-10-14** - Menu Kelas di sidebar: teks berkilau (kilatan emas-oranye kiri ke kanan tiap 3 detik, class `.kilau`, diadaptasi dari btn-shine Uiverse.io dengan warna Jejak Jajan), semibold, jarak antar huruf +2% (0.02em). Tetap jalan di mode kurangi animasi.
75. **2026-10-14** - Fitur "Request" diganti nama jadi "Tanya Jajanan" (sidebar, judul & title halaman; menu bawah HP "Tanya"). Tombol "Buat pertanyaan", "Jawab pertanyaan ini", "Semua pertanyaan", katalog kosong "Tanya ke komunitas". URL /request tetap.
76. **2026-10-14** - Halaman Tanya Jajanan: jarak kecil (mt-1.5) antara judul dan subjudul.
77. **2026-10-14** - Sidebar: slot banner sponsor (placeholder "Ruang iklan", label SPONSOR, bingkai putus-putus) di pojok bawah, untuk monetisasi sponsor brand bahan kue (docs/05 Tema A). Sidebar bisa di-scroll bila layar pendek.
78. **2026-10-14** - Iklan sponsor dikelola admin: tab "Iklan" di /admin (judul, link opsional, foto/GIF/video maks. 2 MB; foto > 2 MB dikompres otomatis, video & GIF harus sudah < 2 MB), pratinjau, aktif/nonaktif, hapus (file ikut dihapus). Sidebar menampilkan iklan aktif terbaru (video autoplay tanpa suara), placeholder bila kosong. Migration `0009_iklan.sql` (tabel iklan + bucket iklan, khusus admin). Perlu jalankan 0009 di SQL Editor.
79. **2026-10-14** - Animasi ketik tagline beranda berulang tiap 10 detik (siklus 10s: mengetik ~2.6 detik lalu diam), selain mulai ulang saat pindah halaman.
80. **2026-10-14** - Batal: animasi ketik tagline berulang tiap 10 detik (entri 79) dikembalikan ke semula, mengetik sekali saat halaman dibuka (permintaan user, perulangan tidak terlihat di browser user).
81. **2026-10-14** - Sidebar: "Tentang" jadi "Tentang kami", 5% lebih kecil (teks, ikon, padding) dan bergaris bawah. Scrollbar sidebar dibuat tipis.
82. **2026-10-14** - Halaman Tentang kami: section "Tim di balik Jejak Jajan" (TEMPLATE, 5 anggota contoh: nama, peran, bio 1 kalimat, foto opsional / inisial) + kontak tim. Data asli diisi nanti di array `tim` (src/app/tentang/page.tsx), tanpa kontak pribadi.
83. **2026-10-14** - Template tim di Tentang kami disesuaikan jadi 3 anggota (Project Lead & Bisnis, Frontend & UI/UX, Backend & Database), kartu vertikal 3 kolom.
84. **2026-10-14** - Tim di Tentang kami diisi data asli: Rafifdiya (Project Lead), Albert Mario L. (Business Management), Ahmad Daffa H. (Creative Design) + foto (disalin ke public/tim/, avatar bulat 80px dengan cincin oranye). Bio dibuat opsional.
85. **2026-10-15** - Freemium MODE DEMO (tanpa pembayaran): halaman `/premium` (tabel Gratis vs Premium, harga rencana Rp 15.000/bulan, tombol "Coba Premium 30 hari (demo)" / "Batalkan"), menu Premium di sidebar. Fitur premium: bebas iklan (slot sponsor disembunyikan) & koleksi tanpa batas (gratis maks. 3). Fitur baru Simpan + Koleksi di detail jajanan (simpan, centang koleksi, buat koleksi baru) dan tab Tersimpan di profil (chip per koleksi, hapus koleksi). Migration `0010_premium_koleksi.sql` (profiles.premium_sampai + proteksi, fungsi demo aktifkan/batalkan, tabel collections & collection_items + RLS, trigger batas 3 koleksi). Perlu jalankan 0010 di SQL Editor.
86. **2026-10-15** - Efek kilau (teks berkilau emas) dipindah dari menu Kelas ke menu Premium; Kelas kembali normal.
87. **2026-10-15** - Tabel /premium: tanda "tidak ada" (Bebas iklan di kolom Gratis) diganti ikon X merah.
88. **2026-10-15** - Kelas Bersama Penjual masuk Premium: baris baru di tabel /premium (Gratis: bayar per kelas; Premium: diskon 20% + daftar lebih dulu) dan catatan + link Premium di halaman /kelas.
89. **2026-10-15** - Fitur Premium tambahan (mode demo): Mode masak khusus Premium (layar penuh, langkah besar, layar tetap menyala), Unduh resep PDF (gratis 5x/minggu, Premium sepuasnya; migration 0011_unduh_pdf.sql), lencana + bingkai mahkota di avatar profil Premium (AvatarProfil.tsx, siap memakai public/lencana/bingkai-premium.png). Notifikasi masuk fitur gratis (segera hadir). Tabel /premium diperbarui.
90. **2026-10-15** - Admin otomatis Premium untuk uji fitur: migration 0012_admin_premium.sql (is_premium true untuk role admin), getSesi punya field premium, cek di browser (iklan, mode masak) ikut menganggap admin Premium, /premium menampilkan "Akun admin otomatis Premium".
91. **2026-10-15** - Tombol Keluar di navbar: muncul pop-up konfirmasi "Keluar dari akun?" (Batal / Ya, keluar); setelah keluar halaman dimuat ulang penuh ke beranda.
92. **2026-10-15** - Tombol Keluar di navbar berbentuk tombol kapsul (bingkai, saat hover jadi merah); tombol pop-up jadi "Tidak" / "Ya, keluar".
93. **2026-10-15** - Migration 0007-0012 sudah dijalankan di Supabase. Dicek: tabel minat_kelas, iklan, collections, unduhan_pdf ada; is_premium admin = true, user biasa = false; lencana mahkota + label Premium tampil di profil admin.
94. **2026-10-15** - Pengaturan profil (/profil/saya/pengaturan, tombol pensil di profil, untuk semua user): ganti foto profil (lebih dari 2 MB dikompres otomatis, bucket avatar), username, email, password (wajib password lama). Nama asli dikunci. Migration 0013_pengaturan_profil.sql (trigger kunci nama + bucket avatar). Avatar profil menampilkan foto bila ada.
95. **2026-10-15** - Pengaturan profil: foto profil +20% (80px -> 96px), teks isi +10% (kelas .teks-110).
96. **2026-10-15** - Pengaturan profil dibuat melebar: lebar maks. 5xl, kotak tersusun 2 kolom di layar lebar (Foto | Nama asli, Username | Email), Password selebar penuh dengan 3 isian berjajar. HP tetap 1 kolom.
97. **2026-10-15** - Fix foto profil blur: foto tidak persegi sebelumnya diperkecil ke lebar 80-96px lalu dibesarkan untuk mengisi lingkaran; sekarang diminta versi 384px.
98. **2026-10-15** - Tombol melayang "Kontak admin" di pojok kanan bawah semua halaman (ikon bubble chat + telepon, tulisan muncul saat hover; di HP di atas menu bawah). Tujuan diatur lewat env NEXT_PUBLIC_KONTAK_ADMIN (wa.me / mailto), cadangan ke /tentang#kontak.
99. **2026-10-15** - Foto profil tampil di ikon profil navbar atas semua halaman (langsung berganti setelah foto diubah). Ukuran avatar +20%: ikon navbar (34px -> 41px), avatar halaman profil (80px -> 96px, bingkai Premium ikut). Halaman Pengaturan profil tidak diubah.
100. **2026-10-15** - Hover ikon profil di navbar memunculkan tulisan "Profil akun" di bawahnya (gaya sama dengan Kontak admin), kecuali di halaman Pengaturan profil.
101. **2026-10-15** - Tulisan "Profil akun" dibuat tepat di tengah bawah avatar navbar.
102. **2026-10-15** - Rencana pengembangan Kelas Bersama Penjual (3 tahap: demo expo, setelah expo, bisnis nyata) ditambahkan ke docs/01 bagian Nice to have poin 18.
103. **2026-10-15** - Lencana "Prem" (kapsul, teks berkilau seperti menu Premium di sidebar) di pojok kanan bawah avatar navbar untuk akun Premium/admin, di semua halaman; ikut berubah saat Premium demo diaktifkan/dibatalkan.
104. **2026-10-15** - Lencana "Prem" navbar jadi latar hitam dengan teks emas berkilau (kelas .kilau-emas). Lencana di halaman profil tidak diubah.
105. **2026-10-15** - Lencana "Prem" navbar: teks putih dengan kilatan emas.
106. **2026-10-15** - Lencana "Prem" navbar dikembalikan ke versi awal (latar putih, bingkai emas, teks cokelat berkilau seperti menu Premium); varian .kilau-emas dihapus.
107. **2026-10-15** - Motif batik kawung samar (SVG ringan): latar hero beranda (memudar ke tepi, diperluas) dan footer + garis tepi belah ketupat di atas footer. Opacity dinaikkan 15% (hero 0.1265, footer 0.092).
108. **2026-10-15** - Label "Premium" di samping nama pada halaman profil diberi efek kilau seperti menu Premium di sidebar.
109. **2026-10-15** - Link "Kembali ke profil" di Pengaturan profil +20% (0.9625rem -> 1.155rem, ikon 16 -> 19px).
110. **2026-10-15** - Kartu tim di /tentang diganti gaya kartu profil (adaptasi "card" Uiverse.io, 1osm): pita cokelat berisi foto kotak membulat + nama + peran, kotak bio, garis + ikon Instagram/LinkedIn/Email (redup sampai link diisi). Halaman Tentang dilebarkan ke max-w-3xl.
111. **2026-10-15** - Halaman Kelas: teks isi +10% (kelas .teks-110).
112. **2026-10-15** - Link "Premium" di catatan diskon halaman Kelas diberi efek kilau.
113. **2026-10-15** - Tagline beranda jadi "dari dapur nenek, untuk generasi berikutnya.." (2 titik di akhir), ukuran +5%, animasi ketik disesuaikan 44 huruf.
114. **2026-10-15** - Slot sponsor sidebar: maks. 4 iklan aktif, bergantian otomatis tiap 6 detik (transisi memudar, titik navigasi, berhenti saat di-hover). SlideIklan.tsx; tambah/aktifkan iklan ditolak bila sudah 4 aktif.
115. **2026-10-15** - Saklar "Tampilkan iklan di sidebar saya" di tab Iklan /admin: admin (otomatis Premium, bebas iklan) bisa memunculkan iklan di sidebarnya sendiri untuk dicek. Disimpan per browser (localStorage), tidak memengaruhi pengunjung lain.
116. **2026-10-15** - Slot iklan sidebar: tulisan "Sponsor" dan judul iklan dihapus (judul tetap jadi teks alternatif), iklan tampil foto penuh tanpa bingkai, sudut kotak tajam. Placeholder "Ruang iklan" juga bersudut tajam tanpa tulisan Sponsor.
117. **2026-10-15** - Iklan tambahan (tidak agresif, hilang untuk Premium): (1) kartu iklan berlabel "Iklan" di katalog setelah kartu ke-6 lalu tiap 12 kartu (KartuIklan.tsx); (2) pop-up iklan di tengah layar, muncul setelah 60 detik kunjungan, maks. 1x per hari per browser, bertahan sampai ditutup, ada link "Bebas iklan" (PopupIklan.tsx, SlotPopupIklan.tsx). Hook useBebasIklan dipakai bersama; saklar admin jadi "Tampilkan iklan untuk saya". Diuji dengan iklan contoh sementara.
118. **2026-10-15** - Iklan demo: 3 gambar merek fiktif (Klepon Ceria, Cubit! Cubit!, Lapis Cilik) disalin ke public/iklan-demo/ + supabase/data-iklan-demo.sql untuk memasukkannya ke tabel iklan. 3 gambar lain (usaha sungguhan) tidak dipakai tanpa izin pemiliknya.
119. **2026-10-15** - Batas iklan aktif dinaikkan dari 4 jadi 6 (MAKS_IKLAN_AKTIF).
120. **2026-10-15** - Pop-up iklan MODE UJI sementara (MODE_UJI = true di PopupIklan.tsx): muncul 10 detik setelah halaman dibuka dan 10 detik setelah ditutup, tanpa batas harian. Set false untuk kembali ke aturan normal (1x/hari, setelah 60 detik).
121. **2026-10-15** - Tombol "Go back to top" (lingkaran panah ke atas + teks) di tengah footer semua halaman, gulir halus ke paling atas (KeAtas.tsx).
122. **2026-10-15** - Tombol "Go back to top" dipindah ke atas footer (bukan di dalamnya), lingkaran panah memantul pelan (animasi .pantul 2.4 detik, tetap jalan di mode kurangi animasi).
123. **2026-10-15 11:08** - Pop-up iklan: tiap 50 detik (sejak dibuka/ditutup), maks. 3x sehari per browser (MODE_UJI dihapus). Admin punya saklar "Pop-up iklan untuk saya" di /admin?tab=iklan; menyalakan ulang me-reset hitungan 50 detik & jatah 3x.
124. **2026-10-15 11:10** - Lupa password MODE DEMO di dialog Masuk: link "Lupa password?" muncul setelah 2x salah password; isi email + username + password baru, langsung diganti tanpa email (migration 0014_lupa_password_demo.sql, RPC reset_password_demo, akun admin dikecualikan). Ganti dengan reset via email sebelum rilis.
125. **2026-10-15 11:16** - Lupa password demo disederhanakan: cukup email + password baru + ulangi (tanpa username). RPC reset_password_demo(p_email, p_password); migration 0014 diperbarui (drop versi lama).
126. **2026-10-15 11:17** - Tombol mata tampilkan/sembunyikan password (komponen InputPassword) di dialog Masuk/Daftar/Lupa password (password + ulangi) dan di Pengaturan profil (password lama, baru, ulangi).
127. **2026-10-15 11:18** - Link "Lupa password?" di dialog Masuk dipindah ke tengah, merah, tebal.
128. **2026-10-15 11:20** - Klik "Lupa password?": kolom password yang salah dikosongkan, email tetap terisi.
129. **2026-10-15 11:26** - Halaman /pengaturan (khusus user, admin diarahkan ke /admin). Gratis: teks lebih besar, kurangi animasi, notifikasi (segera hadir). Premium: bebas iklan, layar menyala saat mode masak, lencana Prem; terkunci untuk akun gratis dan diarahkan ke /premium. Disimpan per browser (lib/pengaturan.ts). Link juga di profil sendiri.
130. **2026-10-15 11:26** - Menu Premium di sidebar: bila akun sudah Premium (atau admin), kilau dan ikon mahkota jadi hijau (hook usePremium, kelas .kilau-hijau).
131. **2026-10-15 11:26** - Tombol gear Pengaturan di navbar (antara avatar profil dan + Kontribusi, khusus user): saat hover tulisan "Pengaturan" terbuka ke kiri dan roda gigi berputar pelan.
132. **2026-10-15 11:27** - Menu Premium di sidebar saat akun Premium: latar hijau muda transparan (20%) selalu menyala tanpa hover.
133. **2026-10-15 11:28** - Halaman Tentang kami diberi latar motif batik kawung samar (memudar ke tepi), sama seperti hero beranda.
134. **2026-10-15 11:29** - Animasi tombol Pengaturan navbar diperhalus: tulisan terbuka 0,5 detik dengan easing lembut; gear berputar pelan 180° saat hover dan kembali halus saat dilepas (tidak lagi melompat).
135. **2026-10-15 11:32** - Foto profil bisa dipencet (halaman profil & Pengaturan profil): tampil besar di tengah layar dengan animasi membesar, tertutup sendiri setelah 3 detik atau saat diklik (FotoPerbesar.tsx).
136. **2026-10-15 11:33** - Menu "Profil saya" (ikon orang) di sidebar, antara Kelas dan Premium, menuju /profil/saya.

## Berikutnya
- Review docs/06 model bisnis bersama tim, lalu buat slide
- Uji alur kirim -> moderasi -> katalog, lalu merge PR #7
- Isi 20-30 data awal
- Sebelum expo: SMTP sendiri (mis. Resend) karena email bawaan Supabase dibatasi
- Login Google (opsional, akhir)
