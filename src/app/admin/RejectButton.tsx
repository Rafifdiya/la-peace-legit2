"use client";

import { useActionState, useEffect, useRef } from "react";
import { tolak, type HasilAksi } from "./actions";

// Overlay "Tolak kiriman": alasan wajib diisi (docs/03 Flow E)
export function RejectButton({ id, judul }: { id: string; judul: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [hasil, aksi, pending] = useActionState<HasilAksi, FormData>(tolak.bind(null, id), undefined);

  // Tutup overlay setelah berhasil
  useEffect(() => {
    if (hasil && !hasil.error) ref.current?.close();
  }, [hasil]);

  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className="rounded-full border border-danger px-3 py-1 text-danger hover:bg-danger hover:text-white">
        Tolak
      </button>
      <dialog ref={ref} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-surface p-6 text-ink backdrop:bg-ink/50">
        <form action={aksi} className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Tolak &quot;{judul}&quot;</h2>
          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Alasan (dikirim ke pengirim) *</span>
            <textarea name="alasan" required rows={3} className="w-full rounded-sm border border-line px-3 py-2" placeholder="mis. Foto buram, mohon unggah ulang." />
          </label>
          {hasil?.error && <p role="alert" className="text-sm text-danger">{hasil.error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => ref.current?.close()} className="rounded-full border border-line px-4 py-2 text-sm">Batal</button>
            <button disabled={pending} className="rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {pending ? "Menolak..." : "Tolak kiriman"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
