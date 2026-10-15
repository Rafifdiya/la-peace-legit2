"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LoginButton } from "./LoginButton";
import { EVENT_PREMIUM } from "./TanpaIklanPremium";
import { EVENT_PENGATURAN, bacaPengaturan } from "@/lib/pengaturan";

type Status = { masuk: boolean; admin: boolean; avatar: string | null; premium: boolean } | null;

/** Dipicu halaman Pengaturan profil setelah foto diganti */
export const EVENT_PROFIL = "jj:profil-berubah";

/** Bagian navbar yang bergantung login: tombol Masuk, atau link Profil/Admin + Keluar. */
export function AuthNav() {
  const [status, setStatus] = useState<Status>(null);
  const [lencana, setLencana] = useState(true);
  const diPengaturan = usePathname().startsWith("/profil/saya/pengaturan");

  useEffect(() => {
    const supabase = createClient();

    async function muat(userId: string | undefined) {
      if (!userId) return setStatus({ masuk: false, admin: false, avatar: null, premium: false });
      const { data } = await supabase.from("profiles").select("role, avatar_url, premium_sampai").eq("id", userId).single();
      const admin = data?.role === "admin";
      // Admin otomatis Premium (migration 0012)
      const premium = admin || (!!data?.premium_sampai && new Date(data.premium_sampai) > new Date());
      setStatus({ masuk: true, admin, avatar: data?.avatar_url ?? null, premium });
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      muat(session?.user.id);
    });
    const ulang = () => supabase.auth.getUser().then(({ data }) => muat(data.user?.id));
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
    return <LoginButton className="rounded-full border border-line bg-surface px-[1.155rem] py-[0.578rem] text-[1.155rem] hover:border-brand">Masuk</LoginButton>;
  }

  return (
    <div className="flex items-center gap-4 text-[1.155rem]">
      {status.admin && (
        <Link href="/admin" className="hover:text-brand">
          Admin
        </Link>
      )}
      <button type="button" onClick={() => dialog.current?.showModal()} className="rounded-full border border-line bg-surface px-[1.155rem] py-[0.578rem] transition-colors hover:border-danger hover:bg-danger hover:text-white">
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
      <div className="group relative hidden md:block">
      <Link href="/profil/saya" aria-label="Profil akun" className="flex h-[2.55rem] w-[2.55rem] items-center justify-center overflow-hidden rounded-full bg-brand text-white ring-2 ring-orange-500/40 hover:bg-brand-hover">
        {status.avatar ? (
          // Foto tidak persegi dipotong jadi lingkaran: minta versi besar agar tetap tajam
          <Image src={status.avatar} alt="" width={256} height={256} sizes="256px" quality={60} className="h-full w-full object-cover" />
        ) : (
          <UserRound size={22} />
        )}
      </Link>
      {status.premium && lencana && (
        // Lencana Premium di pojok kanan bawah avatar, teks berkilau seperti menu Premium di sidebar
        <span className="pointer-events-none absolute -bottom-1.5 -right-3 rounded-full border border-amber-400 bg-surface px-1.5 py-px text-[0.65rem] leading-tight shadow-sm">
          <span className="kilau font-bold">Prem</span>
        </span>
      )}
      {/* Tulisan saat hover (seperti tombol Kontak admin), kecuali di halaman Pengaturan profil */}
      {!diPengaturan && (
        <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-sm font-semibold text-page opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          Profil akun
        </span>
      )}
      </div>
      {/* Pengaturan fitur (khusus user): gear berputar pelan & tulisan terbuka ke kiri saat hover */}
      {!status.admin && (
        <Link
          href="/pengaturan"
          aria-label="Pengaturan"
          className="group hidden h-[2.55rem] items-center rounded-full border border-line bg-surface px-[0.6rem] text-ink-2 hover:border-brand hover:text-brand md:flex"
        >
          <span className="buka-geser max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity,margin,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:mr-1.5 group-hover:max-w-[8rem] group-hover:pl-1 group-hover:opacity-100 group-focus-visible:mr-1.5 group-focus-visible:max-w-[8rem] group-focus-visible:pl-1 group-focus-visible:opacity-100">
            Pengaturan
          </span>
          <Settings size={22} aria-hidden className="gear-putar shrink-0" />
        </Link>
      )}
    </div>
  );
}
