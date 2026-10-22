"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Mail, Settings, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EVENT_SESI_SIAP } from "./LoginDialog";
import { LoginButton } from "./LoginButton";
import { EVENT_PREMIUM } from "./TanpaIklanPremium";
import { EVENT_PENGATURAN, bacaPengaturan } from "@/lib/pengaturan";
import { EVENT_PESAN, bacaDibaca, idPesan, keTanya } from "@/lib/pesan";

type Status = { masuk: boolean; admin: boolean; avatar: string | null; premium: boolean; email?: string } | null;

/** Dipicu halaman Pengaturan profil setelah foto diganti */
export const EVENT_PROFIL = "jj:profil-berubah";

/** Bagian navbar yang bergantung login: tombol Masuk, atau link Profil/Admin + Keluar. */
export function AuthNav() {
  const [status, setStatus] = useState<Status>(null);
  const [lencana, setLencana] = useState(true);
  const [adaPesanBaru, setAdaPesanBaru] = useState(false);
  const diPengaturan = usePathname().startsWith("/profil/saya/pengaturan");

  useEffect(() => {
    const supabase = createClient();

    async function muat(userId: string | undefined, email?: string) {
      if (!userId) return setStatus({ masuk: false, admin: false, avatar: null, premium: false });
      const { data } = await supabase.from("profiles").select("role, avatar_url, premium_sampai").eq("id", userId).single();
      const admin = data?.role === "admin";
      // Admin otomatis Premium (migration 0012)
      const premium = admin || (!!data?.premium_sampai && new Date(data.premium_sampai) > new Date());
      const avatar = data?.avatar_url ?? null;
      // Muat foto profil dulu (maks. 2 detik) agar foto & tombol muncul bersamaan
      if (avatar) {
        await new Promise<void>((r) => {
          const img = new window.Image();
          img.onload = img.onerror = () => r();
          img.src = avatar;
          setTimeout(r, 2000);
        });
      }
      setStatus({ masuk: true, admin, avatar, premium, email });
      window.dispatchEvent(new Event(EVENT_SESI_SIAP));
      cekPesan(userId, admin);
    }

    // Titik merah: ada pesan yang belum pernah dilihat di halaman Pesan
    let ids: string[] = [];
    let uid = "";
    async function cekPesan(userId: string, admin: boolean) {
      const [{ data: milikku }, moderasi, { data: tanya }] = await Promise.all([
        supabase.from("snacks").select("id, status").eq("created_by", userId),
        admin ? supabase.from("snacks").select("id", { count: "exact", head: true }).eq("status", "pending") : null,
        supabase.from("requests").select("id, judul, request_answers!request_answers_request_id_fkey(count)").eq("created_by", userId),
      ]);
      uid = userId;
      ids = idPesan(milikku ?? [], moderasi?.count ?? 0, keTanya(tanya));
      hitungPesan();
    }
    function hitungPesan() {
      const dibaca = bacaDibaca(uid);
      setAdaPesanBaru(ids.some((id) => !dibaca.has(id)));
    }
    window.addEventListener(EVENT_PESAN, hitungPesan);

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      muat(session?.user.id, session?.user.email);
    });
    const ulang = () => supabase.auth.getUser().then(({ data }) => muat(data.user?.id, data.user?.email));
    window.addEventListener(EVENT_PROFIL, ulang);
    window.addEventListener(EVENT_PREMIUM, ulang); // Premium demo diaktifkan / dibatalkan
    // Lencana Prem bisa disembunyikan di /pengaturan
    const cekLencana = () => setLencana(bacaPengaturan("lencana"));
    cekLencana();
    window.addEventListener(EVENT_PENGATURAN, cekLencana);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener(EVENT_PROFIL, ulang);
      window.removeEventListener(EVENT_PREMIUM, ulang);
      window.removeEventListener(EVENT_PENGATURAN, cekLencana);
      window.removeEventListener(EVENT_PESAN, hitungPesan);
    };
  }, []);

  const dialog = useRef<HTMLDialogElement>(null);
  const [keluarBusy, setKeluarBusy] = useState(false);

  async function keluar() {
    setKeluarBusy(true);
    await createClient().auth.signOut();
    // Muat ulang penuh ke beranda agar semua data akun hilang dari halaman
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- sengaja muat ulang penuh
    window.location.assign("/");
  }

  // Selama cek sesi, sisakan ruang kosong agar navbar tidak bergeser.
  if (!status) return <span className="w-14" aria-hidden />;

  if (!status.masuk) {
    return <LoginButton className="nav-masuk rounded-full border border-line bg-surface px-[1.155rem] py-[0.578rem] text-[1.155rem] hover:border-brand">Masuk</LoginButton>;
  }

  return (
    <div className="flex items-center gap-4 text-[1.155rem]">
      {status.admin && (
        <Link href="/admin" className="nav-besar hover:text-brand">
          Admin
        </Link>
      )}
      <button type="button" onClick={() => dialog.current?.showModal()} className="nav-besar rounded-full border border-line bg-surface px-[1.155rem] py-[0.578rem] transition-colors hover:border-danger hover:bg-danger hover:text-white">
        Keluar
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="judul-keluar"
        onClick={(e) => e.target === e.currentTarget && !keluarBusy && dialog.current?.close()}
        className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-6 text-base text-ink backdrop:bg-black/40"
      >
        <div className="space-y-4 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger"><LogOut size={22} aria-hidden /></span>
          <h2 id="judul-keluar" className="font-display text-2xl font-semibold">Keluar dari akun?</h2>
          <p className="text-sm text-ink-2">Kamu perlu masuk lagi untuk mengirim jajanan, menyimpan, dan memakai fitur Premium.</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => dialog.current?.close()} disabled={keluarBusy} className="flex-1 rounded-full border border-line py-2.5 hover:border-brand disabled:opacity-60">
              Tidak
            </button>
            <button type="button" onClick={keluar} disabled={keluarBusy} className="flex-1 rounded-full bg-danger py-2.5 font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {keluarBusy ? "Keluar..." : "Ya, keluar"}
            </button>
          </div>
        </div>
      </dialog>
      {/* Profil: saat hover, "Profil saya" terbuka ke kiri (seperti Pesan & Pengaturan) dan
          balon kecil berisi email muncul di bawah foto; keduanya tidak tampil di halaman Pengaturan profil */}
      <Link
        href="/profil/saya"
        aria-label={status.email ? `Profil akun (${status.email})` : "Profil akun"}
        className="nav-besar group hidden h-[2.55rem] items-center rounded-full border border-transparent hover:border-line hover:bg-surface md:flex"
      >
        {!diPengaturan && (
          <span className="buka-geser max-w-0 overflow-hidden whitespace-nowrap text-ink-2 opacity-0 transition-[max-width,opacity,margin,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:ml-3 group-hover:mr-2 group-hover:max-w-[18rem] group-hover:opacity-100 group-focus-visible:ml-3 group-focus-visible:mr-2 group-focus-visible:max-w-[18rem] group-focus-visible:opacity-100">
            Profil saya
          </span>
        )}
        <span className="relative shrink-0">
          <span className="flex h-[2.55rem] w-[2.55rem] items-center justify-center overflow-hidden rounded-full bg-brand text-white ring-2 ring-orange-500/40 group-hover:bg-brand-hover">
            {status.avatar ? (
              // Foto tidak persegi dipotong jadi lingkaran: minta versi besar agar tetap tajam
              <Image src={status.avatar} alt="" width={256} height={256} sizes="256px" quality={60} className="h-full w-full object-cover" />
            ) : (
              <UserRound size={22} />
            )}
          </span>
          {status.premium && lencana && (
            // Lencana Premium di pojok kanan bawah avatar, teks berkilau seperti menu Premium di sidebar
            <span className="pointer-events-none absolute -bottom-1.5 -right-3 rounded-full border border-amber-400 bg-surface px-1.5 py-px text-[0.75rem] leading-tight shadow-sm">
              <span className="kilau font-bold">{status.admin ? "Admin" : "Prem"}</span>
            </span>
          )}
          {!diPengaturan && status.email && (
            // Balon seperti di komik: ekor kecil menunjuk ke foto profil
            <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 whitespace-nowrap rounded-xl bg-ink px-2.5 py-1 text-center text-[0.75rem] text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-ink" aria-hidden />
              {status.email}
            </span>
          )}
        </span>
      </Link>
      {/* Pesan: bentuk sama dengan tombol Pengaturan, tulisan terbuka ke kiri saat hover */}
      <Link
        href="/pesan"
        aria-label={adaPesanBaru ? "Pesan (ada pesan baru)" : "Pesan"}
        className="nav-besar group relative hidden h-[2.55rem] items-center rounded-full border border-line bg-surface px-[0.6rem] text-ink-2 hover:border-brand hover:text-brand md:flex"
      >
        <span className="buka-geser max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,margin,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:mr-1.5 group-hover:max-w-[8rem] group-hover:pl-1 group-hover:opacity-100 group-focus-visible:mr-1.5 group-focus-visible:max-w-[8rem] group-focus-visible:pl-1 group-focus-visible:opacity-100">
          Pesan
        </span>
        <Mail size={22} aria-hidden className="shrink-0" />
        {adaPesanBaru && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-600 ring-2 ring-page" aria-hidden />}
      </Link>
      {/* Pengaturan fitur: gear berputar pelan & tulisan terbuka ke kiri saat hover */}
      <Link
        href="/pengaturan"
        aria-label="Pengaturan"
        className="nav-besar group hidden h-[2.55rem] items-center rounded-full border border-line bg-surface px-[0.6rem] text-ink-2 hover:border-brand hover:text-brand md:flex"
      >
        <span className="buka-geser max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,margin,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:mr-1.5 group-hover:max-w-[8rem] group-hover:pl-1 group-hover:opacity-100 group-focus-visible:mr-1.5 group-focus-visible:max-w-[8rem] group-focus-visible:pl-1 group-focus-visible:opacity-100">
          Pengaturan
        </span>
        <Settings size={22} aria-hidden className="gear-putar shrink-0" />
      </Link>
    </div>
  );
}
