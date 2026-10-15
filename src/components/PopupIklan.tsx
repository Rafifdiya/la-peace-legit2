"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { Iklan } from "@/lib/iklan";
import { IklanMedia } from "./IklanMedia";
import { EVENT_PREMIUM, useBebasIklan } from "./TanpaIklanPremium";

const JEDA = 50_000; // tunggu 50 detik sebelum tiap pop-up (sejak dibuka / ditutup)
const MAKS_SEHARI = 3;
export const KUNCI_POPUP = "jj:popup-iklan";
/** Saklar admin "Pop-up iklan untuk saya": "0" = mati untuk browser ini */
export const KUNCI_POPUP_ADMIN = "jj:admin-popup-iklan";

type Status = { tgl: string; n: number; berikut: number };
const hariIni = () => new Date().toLocaleDateString("sv");

function bacaStatus(): Status {
  const kosong = { tgl: hariIni(), n: 0, berikut: Date.now() + JEDA };
  try {
    const s = JSON.parse(localStorage.getItem(KUNCI_POPUP) ?? "null") as Status | null;
    if (!s || s.tgl !== kosong.tgl) return kosong;
    // Kembali setelah lama pergi: hitung ulang 50 detik
    if (s.berikut < Date.now() - 5 * 60_000) s.berikut = kosong.berikut;
    return s;
  } catch { return kosong; }
}
function simpan(s: Status) {
  try { localStorage.setItem(KUNCI_POPUP, JSON.stringify(s)); } catch {}
}

/**
 * Pop-up iklan di tengah layar: tiap 50 detik, maks. 3x per hari per browser,
 * bertahan sampai ditutup. Tidak tampil untuk Premium.
 */
export function PopupIklan({ iklan }: { iklan: Iklan[] }) {
  const bebasIklan = useBebasIklan();
  const ref = useRef<HTMLDialogElement>(null);
  const [pilih, setPilih] = useState<Iklan>();
  const [ulang, setUlang] = useState(0);

  useEffect(() => {
    const f = () => setUlang((x) => x + 1);
    window.addEventListener(EVENT_PREMIUM, f);
    return () => window.removeEventListener(EVENT_PREMIUM, f);
  }, []);

  useEffect(() => {
    if (pilih || bebasIklan !== false || iklan.length === 0) return;
    try { if (localStorage.getItem(KUNCI_POPUP_ADMIN) === "0") return; } catch {}
    const s = bacaStatus();
    if (s.n >= MAKS_SEHARI) return;
    simpan(s);
    const t = setTimeout(() => {
      simpan({ ...bacaStatus(), n: s.n + 1 });
      setPilih(iklan[Math.floor(Math.random() * iklan.length)]);
    }, Math.max(0, s.berikut - Date.now()));
    return () => clearTimeout(t);
  }, [pilih, bebasIklan, iklan, ulang]);

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
        // Pop-up berikutnya 50 detik setelah ditutup
        simpan({ ...bacaStatus(), berikut: Date.now() + JEDA });
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
