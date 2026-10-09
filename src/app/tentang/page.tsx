import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tentang" };

const kriteria = [
  "Jajanan tradisional Indonesia (bukan kreasi modern / fusion)",
  "Ada nama dan asal daerah",
  "Foto milik sendiri atau berlisensi bebas (cantumkan kredit)",
  "Tidak mengandung kata kasar, SARA, atau promosi berlebihan",
  "Lokasi hanya tempat usaha / publik",
];

export default function TentangPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 py-10 leading-relaxed">
      <h1 className="font-display text-4xl font-semibold">Tentang Jejak Jajan</h1>
      <p>
        Banyak jajanan tradisional makin sulit ditemukan karena penjualnya makin sedikit dan tidak punya penerus.
        Jejak Jajan adalah arsip yang diisi bersama: cerita, resep, dan lokasi terakhir jajanan itu terlihat.
      </p>
      <h2 className="font-display text-2xl font-semibold">Kriteria masuk katalog</h2>
      <ul className="list-inside list-disc space-y-1">
        {kriteria.map((k) => <li key={k}>{k}</li>)}
      </ul>
      <h2 className="font-display text-2xl font-semibold">Lisensi</h2>
      <p>Konten kontributor berlisensi CC BY-SA 4.0. Setiap kiriman dimoderasi admin sebelum tampil.</p>
    </article>
  );
}
