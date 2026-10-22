"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

/** Di HP: Provinsi / Kategori / Urutkan disembunyikan di balik tombol supaya kartu langsung terlihat. Di laptop selalu tampil. */
export function FilterLain({ children }: { children: React.ReactNode }) {
  const [buka, setBuka] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setBuka((b) => !b)}
        aria-expanded={buka}
        className="flex w-full items-center justify-between rounded-full border border-line px-4 py-2 font-semibold lg:hidden"
      >
        <span className="flex items-center gap-2"><SlidersHorizontal size={16} aria-hidden /> Filter &amp; urutkan</span>
        <ChevronDown size={18} aria-hidden className={`transition-transform ${buka ? "rotate-180" : ""}`} />
      </button>
      <div className={`space-y-[1.4375rem] lg:block ${buka ? "block" : "hidden"}`}>{children}</div>
    </>
  );
}
