import type { Iklan } from "@/lib/iklan";
import { IklanMedia } from "./IklanMedia";

/** Iklan berbentuk kartu di sela daftar katalog. Label "Iklan" agar tidak dikira konten arsip. */
export function KartuIklan({ iklan }: { iklan: Iklan }) {
  const isi = (
    <div className="relative">
      <IklanMedia iklan={iklan} kotak />
      <span className="absolute left-2 top-2 rounded-sm bg-ink/70 px-1.5 py-0.5 text-xs font-semibold text-white">Iklan</span>
    </div>
  );
  return (
    <div className="overflow-hidden rounded-lg border-2 border-[#D9C4A3] bg-surface shadow-card">
      {iklan.linkUrl ? (
        <a href={iklan.linkUrl} target="_blank" rel="noopener sponsored" className="block hover:opacity-90">{isi}</a>
      ) : (
        isi
      )}
      <p className="px-4 py-3 text-sm text-ink-2">{iklan.judul}</p>
    </div>
  );
}
