"use client";

import { useEffect, useState } from "react";
import { EVENT_PREMIUM, KUNCI_LIHAT_IKLAN } from "@/components/TanpaIklanPremium";
import { KUNCI_POPUP, KUNCI_POPUP_ADMIN } from "@/components/PopupIklan";

function Saklar({ nyala, onUbah, judul, ket, mati }: {
  nyala: boolean;
  onUbah: () => void;
  judul: string;
  ket: string;
  mati?: boolean;
}) {
  return (
    <label className={`flex w-fit items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm ${mati ? "opacity-60" : "cursor-pointer"}`}>
      <button
        type="button"
        role="switch"
        aria-checked={nyala}
        disabled={mati}
        onClick={onUbah}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${nyala ? "bg-accent" : "bg-line"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${nyala ? "left-[1.375rem]" : "left-0.5"}`} />
      </button>
      <span>
        <span className="font-semibold">{judul}</span>
        <span className="block text-ink-2">{ket}</span>
      </span>
    </label>
  );
}

/** Admin otomatis Premium (bebas iklan). Saklar ini menampilkan iklan untuk admin sendiri untuk dicek. */
export function LihatIklanToggle() {
  const [lihat, setLihat] = useState(false);
  const [popup, setPopup] = useState(true);

  useEffect(() => {
    // Preferensi per browser saja, bukan untuk pengguna lain
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLihat(localStorage.getItem(KUNCI_LIHAT_IKLAN) === "1");
      setPopup(localStorage.getItem(KUNCI_POPUP_ADMIN) !== "0");
    } catch {}
  }, []);

  function ubahLihat() {
    const baru = !lihat;
    setLihat(baru);
    try { localStorage.setItem(KUNCI_LIHAT_IKLAN, baru ? "1" : "0"); } catch {}
    window.dispatchEvent(new Event(EVENT_PREMIUM));
  }

  function ubahPopup() {
    const baru = !popup;
    setPopup(baru);
    try {
      localStorage.setItem(KUNCI_POPUP_ADMIN, baru ? "1" : "0");
      // Dinyalakan lagi: hitungan 2 menit mulai dari awal
      if (baru) localStorage.removeItem(KUNCI_POPUP);
    } catch {}
    window.dispatchEvent(new Event(EVENT_PREMIUM));
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Saklar
        nyala={lihat}
        onUbah={ubahLihat}
        judul="Tampilkan iklan untuk saya"
        ket="Sidebar, kartu di katalog, dan pop-up. Hanya untuk akun ini di browser ini."
      />
      <Saklar
        nyala={lihat && popup}
        mati={!lihat}
        onUbah={ubahPopup}
        judul="Pop-up iklan untuk saya"
        ket={lihat ? "Tiap 2 menit di beranda, katalog, forum, profil. Menyalakan ulang = hitungan mulai dari awal." : "Nyalakan \"Tampilkan iklan\" dulu."}
      />
    </div>
  );
}
