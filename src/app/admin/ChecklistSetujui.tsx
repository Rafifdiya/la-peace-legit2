"use client";

import { useState } from "react";
import { KRITERIA } from "@/lib/kriteria";
import { ApproveButton } from "./ApproveButton";

/** Checklist moderasi: tombol Setujui baru aktif setelah semua kriteria dicentang. */
export function ChecklistSetujui({ id }: { id: string }) {
  const [cek, setCek] = useState<boolean[]>(() => KRITERIA.map(() => false));
  const jumlah = cek.filter(Boolean).length;
  const lengkap = jumlah === KRITERIA.length;

  return (
    <details className="rounded-lg bg-subtle p-3">
      <summary className="cursor-pointer font-semibold">
        Checklist moderasi ({jumlah}/{KRITERIA.length})
      </summary>
      <ul className="mt-2 space-y-1.5">
        {KRITERIA.map((k, i) => (
          <li key={k}>
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={cek[i]}
                onChange={() => setCek((c) => c.map((v, j) => (j === i ? !v : v)))}
                className="mt-0.5 accent-[var(--color-accent)]"
              />
              {k}
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setCek(KRITERIA.map(() => !lengkap))} className="text-brand underline">
          {lengkap ? "Kosongkan semua" : "Centang semua"}
        </button>
        <ApproveButton id={id} disabled={!lengkap} />
        {!lengkap && <span className="text-ink-2">Centang semua kriteria untuk menyetujui. Bila ada yang tidak terpenuhi, tolak dengan alasan.</span>}
      </div>
    </details>
  );
}
