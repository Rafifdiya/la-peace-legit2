import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Check, X } from "lucide-react";
import { LoginButton } from "@/components/LoginButton";
import { formatTanggal } from "@/lib/format";
import { getSesi } from "@/lib/kiriman";
import { PremiumButton } from "./PremiumButton";

export const metadata: Metadata = {
  title: "Premium",
  description: "Arsip tetap gratis. Premium untuk bebas iklan, mode masak, PDF dan koleksi tanpa batas.",
};

// [fitur, gratis, premium]: true = ada, false = tidak, string = keterangan
const fitur: [string, boolean | string, boolean | string][] = [
  ["Baca semua cerita, resep, dan lokasi", true, true],
  ["Kirim jajanan, vote, Forum Jajanan", true, true],
  ["Simpan jajanan", true, true],
  ["Koleksi (mis. \"Kue Lebaran\")", "Maks. 3", "Tanpa batas"],
  ["Unduh resep PDF", "5x per minggu", "Sepuasnya"],
  ["Mode masak (langkah besar, layar tetap menyala)", false, true],
  ["Lencana & bingkai Premium di profil", false, true],
  ["Bebas iklan sponsor", false, true],
  ["Kelas Bersama Penjual (segera hadir)", "Bayar per kelas", "Diskon 20% + daftar lebih dulu"],
];

function Sel({ v }: { v: boolean | string }) {
  if (typeof v === "string") return <span className="font-semibold">{v}</span>;
  return v ? <Check size={20} className="mx-auto text-accent" aria-label="Ya" /> : <X size={20} className="mx-auto text-danger" aria-label="Tidak" />;
}

export default function PremiumPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 py-10">
      <header className="space-y-3 text-center">
        <span className="inline-block rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-sm font-semibold text-brand">
          Mode demo · tanpa pembayaran
        </span>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Jejak Jajan Premium</h1>
        <p className="font-hand text-2xl text-brand">arsip tetap gratis, premium untuk yang ingin lebih nyaman</p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-left">
          <thead className="border-b border-line bg-subtle">
            <tr>
              <th className="p-4">Fitur</th>
              <th className="p-4 text-center">Gratis</th>
              <th className="p-4 text-center text-brand">Premium</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {fitur.map(([nama, gratis, premium]) => (
              <tr key={nama}>
                <td className="p-4">{nama}</td>
                <td className="p-4 text-center"><Sel v={gratis} /></td>
                <td className="p-4 text-center"><Sel v={premium} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mx-auto max-w-sm space-y-4 rounded-xl border-2 border-orange-500/40 bg-surface p-6 text-center">
        <p className="text-sm text-ink-2">Rencana harga</p>
        <p className="font-display text-4xl font-semibold">
          Rp 15.000<span className="text-base font-normal text-ink-2">/bulan</span>
        </p>
        <Suspense fallback={<p className="text-sm text-ink-2">Memuat...</p>}>
          <Status />
        </Suspense>
        <p className="text-xs text-ink-2">
          Versi expo: tidak ada pembayaran sungguhan. Premium demo aktif 30 hari dan bisa dibatalkan kapan saja.
        </p>
      </section>
    </div>
  );
}

async function Status() {
  await connection(); // tergantung user yang login
  const sesi = await getSesi();
  if (!sesi.user) {
    return (
      <LoginButton className="w-full rounded-full bg-brand py-2.5 font-semibold text-white hover:bg-brand-hover">
        Masuk untuk mencoba Premium
      </LoginButton>
    );
  }
  if (sesi.admin) {
    return <p className="rounded-md bg-accent/10 p-2 text-sm font-semibold text-accent">Akun admin otomatis Premium</p>;
  }
  return (
    <div className="space-y-3">
      {sesi.premiumSampai && (
        <p className="rounded-md bg-accent/10 p-2 text-sm font-semibold text-accent">
          Premium aktif sampai {formatTanggal(sesi.premiumSampai)}
        </p>
      )}
      <PremiumButton aktif={!!sesi.premiumSampai} />
    </div>
  );
}
