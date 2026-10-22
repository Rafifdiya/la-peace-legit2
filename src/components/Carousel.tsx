"use client";

import { useEffect, useRef } from "react";

const KECEPATAN = 46.2; // piksel per detik, pelan
const MULAI = 1; // mulai bergerak 1 detik setelah halaman dimuat

/**
 * Marquee bolak-balik (diadaptasi dari infinite marquee Uiverse.io, PriyanshuGupta28):
 * bergeser pelan ke kanan sampai kartu terakhir ("Buka Katalog"), berhenti sebentar,
 * lalu balik ke kartu pertama, berulang. Berhenti saat di-hover/disentuh.
 * JavaScript hanya mengukur jarak geser; gerakannya animasi CSS.
 */
export function Carousel({ label, children, jalan = true }: { label: string; children: React.ReactNode; jalan?: boolean }) {
  const luar = useRef<HTMLDivElement>(null);
  const dalam = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!jalan) return;
    const ukur = () => {
      const l = luar.current;
      const d = dalam.current;
      if (!l || !d) return;
      const jarak = Math.max(d.scrollWidth - l.clientWidth, 0);
      d.style.setProperty("--geser", `-${jarak}px`);
      // Jarak pergi + pulang ditempuh dalam ~76% durasi; sisanya jeda di kedua ujung
      const durasi = Math.max((jarak * 2) / KECEPATAN / 0.76, 6);
      d.style.animationDuration = `${durasi}s`;
      // Jeda awal di keyframe = 6% durasi; dipotong supaya mulai bergerak MULAI detik setelah halaman dimuat
      if (!d.style.animationDelay) d.style.animationDelay = `${MULAI - durasi * 0.06}s`;
      d.classList.toggle("marquee__inner", jarak > 0);
    };
    ukur();
    const ro = new ResizeObserver(ukur);
    if (luar.current) ro.observe(luar.current);
    return () => ro.disconnect();
  }, [jalan]);

  // Tanpa animasi: baris biasa yang bisa digeser manual
  if (!jalan) {
    return (
      <div role="region" aria-label={label} className="geser flex snap-x gap-5 overflow-x-auto px-1 py-1 pb-4">
        {children}
      </div>
    );
  }

  return (
    <div ref={luar} role="region" aria-label={label} className="marquee pb-2">
      <div ref={dalam} className="flex w-max gap-5 px-1 py-1">
        {children}
      </div>
    </div>
  );
}
