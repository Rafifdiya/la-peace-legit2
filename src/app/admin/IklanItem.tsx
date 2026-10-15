"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { IklanMedia } from "@/components/IklanMedia";
import { formatTanggal } from "@/lib/format";
import type { Iklan } from "@/lib/iklan";
import { hapusIklan, setAktifIklan } from "./iklan-actions";

const btn = "rounded-full border border-line px-3 py-1 hover:border-brand disabled:opacity-50";

export function IklanItem({ iklan }: { iklan: Iklan }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function jalankan(aksi: () => Promise<{ error?: string } | undefined>) {
    start(async () => {
      const res = await aksi();
      if (res?.error) alert(res.error);
      router.refresh();
    });
  }

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-4 text-sm sm:flex-row sm:items-center">
      <div className="w-full sm:w-40">
        <IklanMedia iklan={iklan} />
      </div>
      <div className="flex-1 space-y-1">
        <p className="font-semibold">{iklan.judul}</p>
        <p className="break-all text-ink-2">{iklan.linkUrl ?? "Tanpa link"}</p>
        <p className="text-ink-2">
          {iklan.jenis === "video" ? "Video" : "Foto"} · {formatTanggal(iklan.tanggal)} ·{" "}
          <span className={iklan.aktif ? "font-semibold text-accent" : ""}>{iklan.aktif ? "Aktif" : "Nonaktif"}</span>
        </p>
      </div>
      <div className="flex gap-2">
        <button disabled={pending} onClick={() => jalankan(() => setAktifIklan(iklan.id, !iklan.aktif))} className={btn}>
          {iklan.aktif ? "Nonaktifkan" : "Aktifkan"}
        </button>
        <button
          disabled={pending}
          onClick={() => {
            if (confirm(`Hapus iklan "${iklan.judul}"?`)) jalankan(() => hapusIklan(iklan.id, iklan.mediaUrl));
          }}
          className="rounded-full bg-danger px-3 py-1 text-white disabled:opacity-50"
        >
          Hapus
        </button>
      </div>
    </li>
  );
}
