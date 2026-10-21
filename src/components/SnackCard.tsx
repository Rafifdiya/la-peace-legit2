import Link from "next/link";
import { BookOpen, MapPin, Video } from "lucide-react";
import type { SnackCardData } from "@/lib/types";
import { RarityBadge } from "./RarityBadge";
import { SnackImage } from "./SnackImage";

/** utama: kartu yang langsung terlihat saat halaman dibuka -> foto dimuat lebih awal (LCP) */
export function SnackCard({ snack, utama = false }: { snack: SnackCardData; utama?: boolean }) {
  return (
    <Link
      href={`/jajanan/${snack.slug}`}
      className="kartu-jajanan cv-auto group block overflow-hidden rounded-lg border-2 border-[#D9C4A3] bg-surface shadow-card hover:border-brand"
    >
      <SnackImage
        src={snack.cover}
        alt={snack.nama}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
        utama={utama}
        className="aspect-[4/3]"
      />
      <div className="space-y-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-ink-2">{snack.kategori}</span>
          <RarityBadge rarity={snack.rarity} jumlahVote={snack.jumlahVote} />
        </div>
        <h3 className="font-display text-xl font-semibold group-hover:text-brand">{snack.nama}</h3>
        <p className="text-sm text-ink-2">{snack.provinsi}</p>
        <p className="kartu-deskripsi line-clamp-2">{snack.deskripsi}</p>
        {/* Ikon hanya tampil jika datanya ada */}
        <div className="flex gap-3 pt-1 text-xs text-ink-2">
          {snack.punyaResep && (
            <span className="flex items-center gap-1"><BookOpen size={17} aria-hidden /> Resep</span>
          )}
          {snack.punyaVideo && (
            <span className="flex items-center gap-1"><Video size={17} aria-hidden /> Video</span>
          )}
          {snack.punyaLokasi && (
            <span className="flex items-center gap-1"><MapPin size={17} aria-hidden /> Lokasi</span>
          )}
        </div>
      </div>
    </Link>
  );
}
