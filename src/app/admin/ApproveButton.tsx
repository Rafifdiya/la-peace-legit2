"use client";

import { useActionState } from "react";
import { setujui, type HasilAksi } from "./actions";

export function ApproveButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [hasil, aksi, pending] = useActionState<HasilAksi>(() => setujui(id), undefined);
  return (
    <form action={aksi} className="contents">
      <button disabled={pending || disabled} className="rounded-full bg-accent px-3 py-1 text-white disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Menyetujui..." : "Setujui"}
      </button>
      {hasil?.error && <span role="alert" className="text-xs text-danger">{hasil.error}</span>}
    </form>
  );
}
