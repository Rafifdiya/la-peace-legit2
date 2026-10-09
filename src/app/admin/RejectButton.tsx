"use client";

import { useRef } from "react";

// Overlay "Tolak kiriman": alasan wajib diisi (docs/03 Flow E)
export function RejectButton({ judul }: { judul: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button onClick={() => ref.current?.showModal()} className="rounded-full border border-danger px-3 py-1 text-danger hover:bg-danger hover:text-white">
        Tolak
      </button>
      <dialog ref={ref} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-surface p-6 text-ink backdrop:bg-ink/50">
        <form method="dialog" className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Tolak &quot;{judul}&quot;</h2>
          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold">Alasan (dikirim ke pengirim) *</span>
            <textarea required rows={3} className="w-full rounded-sm border border-line px-3 py-2" placeholder="mis. Foto buram, mohon unggah ulang." />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => ref.current?.close()} className="rounded-full border border-line px-4 py-2 text-sm">Batal</button>
            <button className="rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white">Tolak kiriman</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
