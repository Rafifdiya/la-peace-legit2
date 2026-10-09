import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ExternalLink, MapPin, Share2, Bookmark, Flag } from "lucide-react";
import { LoginButton } from "@/components/LoginButton";
import { MiniMapLazy } from "@/components/map/MiniMapLazy";
import { RarityBadge } from "@/components/RarityBadge";
import { SnackCard } from "@/components/SnackCard";
import { SnackImage } from "@/components/SnackImage";
import { getAllSlugs, getRelated, getSnack } from "@/lib/data";
import { SightingAge } from "./SightingAge";

// Semua halaman detail dibuat statis saat build -> dibuka sangat cepat
export async function generateStaticParams() {
  return (await getAllSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/jajanan/[slug]">): Promise<Metadata> {
  const snack = await getSnack((await params).slug);
  return snack ? { title: snack.nama, description: snack.deskripsi } : {};
}

const jenisLabel = { kios_tetap: "Kios tetap", keliling: "Keliling", musiman: "Musiman" };

export default async function DetailPage({ params }: PageProps<"/jajanan/[slug]">) {
  const snack = await getSnack((await params).slug);
  if (!snack) notFound();
  const related = await getRelated(snack);
  const points = snack.sightings
    .filter((s) => s.lat !== undefined && s.lng !== undefined)
    .map((s) => ({ id: s.id, lat: s.lat!, lng: s.lng!, label: s.tempat }));

  return (
    <div className="space-y-12 py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <SnackImage src={snack.cover} alt={snack.nama} sizes="(max-width: 1024px) 100vw, 600px" utama className="aspect-[4/3] rounded-xl" />
        <div className="space-y-4">
          <p className="text-sm text-ink-2">{snack.kategori}</p>
          <h1 className="font-display text-5xl font-semibold">{snack.nama}</h1>
          {snack.namaLain.length > 0 && <p className="text-ink-2">Juga dikenal: {snack.namaLain.join(", ")}</p>}
          <p className="flex items-center gap-1"><MapPin size={16} aria-hidden /> {snack.provinsi}</p>
          <div className="flex items-center gap-2">
            <RarityBadge rarity={snack.rarity} jumlahVote={snack.jumlahVote} />
            <span className="text-sm text-ink-2">{snack.jumlahVote} suara</span>
          </div>
          <p>{snack.deskripsi}</p>
          <div className="flex gap-2 text-sm">
            {([[Bookmark, "Simpan"], [Share2, "Bagikan"], [Flag, "Lapor"]] as const).map(([Icon, label]) => (
              <LoginButton key={label} className="flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 hover:border-brand">
                <Icon size={14} aria-hidden /> {label}
              </LoginButton>
            ))}
          </div>
          <div className="rounded-lg border border-line bg-surface p-4 text-sm">
            <p className="font-semibold">Menurutmu seberapa langka?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Umum", "Mulai langka", "Hampir punah", "Punah"].map((r) => (
                <LoginButton key={r} className="rounded-full border border-line px-3 py-1 hover:border-brand">{r}</LoginButton>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigasi anchor (tanpa JavaScript) pengganti tab */}
      <nav className="sticky top-16 z-30 flex gap-6 border-b border-line bg-page py-3 text-sm font-semibold">
        <a href="#cerita">Cerita</a>
        <a href="#resep">Resep</a>
        <a href="#lokasi">Lokasi ({snack.sightings.length})</a>
        <a href="#komentar">Komentar</a>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-12">
          <section id="cerita" className="scroll-mt-32 space-y-3">
            <h2 className="font-display text-2xl font-semibold">Cerita</h2>
            <p className="leading-relaxed">{snack.cerita}</p>
          </section>

          <section id="resep" className="scroll-mt-32 space-y-4">
            <h2 className="font-display text-2xl font-semibold">Resep</h2>
            {snack.resep ? (
              <>
                <div className="flex flex-wrap items-center gap-3 text-sm text-ink-2">
                  <span className="font-semibold text-ink">{snack.resep.judulVersi}</span>
                  {snack.resep.verified && (
                    <span className="flex items-center gap-1 text-accent"><BadgeCheck size={16} aria-hidden /> Terverifikasi</span>
                  )}
                  <span>{snack.resep.porsi} porsi</span>
                  <span>{snack.resep.waktuMenit} menit</span>
                  <span className="capitalize">{snack.resep.kesulitan}</span>
                </div>
                <h3 className="font-semibold">Bahan</h3>
                <ul className="list-inside list-disc space-y-1">
                  {snack.resep.bahan.map((b) => <li key={b}>{b}</li>)}
                </ul>
                <h3 className="font-semibold">Langkah</h3>
                <ol className="space-y-3">
                  {snack.resep.langkah.map((l, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm text-white">{i + 1}</span>
                      <p className="pt-0.5">{l}</p>
                    </li>
                  ))}
                </ol>
                {snack.resep.videoUrl && (
                  // Link saja, bukan iframe: embed YouTube ~1 MB JavaScript
                  <a href={snack.resep.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand underline">
                    Tonton video lengkap <ExternalLink size={14} aria-hidden />
                  </a>
                )}
                <div className="flex gap-2 pt-2 text-sm">
                  <span className="text-ink-2">Sudah coba resep ini?</span>
                  <LoginButton className="rounded-full border border-line px-3 py-1 hover:border-accent">Berhasil</LoginButton>
                  <LoginButton className="rounded-full border border-line px-3 py-1 hover:border-danger">Kurang berhasil</LoginButton>
                </div>
              </>
            ) : (
              <p className="text-ink-2">Belum ada resep. <Link href="/upload" className="text-brand underline">Tambahkan resep</Link></p>
            )}
          </section>

          <section id="komentar" className="scroll-mt-32 space-y-3">
            <h2 className="font-display text-2xl font-semibold">Komentar</h2>
            <p className="text-ink-2">Belum ada komentar.</p>
          </section>
        </div>

        <aside id="lokasi" className="scroll-mt-32 space-y-4">
          <h2 className="font-display text-2xl font-semibold">Terakhir Terlihat di</h2>
          <MiniMapLazy points={points} />
          {snack.sightings.length === 0 && <p className="text-ink-2">Belum ada info lokasi.</p>}
          {snack.sightings.map((s) => (
            <div key={s.id} className="space-y-2 rounded-lg border border-line bg-surface p-4 text-sm">
              <p className="font-semibold">{s.tempat}</p>
              <p className="text-ink-2">{s.area} · {jenisLabel[s.jenis]}</p>
              <SightingAge tanggal={s.terakhirDikonfirmasi} />
              <div className="flex flex-wrap gap-2 pt-1">
                {s.mapsUrl && <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-brand underline">Buka Maps</a>}
                {s.orderUrl && <a href={s.orderUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">Pesan online</a>}
              </div>
              <div className="flex gap-2">
                <LoginButton className="rounded-full border border-line px-3 py-1 hover:border-accent">Masih ada</LoginButton>
                <LoginButton className="rounded-full border border-line px-3 py-1 hover:border-danger">Sudah tidak ada</LoginButton>
              </div>
            </div>
          ))}
          <LoginButton className="w-full rounded-full border border-brand py-2 text-sm text-brand">Saya lihat di tempat lain</LoginButton>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">Dari {snack.provinsi} juga</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => <SnackCard key={s.slug} snack={s} />)}
          </div>
        </section>
      )}
    </div>
  );
}
