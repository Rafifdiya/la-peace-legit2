"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Lock, Pencil } from "lucide-react";
import { InputPassword } from "@/components/InputPassword";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { EVENT_PROFIL } from "@/components/AuthNav";
import { segarkanProfil } from "./actions";
import { FotoPerbesar } from "@/components/profil/FotoPerbesar";

const USERNAME = /^[a-z0-9_]{3,30}$/;
const MAKS_MB = 2;

type Pesan = { ok?: string; error?: string };

const kartu = "space-y-3 rounded-xl border border-line bg-surface p-5";
const input = "w-full rounded-sm border border-line px-3 py-2";
const tombol =
  "rounded-full bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-hover disabled:opacity-60";

function Info({ p }: { p: Pesan }) {
  if (p.error)
    return (
      <p role="alert" className="text-sm text-danger">
        {p.error}
      </p>
    );
  if (p.ok)
    return (
      <p role="status" className="text-sm text-accent">
        {p.ok}
      </p>
    );
  return null;
}

function Judul({
  children,
  kunci,
}: {
  children: React.ReactNode;
  kunci?: boolean;
}) {
  return (
    <h2 className="flex items-center gap-2 font-semibold">
      {kunci ? (
        <Lock size={16} className="text-ink-2" aria-hidden />
      ) : (
        <Pencil size={16} className="text-brand" aria-hidden />
      )}
      {children}
      {kunci && (
        <span className="text-xs font-normal text-ink-2">
          (tidak bisa diubah)
        </span>
      )}
    </h2>
  );
}

