"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { abaikanLaporan, hapusKontenForum } from "./laporan-actions";

const btn = "rounded-full border border-line px-3 py-1 hover:border-brand disabled:opacity-60";

/** Tombol laporan: Hapus konten (khusus forum) dan Abaikan. */
export function AksiLaporan({ id, jenis, targetId }: { id: string; jenis: string; targetId: string }) {
  const router = useRouter();
  const [pending, mulai] = useTransition();
  const [error, setError] = useState<string>();
  const jalankan = (aksi: () => Promise<{ error?: string } | undefined>) =>
    mulai(async () => {
      const r = await aksi();
      setError(r?.error);
      if (!r?.error) router.refresh();
    });
  const forum = jenis === "forum_post" || jenis === "forum_reply";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {forum && (
        <button
          type="button"
          disabled={pending}
          onClick={() => confirm("Hapus konten ini?") && jalankan(() => hapusKontenForum(id, jenis, targetId))}
          className="rounded-full bg-danger px-3 py-1 text-white disabled:opacity-60"
        >
          Hapus konten
        </button>
      )}
      <button type="button" disabled={pending} onClick={() => jalankan(() => abaikanLaporan(id))} className={btn}>
        Abaikan
      </button>
      {error && <span role="alert" className="text-xs text-danger">{error}</span>}
    </div>
  );
}
