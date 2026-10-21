import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Carousel } from "@/components/Carousel";
import { SnackCard } from "@/components/SnackCard";
import { StatCard } from "@/components/StatCard";
import type { SnackCardData } from "@/lib/types";
import { getProvinces, getSnackPage, getStats } from "@/lib/data";

// Maksimal kartu per carousel beranda; sisanya di katalog
const CAROUSEL = 8;

export default async function Beranda() {
  const [stats, provinsi, langka, baru] = await Promise.all([
    getStats(),
    getProvinces(),
    getSnackPage({ urut: "langka" }, 1, CAROUSEL),
    getSnackPage({ urut: "terbaru" }, 1, CAROUSEL),
  ]);

  const statList = [
    ["Jajanan", stats.jajanan],
    ["Provinsi", stats.provinsi],
    ["Kontributor", stats.kontributor],
    ["Lokasi", stats.lokasi],
  ] as const;

  return (
    <div className="beranda space-y-12 py-10">
      {/* Motif kawung samar di belakang hero */}
      <section className="motif-kawung motif-pudar space-y-5 rounded-xl py-8 text-center">
        <p className="-rotate-2 font-hand text-[2.694rem] text-brand sm:text-[3.081rem] lg:text-[3.097rem]">
          <span className="ketik">dari dapur nenek, untuk generasi berikutnya..</span>
        </p>
        <h1 className="font-display text-[1.506rem] font-semibold sm:text-[2.706rem] lg:text-[2.722rem] xl:text-[3.322rem]">Jejak jajan yang hampir hilang</h1>
        <p className="mx-auto max-w-2xl text-[1.4rem] text-ink lg:text-[1.407rem]">
          Arsip jajanan tradisional Indonesia dari komunitas: cerita, resep, dan di mana terakhir terlihat.
        </p>
        {/* Cari + pilih daerah dalam satu kotak (pengganti daftar tombol provinsi) */}
        <form action="/katalog" className="cari-beranda mx-auto flex max-w-[50.4rem] flex-wrap items-center gap-[0.6rem] rounded-3xl border border-line bg-surface px-[1.2rem] py-[0.9rem] sm:flex-nowrap sm:rounded-full">
          <Search size={22} className="text-ink" aria-hidden />
          <input name="q" placeholder="Cari klepon, kue ape, lupis..." aria-label="Cari jajanan" className="cari-teks min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink/80" />
          <select name="provinsi" aria-label="Daerah" defaultValue="" className="w-full rounded-full border border-line bg-surface px-[0.9rem] py-[0.45rem] cari-kecil sm:w-[13.2rem]">
            <option value="">Semua daerah</option>
            {provinsi.map((p) => <option key={p.slug} value={p.slug}>{p.nama}</option>)}
          </select>
          <button className="w-full rounded-full bg-brand px-[1.2rem] py-[0.45rem] cari-kecil font-semibold text-white sm:w-auto">Cari</button>
        </form>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statList.map(([label, n]) => <StatCard key={label} label={label} value={n} labelClass="label-statistik text-ink-2" />)}
      </section>

      <Section judul="Hampir Punah" href="/katalog?urut=langka" items={langka.items} utama />
      <Section judul="Baru Ditambahkan" href="/katalog" items={baru.items} />

      <section className="rounded-xl bg-brand p-8 text-center text-white">
        <h2 className="font-display text-2xl font-semibold">Tahu jajanan yang belum ada?</h2>
        <p className="mt-2 font-hand text-[1.725rem] text-white/90">Bagikan cerita, resep, atau lokasi penjualnya.</p>
        <Link href="/upload" className="mt-4 inline-block rounded-full bg-white px-5 py-2 font-semibold text-brand">
          Mulai kontribusi
        </Link>
      </section>
    </div>
  );
}

function Section({ judul, href, items, utama = false }: { judul: string; href: string; items: SnackCardData[]; utama?: boolean }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-x-4">
        <h2 className="font-display text-2xl font-semibold xl:text-[1.8rem]">{judul}</h2>
        <Link href={href} className="lihat-semua shrink-0 rounded-full border-2 border-brand bg-surface px-5 py-1 font-semibold text-brand transition-colors hover:bg-brand hover:text-white">Lihat semua</Link>
      </div>
      {items.length === 0 ? (
        <p className="text-ink-2">Belum ada jajanan.</p>
      ) : (
        <Carousel label={judul} jalan={utama /* hanya "Hampir Punah" yang bergerak otomatis */}>
          {items.map((s, i) => (
            <div key={s.slug} className="kartu-besar w-[17rem] shrink-0 sm:w-[20rem] xl:w-[24rem]">
              <SnackCard snack={s} utama={utama && i < 3} />
            </div>
          ))}
          {/* Kartu terakhir: ajakan ke katalog */}
          <Link
            href={href}
            className="flex w-[12rem] shrink-0 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-orange-500/40 bg-surface p-6 text-center font-semibold text-brand hover:bg-orange-500/10"
          >
            <span className="rounded-full bg-brand p-3 text-white"><ArrowRight size={24} aria-hidden /></span>
            Buka Katalog
          </Link>
        </Carousel>
      )}
    </section>
  );
}
