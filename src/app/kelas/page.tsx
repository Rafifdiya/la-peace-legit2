import type { Metadata } from "next";
import Link from "next/link";
import { FormMinat } from "./FormMinat";

export const metadata: Metadata = {
  title: "Kelas Bersama Penjual",
  description: "Belajar membuat jajanan tradisional langsung dari penjual aslinya. Segera hadir.",
};

const langkah = [
  ["Penjual asli mengajar", "Kelas daring atau workshop langsung, dipandu penjual yang sudah puluhan tahun membuat jajanan itu."],
  ["Bagi hasil ke penjual", "Sebagian besar biaya kelas untuk penjual, jadi ilmunya dihargai dan usahanya terbantu."],
  ["Resep tetap gratis", "Arsip Jejak Jajan tetap terbuka untuk semua. Kelas adalah tambahan untuk yang ingin belajar lebih dalam."],
];

export default function KelasPage() {
  return (
    <div className="teks-110 mx-auto max-w-3xl space-y-10 py-10">
      <header className="space-y-3 text-center">
        <span className="inline-block rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-sm font-semibold text-brand">
          Segera hadir
        </span>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Kelas Bersama Penjual</h1>
        <p className="font-hand text-2xl text-brand">belajar langsung dari tangan yang membuatnya</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-3">
        {langkah.map(([judul, isi]) => (
          <li key={judul} className="space-y-2 rounded-lg border border-line bg-surface p-5">
            <h2 className="font-semibold">{judul}</h2>
            <p className="text-sm text-ink-2">{isi}</p>
          </li>
        ))}
      </ul>

      <p className="text-center text-sm">
        Anggota <Link href="/premium" className="kilau font-semibold underline decoration-brand">Premium</Link> dapat diskon 20% dan daftar kelas lebih dulu.
      </p>

      <section className="mx-auto max-w-md space-y-4 rounded-xl border border-line bg-surface p-6">
        <div className="space-y-1 text-center">
          <h2 className="font-display text-2xl font-semibold">Tertarik ikut?</h2>
          <p className="text-sm text-ink-2">Daftarkan email. Kelas pertama dibuka setelah cukup peminat.</p>
        </div>
        <FormMinat />
      </section>
    </div>
  );
}
