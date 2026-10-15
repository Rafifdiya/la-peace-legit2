"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Baris geser horizontal (scroll-snap CSS). Bisa digeser jari/trackpad tanpa JavaScript;
 * tombol panah hanya pelengkap untuk mouse di desktop.
 */
export function Carousel({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const geser = (arah: 1 | -1) => ref.current?.scrollBy({ left: arah * ref.current.clientWidth * 0.8, behavior: "smooth" });
  const panah = "absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-line bg-surface p-2 shadow-card hover:border-brand md:block";

  return (
    <div className="relative">
      <button type="button" onClick={() => geser(-1)} aria-label={`Geser ${label} ke kiri`} className={`${panah} -left-4`}>
        <ChevronLeft size={20} aria-hidden />
      </button>
      <div ref={ref} role="region" aria-label={label} className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 geser">
        {children}
      </div>
      <button type="button" onClick={() => geser(1)} aria-label={`Geser ${label} ke kanan`} className={`${panah} -right-4`}>
        <ChevronRight size={20} aria-hidden />
      </button>
    </div>
  );
}
