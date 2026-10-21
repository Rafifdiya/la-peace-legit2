"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { InputPassword } from "@/components/InputPassword";
import { createClient } from "@/lib/supabase/client";

const EVENT = "jj:open-login";
const USERNAME = /^[a-z0-9_]{3,30}$/;
// Nama: huruf, spasi, titik, apostrof, strip. Tanpa angka.
const NAMA = /^[\p{L}][\p{L} .'-]{1,59}$/u;

/** Dipicu navbar saat foto profil & tombol akun sudah siap tampil setelah masuk */
export const EVENT_SESI_SIAP = "jj:sesi-siap";

/** Tunggu navbar siap (atau batas waktu), minimal sebentar agar loading terlihat */
function tungguNavbarSiap(min = 700, maks = 6000) {
  const siap = new Promise<void>((r) => window.addEventListener(EVENT_SESI_SIAP, () => r(), { once: true }));
  const batas = new Promise<void>((r) => setTimeout(r, maks));
  const minimal = new Promise<void>((r) => setTimeout(r, min));
  return Promise.all([Promise.race([siap, batas]), minimal]);
}

/** Buka overlay Masuk dari komponen mana saja (mis. tombol Simpan / vote saat belum login) */
export function openLogin() {
  window.dispatchEvent(new Event(EVENT));
}

// Overlay login pakai <dialog> bawaan browser: tanpa library modal,
// fokus & tombol Esc sudah ditangani browser.
export function LoginDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [mode, setMode] = useState<"masuk" | "daftar" | "lupa">("masuk");
  const [salah, setSalah] = useState(0);
  const [info, setInfo] = useState("");
  const [proses, setProses] = useState(false);
  const [menyiapkan, setMenyiapkan] = useState(false);
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
    setInfo("");

    if (mode === "lupa") {
      // MODE DEMO: tanpa email, password langsung diganti bila email terdaftar
      if (password !== form.get("ulangi")) return setError("Password baru dan ulangi tidak sama.");
      setProses(true);
      const { data: ok, error: err } = await createClient().rpc("reset_password_demo", {
        p_email: email,
        p_password: password,
      });
      setProses(false);
      if (err) return setError("Gagal mengganti password. Coba lagi.");
      if (!ok) return setError("Email tidak terdaftar.");
      setMode("masuk");
      setSalah(0);
      el.reset();
      return setInfo("Password diganti. Silakan masuk dengan password baru.");
    }

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

    // Mulai dengarkan sebelum masuk: navbar bisa siap sangat cepat
    const navbarSiap = tungguNavbarSiap();
    const { data, error } =
      mode === "masuk"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { full_name: nama } } });
    if (error) {
      setProses(false);
      if (mode === "masuk" && /invalid login credentials/i.test(error.message)) setSalah((n) => n + 1);
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

    // Loading sampai foto profil & tombol Keluar di navbar siap, lalu tutup bersamaan
    setMenyiapkan(true);
    await navbarSiap;
    router.refresh();
    setProses(false);
    setMenyiapkan(false);
    ref.current?.close();
    el.reset();
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
        setInfo("");
        setSalah(0);
        ref.current?.querySelector("form")?.reset();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl bg-surface p-0 text-ink backdrop:bg-ink/50"
    >
      {menyiapkan && (
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <Loader2 size={44} className="putar-muat text-brand" aria-hidden />
          <p className="font-display text-2xl font-semibold">{mode === "daftar" ? "Membuat akunmu..." : "Sedang masuk..."}</p>
          <p className="text-sm text-ink-2">Menyiapkan akunmu, sebentar ya.</p>
        </div>
      )}
      <div className={`space-y-5 p-6 ${menyiapkan ? "hidden" : ""}`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 id="login-title" className="font-display text-2xl font-semibold">{mode === "masuk" ? "Masuk" : mode === "daftar" ? "Daftar" : "Lupa password"}</h2>
            <p className="text-sm text-ink-2">
              {mode === "lupa" ? "Mode demo: isi email akunmu, lalu buat password baru." : "Untuk upload, vote, simpan, dan komentar."}
            </p>
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
          <InputPassword
            name="password"
            required
            minLength={6}
            autoComplete={mode === "masuk" ? "current-password" : "new-password"}
            placeholder={mode === "masuk" ? "Password" : mode === "lupa" ? "Password baru (min. 6 karakter)" : "Password (min. 6 karakter)"}
            aria-label="Password"
            className="w-full rounded-sm border border-line px-3 py-2"
          />
          {mode !== "masuk" && (
            <InputPassword name="ulangi" required minLength={6} autoComplete="new-password" placeholder="Ulangi password" aria-label="Ulangi password" className="w-full rounded-sm border border-line px-3 py-2" />
          )}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {info && <p role="status" className="text-sm text-accent">{info}</p>}
          {mode === "masuk" && salah >= 2 && (
            <button type="button" onClick={(e) => {
                // Email tetap terisi, password yang salah dikosongkan
                const pw = e.currentTarget.form?.elements.namedItem("password");
                if (pw instanceof HTMLInputElement) pw.value = "";
                setMode("lupa");
                setError("");
              }} className="mx-auto block text-sm font-bold text-danger hover:underline">
              Lupa password?
            </button>
          )}
          <button disabled={proses} className="w-full rounded-full bg-brand py-2.5 font-semibold text-white hover:bg-brand-hover disabled:opacity-60">
            {proses ? "Memproses..." : mode === "masuk" ? "Masuk" : mode === "daftar" ? "Daftar" : "Ganti password"}
          </button>
        </form>
        <p className="text-center text-sm text-ink-2">
          {mode === "masuk" ? "Belum punya akun? " : mode === "daftar" ? "Sudah punya akun? " : "Ingat password? "}
          <button type="button" onClick={() => { setMode(mode === "masuk" ? "daftar" : "masuk"); setError(""); setInfo(""); }} className="font-semibold text-brand hover:underline">
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
