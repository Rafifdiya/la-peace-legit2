import Link from "next/link";
import { BookOpen, MapPin, Video } from "lucide-react";
import type { SnackCardData } from "@/lib/types";
import { RarityBadge } from "./RarityBadge";
import { SnackImage } from "./SnackImage";

export function SnackCard({ snack }: { snack: SnackCardData }) {
  return (
    <Link
      href={`/jajanan/${snack.slug}`}
      className="cv-auto group block overflow-hidden rounded-lg border border-line bg-surface shadow-card hover:border-brand"
    >
      <SnackImage
        src={snack.cover}
        alt={snack.nama}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
        className="aspect-[4/3]"
      />
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-ink-2">{snack.kategori}</span>
          <RarityBadge rarity={snack.rarity} jumlahVote={snack.jumlahVote} />
        </div>
        <h3 className="font-display text-xl font-semibold group-hover:text-brand">{snack.nama}</h3>
        <p className="text-sm text-ink-2">{snack.provinsi}</p>
        <p className="line-clamp-2 text-sm">{snack.deskripsi}</p>
        {/* Ikon hanya tampil jika datanya ada */}
        <div className="flex gap-3 pt-1 text-xs text-ink-2">
          {snack.punyaResep && (
            <span className="flex items-center gap-1"><BookOpen size={14} aria-hidden /> Resep</span>
          )}
          {snack.punyaVideo && (
            <span className="flex items-center gap-1"><Video size={14} aria-hidden /> Video</span>
          )}
          {snack.punyaLokasi && (
            <span className="flex items-center gap-1"><MapPin size={14} aria-hidden /> Lokasi</span>
          )}
        </div>
      </div>
    </Link>
  );
}
