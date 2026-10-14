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

## Berikutnya
- Review docs/06 model bisnis bersama tim, lalu buat slide
- Uji alur kirim -> moderasi -> katalog, lalu merge PR #7
- Isi 20-30 data awal
- Sebelum expo: SMTP sendiri (mis. Resend) karena email bawaan Supabase dibatasi
- Login Google (opsional, akhir)
