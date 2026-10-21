# la-peace-legit (nama sementara)

Web arsip jajanan tradisional berbasis komunitas: cerita, resep, langkah pembuatan, dan lokasi terakhir terlihat.
Project mata kuliah Venture Creation.

## Masalah

Jajanan tradisional makin sulit ditemukan karena penjualnya berkurang dan tidak punya generasi penerus. Resep, cara membuat, dan ceritanya ikut hilang.

## Solusi

Ensiklopedia jajanan tradisional Indonesia yang diisi komunitas. Pengguna bisa mengunggah:

- nama dan cerita/asal-usul jajanan
- resep dan langkah pembuatan (foto & video per langkah)
- lokasi jajanan terakhir terlihat atau dijual
- vote tingkat kelangkaan

## Status

Sprint 0: riset & desain.

## Tim

| Nama | Peran |
|------|-------|
| - | Product Owner |
| - | Scrum Master |
| - | Developer |

## Dokumentasi

Lihat folder [docs/](docs/):

1. [Ide & fitur](docs/01-ide-dan-fitur.txt)
2. [Survei & wawancara](docs/02-survei-wawancara.txt)
3. [Desain](docs/03-desain.txt)
4. [Rencana Software Engineering](docs/04-rencana-software-engineering.txt)
5. [Feedback presentasi 1](docs/05-feedback-presentasi-1.txt)
6. [Progress](docs/07-progress.md)
7. [Daftar fitur & status](docs/08-daftar-fitur.txt)
8. [Serah terima & to-do](docs/09-serah-terima.txt)

## Menjalankan web (lokal)
Butuh Node.js 20+ dan project Supabase.

1. Salin `.env.example` jadi `.env.local`, isi URL + publishable key Supabase.
2. Jalankan semua file `supabase/migrations/0001-0023` berurutan di
   Supabase Dashboard > SQL Editor.
3. Authentication > Sign In / Providers > Email: matikan "Confirm email".
4. Jadikan akun admin (daftar dulu lewat web, lalu di SQL Editor):
   ```sql
   alter table profiles disable trigger profiles_protect_role;
   update profiles set role = 'admin'
     where id = (select id from auth.users where email = '<email admin>');
   alter table profiles enable trigger profiles_protect_role;
   ```

```bash
npm install
npm run dev      # buka http://localhost:3000
npm run build    # cek build produksi
npm run lint
```

Data dibaca dari Supabase lewat `src/lib/data.ts` dan `src/lib/supabase/`.

## Target performa (HP RAM 2-4 GB)
- Halaman dibuat statis / partial prerender; JavaScript di browser seminimal mungkin.
- Peta Leaflet: dynamic import (`ssr: false`), dimuat saat terlihat; di HP lemah
  atau mode hemat data baru dimuat jika tombol "Tampilkan peta" ditekan.
- Gambar: `next/image` (AVIF/WebP, lazy load, ukuran sesuai layar, kualitas 60/75).
- Foto upload dikompres di browser (`browser-image-compression`, ~300 KB, WebP).
- Katalog: 9 item per halaman + infinite scroll, kartu di luar layar tidak dirender
  (`content-visibility: auto`).
- Filter & search pakai form biasa (jalan tanpa JavaScript).
- Video resep berupa link, bukan iframe embed.
