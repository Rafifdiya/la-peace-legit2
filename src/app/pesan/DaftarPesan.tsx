"use client";

import { useEffect, useState } from "react";
import { CheckCheck, Trash2 } from "lucide-react";
import { EVENT_PESAN, bacaDibaca, bacaDihapus, tandai } from "@/lib/pesan";

export type ItemPesan = { id: string; ikon: React.ReactNode; judul: string; isi: React.ReactNode; tanggal?: string };

const tombol = "flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-1.5 text-sm hover:border-brand disabled:opacity-50";

/** Daftar pesan: belum dibaca tebal + titik merah, sudah dibaca transparan. Klik pesan = dibaca. */
export function DaftarPesan({ userId, pesan }: { userId: string; pesan: ItemPesan[] }) {
  // undefined = status baca belum dimuat dari browser
  const [dibaca, setDibaca] = useState<Set<string>>();
  const [dihapus, setDihapus] = useState<Set<string>>(new Set());

  useEffect(() => {
    const muat = () => {
      setDibaca(bacaDibaca(userId));
      setDihapus(bacaDihapus(userId));
    };
    muat();
    window.addEventListener(EVENT_PESAN, muat);
    return () => window.removeEventListener(EVENT_PESAN, muat);
  }, [userId]);

  const tampil = pesan.filter((p) => !dihapus.has(p.id));
  const adaBelumDibaca = !!dibaca && tampil.some((p) => !dibaca.has(p.id));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" disabled={!adaBelumDibaca} onClick={() => tandai("dibaca", userId, tampil.map((p) => p.id))} className={tombol}>
          <CheckCheck size={16} aria-hidden /> Tandai semua dibaca
        </button>
        <button
          type="button"
          disabled={tampil.length === 0}
          onClick={() => confirm("Hapus semua pesan?") && tandai("dihapus", userId, tampil.map((p) => p.id))}
          className={`${tombol} hover:border-danger hover:text-danger`}
        >
          <Trash2 size={16} aria-hidden /> Hapus semua
        </button>
      </div>

      {tampil.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-6 text-center text-ink-2">Tidak ada pesan.</p>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
          {tampil.map((p) => {
            const baru = !!dibaca && !dibaca.has(p.id);
            return (
              <li
                key={p.id}
                onClick={() => baru && tandai("dibaca", userId, [p.id])}
                className={`flex gap-3 p-4 transition-opacity ${baru ? "cursor-pointer" : "opacity-55"}`}
              >
                <span className="relative mt-0.5 shrink-0">
                  {p.ikon}
                  {baru && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-surface" aria-label="Belum dibaca" />}
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className={baru ? "font-bold" : "font-normal"}>{p.judul}</p>
                  <p className={`text-sm ${baru ? "font-semibold text-ink" : "text-ink-2"}`}>{p.isi}</p>
                </div>
                {p.tanggal && <span className="shrink-0 text-xs text-ink-2">{p.tanggal}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
