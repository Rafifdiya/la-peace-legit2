"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const EVENT = "jj:open-login";

/** Buka overlay Masuk dari komponen mana saja (mis. tombol Simpan / vote saat belum login) */
export function openLogin() {
  window.dispatchEvent(new Event(EVENT));
}

// Overlay login pakai <dialog> bawaan browser: tanpa library modal,
// fokus & tombol Esc sudah ditangani browser.
export function LoginDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const [tahap, setTahap] = useState<"isi" | "kirim" | "terkirim">("isi");
  const [error, setError] = useState("");

  async function kirimLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email") as string;
    setTahap("kirim");
    setError("");
    const next = encodeURIComponent(location.pathname + location.search);
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${next}` },
    });
    if (error) {
      setError(error.status === 429 ? "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." : "Gagal mengirim link. Coba lagi.");
      setTahap("isi");
    } else {
      setTahap("terkirim");
    }
  }

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
        {/* Login Google menyusul */}
        {tahap === "terkirim" ? (
          <p role="status" className="rounded-sm bg-subtle p-3 text-sm">
            Link masuk sudah dikirim. Cek email kamu (juga folder Spam), lalu klik link-nya di browser ini.
          </p>
        ) : (
          <form onSubmit={kirimLink} className="space-y-3">
            <input name="email" type="email" required autoComplete="email" placeholder="Email" aria-label="Email" className="w-full rounded-sm border border-line px-3 py-2" />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button disabled={tahap === "kirim"} className="w-full rounded-full bg-brand py-2.5 font-semibold text-white hover:bg-brand-hover disabled:opacity-60">
              {tahap === "kirim" ? "Mengirim..." : "Kirim link masuk"}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
