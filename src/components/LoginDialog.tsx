"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const EVENT = "jj:open-login";

/** Buka overlay Masuk dari komponen mana saja (mis. tombol Simpan / vote saat belum login) */
export function openLogin() {
  window.dispatchEvent(new Event(EVENT));
}

// Overlay login pakai <dialog> bawaan browser: tanpa library modal,
// fokus & tombol Esc sudah ditangani browser.
export function LoginDialog() {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const open = () => ref.current?.showModal();
    window.addEventListener(EVENT, open);
    return () => window.removeEventListener(EVENT, open);
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="login-title"
      // Klik di luar kotak (backdrop) menutup dialog
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl bg-surface p-0 text-ink backdrop:bg-ink/50"
    >
      <div className="space-y-5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="login-title" className="font-display text-2xl font-semibold">Masuk</h2>
            <p className="text-sm text-ink-2">Untuk upload, vote, simpan, dan komentar.</p>
          </div>
          <button onClick={() => ref.current?.close()} aria-label="Tutup" className="rounded-full p-1 hover:bg-subtle">
            <X size={20} />
          </button>
        </div>
        <button className="w-full rounded-full border border-line py-2.5 font-semibold hover:border-brand">
          Masuk dengan Google
        </button>
        <div className="flex items-center gap-3 text-xs text-ink-2">
          <span className="h-px flex-1 bg-line" /> atau <span className="h-px flex-1 bg-line" />
        </div>
        <form method="dialog" className="space-y-3">
          <input type="email" required placeholder="Email" aria-label="Email" className="w-full rounded-sm border border-line px-3 py-2" />
          <button className="w-full rounded-full bg-brand py-2.5 font-semibold text-white hover:bg-brand-hover">
            Kirim link masuk
          </button>
        </form>
        <p className="text-center text-xs text-ink-2">Template: login belum aktif (menunggu Supabase).</p>
      </div>
    </dialog>
  );
}
