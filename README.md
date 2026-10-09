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

## Menjalankan web (lokal)
Butuh Node.js 20+.

```bash
npm install
npm run dev      # buka http://localhost:3000
npm run build    # cek build produksi
npm run lint
```

Data masih dummy (`src/data/snacks.ts`). Semua akses data lewat `src/lib/data.ts`,
nanti cukup diganti query Supabase.

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
