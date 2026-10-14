<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Konteks Project: Jejak Jajan

Web arsip/ensiklopedia jajanan tradisional Indonesia berbasis komunitas (crowdsourcing),
project kelompok mata kuliah Venture Creation untuk expo.

- Masalah: jajanan tradisional sulit ditemukan karena penjual makin sedikit dan tidak punya penerus.
- User upload: nama, cerita/asal-usul, resep, langkah (foto & video link per langkah, opsional),
  lokasi terakhir terlihat (link Maps / area), vote kelangkaan.
- Role: pengunjung, user (login email + password), admin (moderasi).
- Tidak ada peta Indonesia penuh; lokasi tampil per jajanan ("Terakhir Terlihat di").
- Vote kelangkaan: 1 user 1 suara, label = suara terbanyak, tampil jika min. 3 suara.

## Stack
- Next.js 16 (App Router, `cacheComponents` aktif: `"use cache"`, `cacheLife`, `cacheTag`, `updateTag`).
- Supabase (Postgres + RLS + Storage bucket `foto`). Migration di `supabase/migrations/`,
  dijalankan manual lewat Supabase Dashboard > SQL Editor secara berurutan.
- Tailwind v4, token warna/font di `src/app/globals.css` (dari Figma "Jejak Jajan").
- Font: Fraunces (judul), Plus Jakarta Sans (isi), Caveat (aksen tulisan tangan, class `font-hand`).
- Leaflet (mini map), deploy rencana ke Vercel.

## Struktur penting
- `src/lib/data.ts` jajanan publik (katalog, detail, statistik) - pakai client publik + cache.
- `src/lib/komunitas.ts` request, profil, laporan. `src/lib/kiriman.ts` sesi & kiriman (tanpa cache).
- `src/app/upload/` form 7 langkah, submit via RPC `kirim_jajanan`.
- `src/app/admin/` moderasi via RPC `moderasi_jajanan` (server actions di `actions.ts`).
- Halaman yang butuh sesi login: panggil `await connection()` sebelum baca sesi.

## Setup lokal
1. `npm install`
2. Buat `.env.local` berisi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   (minta ke tim lewat chat pribadi, jangan di-commit).
3. `npm run dev`, buka http://localhost:3000

## Aturan tim
- GitHub flow: branch `feat/...` + Pull Request ke `main`, jangan push langsung ke `main`.
- Jangan tambahkan atribusi/mention tool AI di commit, PR, README, atau file repo.
- Repo public: jangan commit data responden, password, email akun, atau `.env.local`.
- Setiap selesai satu pekerjaan, tambahkan entri di `docs/07-progress.md`
  (nomor, tanggal, apa yang dilakukan).
- Dokumen lain: `docs/01`-`05` (ide, survei, desain, rencana SE, feedback presentasi).
