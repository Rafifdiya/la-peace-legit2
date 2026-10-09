import Link from "next/link";
import { Search } from "lucide-react";
import { SnackCard } from "@/components/SnackCard";
import { StatCard } from "@/components/StatCard";
import { getProvinces, getSnackPage, getStats } from "@/lib/data";

export default async function Beranda() {
  const [stats, provinsi, langka, baru] = await Promise.all([
    getStats(),
    getProvinces(),
    getSnackPage({ urut: "langka" }, 1, 3),
    getSnackPage({ urut: "terbaru" }, 1, 3),
  ]);

  const statList = [
    ["Jajanan", stats.jajanan],
    ["Provinsi", stats.provinsi],
    ["Kontributor", stats.kontributor],
    ["Lokasi", stats.lokasi],
  ] as const;

  return (
    <div className="space-y-14 py-10">
      <section className="space-y-5 text-center">
        <h1 className="font-display text-4xl font-semibold sm:text-6xl">Jejak jajan yang hampir hilang</h1>
        <p className="mx-auto max-w-xl text-ink-2">
          Arsip jajanan tradisional Indonesia dari komunitas: cerita, resep, dan di mana terakhir terlihat.
        </p>
        <form action="/katalog" className="mx-auto flex max-w-lg items-center gap-2 rounded-full border border-line bg-surface px-4 py-3">
          <Search size={18} className="text-ink-2" aria-hidden />
          <input name="q" placeholder="Cari klepon, kue ape, lupis..." aria-label="Cari jajanan" className="flex-1 bg-transparent outline-none" />
          <button className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white">Cari</button>
        </form>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statList.map(([label, n]) => <StatCard key={label} label={label} value={n} />)}
      </section>

      <Section judul="Hampir Punah" href="/katalog?urut=langka">
        {langka.items.map((s) => <SnackCard key={s.slug} snack={s} />)}
      </Section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Jelajahi per Daerah</h2>
        <div className="flex flex-wrap gap-2">
          {provinsi.map((p) => (
            <Link key={p.slug} href={`/katalog?provinsi=${p.slug}`} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm hover:border-brand">
              {p.nama}
            </Link>
          ))}
        </div>
      </section>

      <Section judul="Baru Ditambahkan" href="/katalog">
        {baru.items.map((s) => <SnackCard key={s.slug} snack={s} />)}
      </Section>

      <section className="rounded-xl bg-brand p-8 text-center text-white">
        <h2 className="font-display text-2xl font-semibold">Tahu jajanan yang belum ada?</h2>
        <p className="mt-2 text-white/80">Bagikan cerita, resep, atau lokasi penjualnya.</p>
        <Link href="/upload" className="mt-4 inline-block rounded-full bg-white px-5 py-2 font-semibold text-brand">
          Mulai kontribusi
        </Link>
      </section>
    </div>
  );
}

function Section({ judul, href, children }: { judul: string; href: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl font-semibold">{judul}</h2>
        <Link href={href} className="text-sm text-brand hover:underline">Lihat semua</Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}
