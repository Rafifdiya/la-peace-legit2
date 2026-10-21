"use client";

import { ArrowUp } from "lucide-react";

/** Tombol di footer: gulir kembali ke paling atas halaman. */
export function KeAtas() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="ke-atas group mx-auto flex flex-col items-center gap-1 text-sm font-semibold text-brand"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand bg-surface transition-colors group-hover:bg-brand group-hover:text-white">
        <ArrowUp size={20} aria-hidden />
      </span>
      Balik ke atas
    </button>
  );
}
