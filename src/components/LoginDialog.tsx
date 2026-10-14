"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const EVENT = "jj:open-login";
const USERNAME = /^[a-z0-9_]{3,30}$/;
// Nama: huruf, spasi, titik, apostrof, strip. Tanpa angka.
const NAMA = /^[\p{L}][\p{L} .'-]{1,59}$/u;

/** Buka overlay Masuk dari komponen mana saja (mis. tombol Simpan / vote saat belum login) */
export function openLogin() {
  window.dispatchEvent(new Event(EVENT));
}

// Overlay login pakai <dialog> bawaan browser: tanpa library modal,
// fokus & tombol Esc sudah ditangani browser.
export function LoginDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [proses, setProses] = useState(false);
  const [error, setError] = useState("");

  // Sementara: email + password tanpa verifikasi email ("Confirm email" dimatikan di Supabase).
  async function kirim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const form = new FormData(el);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    // Rapikan spasi ganda supaya "Rafif  Diya" dan "Rafif Diya" dianggap sama
    const nama = String(form.get("nama") ?? "").trim().replace(/\s+/g, " ");
    const username = String(form.get("username") ?? "").trim().toLowerCase();
    setError("");

    if (mode === "daftar") {
      if (!NAMA.test(nama)) return setError("Nama 2-60 huruf, tanpa angka atau simbol.");
      if (!USERNAME.test(username)) return setError("Username 3-30 karakter: huruf, angka, atau _ (tanpa spasi).");
      if (password !== form.get("ulangi")) return setError("Password dan ulangi password tidak sama.");
    }

    setProses(true);
    const supabase = createClient();

    if (mode === "daftar") {
      // Cek username sebelum akun dibuat
      const { data: dipakai } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
      if (dipakai) {
        setProses(false);
        return setError("Username sudah dipakai, pilih yang lain.");
      }
      // Nama juga unik (huruf besar/kecil dianggap sama)
      const { data: namaDipakai } = await supabase
        .from("profiles")
        .select("id")
        .ilike("nama_tampil", nama) // aman: NAMA tidak mengizinkan % atau _
        .maybeSingle();
      if (namaDipakai) {
        setProses(false);
        return setError("Nama sudah dipakai, pakai nama lain (mis. tambah nama belakang).");
      }
    }

    const { data, error } =
      mode === "masuk"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { full_name: nama } } });
    if (error) {
      setProses(false);
      return setError(pesanError(error.message, error.status));
    }
    if (!data.session) {
      // Terjadi jika "Confirm email" di Supabase masih aktif
      setProses(false);
      return setError("Akun dibuat, tapi email perlu dikonfirmasi dulu. Matikan \"Confirm email\" di Supabase untuk mode tes.");
    }

    if (mode === "daftar") {
      // Profil dibuat otomatis oleh trigger; isi username & nama di sini
      const { error: errProfil } = await supabase
        .from("profiles")
        .update({ username, nama_tampil: nama })
        .eq("id", data.session.user.id);
      if (errProfil) {
        setProses(false);
        return setError(
          errProfil.code === "23505"
            ? "Akun dibuat, tapi nama atau username baru saja dipakai orang lain. Ganti nanti di profil."
            : "Akun dibuat, tapi username gagal disimpan.",
        );
      }
    }

    setProses(false);
    ref.current?.close();
    el.reset();
    router.refresh();
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
      // Setiap ditutup, kembali ke mode Masuk dengan form kosong
      onClose={() => {
        setMode("masuk");
        setError("");
        ref.current?.querySelector("form")?.reset();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl bg-surface p-0 text-ink backdrop:bg-ink/50"
    >
      <div className="space-y-5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="login-title" className="font-display text-2xl font-semibold">{mode === "masuk" ? "Masuk" : "Daftar"}</h2>
            <p className="text-sm text-ink-2">Untuk upload, vote, simpan, dan komentar.</p>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-sm text-ink-2 transition-colors hover:bg-danger/15 hover:text-danger"
          >
            <X size={16} aria-hidden /> Tutup
          </button>
        </div>
        {/* Login Google menyusul */}
        <form onSubmit={kirim} className="space-y-3">
          {mode === "daftar" && (
            <>
              <input name="nama" required maxLength={60} autoComplete="name" placeholder="Nama (tanpa angka)" aria-label="Nama" className="w-full rounded-sm border border-line px-3 py-2" />
              <input
                name="username"
                required
                pattern="[A-Za-z0-9_]{3,30}"
                title="3-30 karakter: huruf, angka, atau _ (otomatis jadi huruf kecil)"
                onChange={(e) => (e.currentTarget.value = e.currentTarget.value.toLowerCase())}
                autoComplete="username"
                autoCapitalize="none"
                placeholder="Username (mis. sari_jajan)"
                aria-label="Username"
                className="w-full rounded-sm border border-line px-3 py-2"
              />
            </>
          )}
          <input name="email" type="email" required autoComplete="email" placeholder="Email" aria-label="Email" className="w-full rounded-sm border border-line px-3 py-2" />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "masuk" ? "current-password" : "new-password"}
            placeholder={mode === "masuk" ? "Password" : "Password (min. 6 karakter)"}
            aria-label="Password"
            className="w-full rounded-sm border border-line px-3 py-2"
          />
          {mode === "daftar" && (
            <input name="ulangi" type="password" required minLength={6} autoComplete="new-password" placeholder="Ulangi password" aria-label="Ulangi password" className="w-full rounded-sm border border-line px-3 py-2" />
          )}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button disabled={proses} className="w-full rounded-full bg-brand py-2.5 font-semibold text-white hover:bg-brand-hover disabled:opacity-60">
            {proses ? "Memproses..." : mode === "masuk" ? "Masuk" : "Daftar"}
          </button>
        </form>
        <p className="text-center text-sm text-ink-2">
          {mode === "masuk" ? "Belum punya akun? " : "Sudah punya akun? "}
          <button type="button" onClick={() => { setMode(mode === "masuk" ? "daftar" : "masuk"); setError(""); }} className="font-semibold text-brand hover:underline">
            {mode === "masuk" ? "Daftar" : "Masuk"}
          </button>
        </p>
      </div>
    </dialog>
  );
}

function pesanError(pesan: string, status?: number) {
  if (status === 429) return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
  if (/invalid login credentials/i.test(pesan)) return "Email atau password salah.";
  if (/already registered/i.test(pesan)) return "Email sudah terdaftar. Silakan masuk.";
  if (/password/i.test(pesan)) return "Password minimal 6 karakter.";
  return "Gagal. Coba lagi.";
}
