"use client";

import { useActionState } from "react";
import { daftarMinat } from "./actions";

export function FormMinat() {
  const [hasil, kirim, proses] = useActionState(daftarMinat, undefined);

  if (hasil?.ok) {
    return (
      <p role="status" className="rounded-lg bg-accent/10 p-4 font-semibold text-accent">
        Terima kasih! Kami kabari lewat email saat kelas pertama dibuka.
      </p>
    );
  }

  return (
    <form action={kirim} className="space-y-3">
      <input name="email" type="email" required maxLength={200} placeholder="Email kamu" aria-label="Email" className="w-full rounded-sm border border-line bg-surface px-3 py-2" />
      <input name="jajanan" maxLength={100} placeholder="Jajanan yang ingin dipelajari (opsional)" aria-label="Jajanan yang ingin dipelajari" className="w-full rounded-sm border border-line bg-surface px-3 py-2" />
      {hasil?.error && <p role="alert" className="text-sm text-danger">{hasil.error}</p>}
      <button disabled={proses} className="w-full rounded-full bg-brand py-2.5 font-semibold text-white hover:bg-brand-hover disabled:opacity-60">
        {proses ? "Menyimpan..." : "Daftar minat"}
      </button>
      <p className="text-xs text-ink-2">Email hanya dipakai untuk kabar kelas, tidak dibagikan.</p>
    </form>
  );
}
