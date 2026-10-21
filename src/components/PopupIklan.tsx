"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import type { Iklan } from "@/lib/iklan";
import { IklanMedia } from "./IklanMedia";
import { EVENT_PREMIUM, useBebasIklan } from "./TanpaIklanPremium";

const JEDA_DETIK = 120; // pop-up tiap 2 menit berada di halaman yang diizinkan
export const KUNCI_POPUP = "jj:popup-iklan";
/** Saklar admin "Pop-up iklan untuk saya": "0" = mati untuk browser ini */
export const KUNCI_POPUP_ADMIN = "jj:admin-popup-iklan";

/** Halaman yang boleh menampilkan pop-up: beranda, katalog, forum, profil sendiri */
function halamanBoleh(path: string) {
  return path === "/" || path === "/katalog" || path === "/request" || path.startsWith("/request/") || path === "/profil/saya";
}

/** Detik yang sudah terkumpul di halaman-halaman di atas (tersimpan, tidak reset saat pindah halaman) */
function bacaDetik(): number {
  try {
    const n = Number(localStorage.getItem(KUNCI_POPUP));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch { return 0; }
}
function simpanDetik(n: number) {
  try { localStorage.setItem(KUNCI_POPUP, String(n)); } catch {}
}

/**
 * Pop-up iklan di tengah layar: muncul setelah 2 menit berada di beranda, katalog,
 * forum, atau profil sendiri. Waktunya dijumlahkan antar keempat halaman itu (tidak
 * reset saat pindah di antaranya), berhenti dihitung di halaman lain / tab tidak aktif.
 * Tanpa batas harian. Tidak tampil untuk Premium.
 */
export function PopupIklan({ iklan }: { iklan: Iklan[] }) {
  const bebasIklan = useBebasIklan();
  const path = usePathname();
  const ref = useRef<HTMLDialogElement>(null);
  const [pilih, setPilih] = useState<Iklan>();
  const [ulang, setUlang] = useState(0);

  useEffect(() => {
    const f = () => setUlang((x) => x + 1);
    window.addEventListener(EVENT_PREMIUM, f);
    return () => window.removeEventListener(EVENT_PREMIUM, f);
  }, []);

  useEffect(() => {
    if (pilih || bebasIklan !== false || iklan.length === 0 || !halamanBoleh(path)) return;
    try { if (localStorage.getItem(KUNCI_POPUP_ADMIN) === "0") return; } catch {}
    const t = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const n = bacaDetik() + 1;
      if (n < JEDA_DETIK) return simpanDetik(n);
      simpanDetik(0);
      setPilih(iklan[Math.floor(Math.random() * iklan.length)]);
    }, 1000);
    return () => clearInterval(t);
  }, [pilih, bebasIklan, iklan, ulang, path]);

  useEffect(() => {
    if (pilih && !ref.current?.open) ref.current?.showModal();
  }, [pilih]);

  if (!pilih) return null;
  const tutup = () => ref.current?.close();
  const media = <IklanMedia iklan={pilih} kotak />;

  return (
    <dialog
      ref={ref}
      aria-label="Iklan"
      onClose={() => {
        // Hitungan 2 menit berikutnya dimulai setelah ditutup
        simpanDetik(0);
        setPilih(undefined);
      }}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-lg bg-surface p-0 text-ink backdrop:bg-ink/50"
    >
      <div className="relative">
        {pilih.linkUrl ? (
          <a href={pilih.linkUrl} target="_blank" rel="noopener sponsored" onClick={tutup} className="block">{media}</a>
        ) : (
          media
        )}
        <span className="absolute left-2 top-2 rounded-sm bg-ink/70 px-1.5 py-0.5 text-xs font-semibold text-white">Iklan</span>
        <button
          type="button"
          onClick={tutup}
          aria-label="Tutup iklan"
          className="absolute right-2 top-2 rounded-full bg-ink/70 p-1.5 text-white hover:bg-ink"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="text-ink-2">{pilih.judul}</span>
        <Link href="/premium" onClick={tutup} className="shrink-0 font-semibold text-brand underline">Bebas iklan</Link>
      </div>
    </dialog>
  );
}