export function PengaturanForm(awal: {
  userId: string;
  email: string;
  nama: string;
  username: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(awal.avatarUrl);
  const [busy, setBusy] = useState<string>();
  const [pesan, setPesan] = useState<Record<string, Pesan>>({});
  const set = (k: string, p: Pesan) => setPesan((s) => ({ ...s, [k]: p }));

  async function selesai(k: string, ok: string) {
    set(k, { ok });
    await segarkanProfil();
    router.refresh();
  }

  async function gantiFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const asli = e.target.files?.[0];
    e.target.value = "";
    if (!asli) return;
    setBusy("foto");
    set("foto", {});
    try {
      // Di bawah 2 MB: unggah apa adanya; lebih dari itu dikompres otomatis
      const file =
        asli.size <= MAKS_MB * 1024 * 1024 &&
        /^image\/(jpeg|png|webp)$/.test(asli.type)
          ? asli
          : (
              await compressImage(asli, {
                maxSizeMB: 1.9,
                maxWidthOrHeight: 1024,
              })
            ).file;
      const ext = file.type.split("/")[1];
      const path = `${awal.userId}/${Date.now()}.${ext}`;
      const up = await supabase.storage
        .from("avatar")
        .upload(path, file, { contentType: file.type });
      if (up.error) throw new Error(up.error.message);
      const url = supabase.storage.from("avatar").getPublicUrl(path)
        .data.publicUrl;
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", awal.userId);
      if (error) throw new Error(error.message);
      // Hapus foto lama dari storage (bila foto lama dari bucket avatar)
      const lama = avatar?.split("/avatar/")[1];
      if (lama) await supabase.storage.from("avatar").remove([lama]);
      setAvatar(url);
      window.dispatchEvent(new Event(EVENT_PROFIL));
      await selesai(
        "foto",
        asli === file
          ? "Foto profil diperbarui."
          : `Foto dikompres (${Math.round(asli.size / 1024)} KB → ${Math.round(file.size / 1024)} KB) dan diperbarui.`,
      );
    } catch (err) {
      set("foto", { error: `Gagal: ${(err as Error).message}` });
    }
    setBusy(undefined);
  }

  async function gantiUsername(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const username = String(new FormData(e.currentTarget).get("username") ?? "")
      .trim()
      .toLowerCase();
    if (username === awal.username)
      return set("username", { error: "Username masih sama." });
    if (!USERNAME.test(username))
      return set("username", {
        error: "Username 3-30 karakter: huruf kecil, angka, atau _.",
      });
    setBusy("username");
    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", awal.userId);
    setBusy(undefined);
    if (error)
      return set("username", {
        error:
          error.code === "23505"
            ? "Username sudah dipakai, pilih yang lain."
            : error.message,
      });
    await selesai("username", `Username diganti jadi @${username}.`);
  }

  async function gantiEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "")
      .trim()
      .toLowerCase();
    if (email === awal.email)
      return set("email", { error: "Email masih sama." });
    setBusy("email");
    const { data, error } = await supabase.auth.updateUser({ email });
    setBusy(undefined);
    if (error)
      return set("email", {
        error: /already/i.test(error.message)
          ? "Email sudah dipakai akun lain."
          : error.message,
      });
    // Bila Supabase meminta konfirmasi, email baru belum aktif sampai link di email diklik
    if (data.user?.email !== email)
      return set("email", {
        ok: `Cek kotak masuk ${email} untuk konfirmasi perubahan.`,
      });
    await selesai(
      "email",
      "Email diperbarui. Pakai email baru saat masuk berikutnya.",
    );
  }

  async function gantiPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const f = new FormData(el);
    const lama = String(f.get("lama")),
      baru = String(f.get("baru"));
    if (baru.length < 6)
      return set("password", { error: "Password baru minimal 6 karakter." });
    if (baru !== f.get("ulangi"))
      return set("password", { error: "Password baru dan ulangi tidak sama." });
    setBusy("password");
    // Pastikan yang mengganti memang pemilik akun
    const cek = await supabase.auth.signInWithPassword({
      email: awal.email,
      password: lama,
    });
    if (cek.error) {
      setBusy(undefined);
      return set("password", { error: "Password lama salah." });
    }
    const { error } = await supabase.auth.updateUser({ password: baru });
    setBusy(undefined);
    if (error)
      return set("password", {
        error: /different|same/i.test(error.message)
          ? "Password baru harus beda dari yang lama."
          : error.message,
      });
    el.reset();
    set("password", { ok: "Password diperbarui." });
  }

  return (
    <div className="teks-110 grid gap-5 lg:grid-cols-2">
      <section className={kartu}>
        <Judul>Foto profil</Judul>
        <div className="flex items-center gap-4">
          {avatar ? (
            <FotoPerbesar src={avatar} alt="Foto profil">
            <Image
              src={avatar}
              alt="Foto profil"
              // Foto tidak persegi dipotong jadi lingkaran: minta versi besar agar tetap tajam
              width={384}
              height={384}
              sizes="384px"
              quality={75}
              className="h-24 w-24 rounded-full object-cover"
            />
            </FotoPerbesar>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand font-display text-4xl text-white">
              {(awal.nama || awal.username || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={!!busy}
              className="flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm hover:border-brand disabled:opacity-60"
            >
              <Camera size={16} aria-hidden />{" "}
              {busy === "foto" ? "Mengunggah..." : "Ganti foto"}
            </button>
            <p className="text-xs text-ink-2">
              JPG/PNG/WebP. Lebih dari 2 MB dikompres otomatis.
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={gantiFoto}
            className="hidden"
          />
        </div>
        <Info p={pesan.foto ?? {}} />
      </section>

      <section className={kartu}>
        <Judul kunci>Nama asli</Judul>
        <p className="rounded-sm border border-line bg-subtle px-3 py-2 text-ink-2">
          {awal.nama || "-"}
        </p>
        <p className="text-xs text-ink-2">
          Nama asli dikunci agar kontribusi tetap bisa dipercaya. Hubungi admin
          bila ada salah ketik.
        </p>
      </section>

      <form onSubmit={gantiUsername} className={kartu}>
        <Judul>Username</Judul>
        <div className="flex gap-2">
          <input
            name="username"
            defaultValue={awal.username}
            required
            pattern="[A-Za-z0-9_]{3,30}"
            onChange={(e) =>
              (e.currentTarget.value = e.currentTarget.value.toLowerCase())
            }
            autoCapitalize="none"
            aria-label="Username"
            className={input}
          />
          <button disabled={!!busy} className={tombol}>
            {busy === "username" ? "..." : "Simpan"}
          </button>
        </div>
        <Info p={pesan.username ?? {}} />
      </form>

      <form onSubmit={gantiEmail} className={kartu}>
        <Judul>Email</Judul>
        <div className="flex gap-2">
          <input
            name="email"
            type="email"
            defaultValue={awal.email}
            required
            autoComplete="email"
            aria-label="Email"
            className={input}
          />
          <button disabled={!!busy} className={tombol}>
            {busy === "email" ? "..." : "Simpan"}
          </button>
        </div>
        <Info p={pesan.email ?? {}} />
      </form>

      <form onSubmit={gantiPassword} className={`${kartu} lg:col-span-2`}>
        <Judul>Password</Judul>
        <div className="grid gap-3 sm:grid-cols-3">
          <InputPassword
            name="lama"
            required
            autoComplete="current-password"
            placeholder="Password lama"
            aria-label="Password lama"
            className={input}
          />
          <InputPassword
            name="baru"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Password baru (min. 6 karakter)"
            aria-label="Password baru"
            className={input}
          />
          <InputPassword
            name="ulangi"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Ulangi password baru"
            aria-label="Ulangi password baru"
            className={input}
          />
        </div>
        <button disabled={!!busy} className={tombol}>
          {busy === "password" ? "Menyimpan..." : "Ganti password"}
        </button>
        <Info p={pesan.password ?? {}} />
      </form>
    </div>
  );
}
