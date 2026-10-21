"use client";

import { useEffect } from "react";
import { EVENT_PENGATURAN, UKURAN_TEKS, bacaPengaturan, bacaUkuranTeks } from "@/lib/pengaturan";

/** Pasang kelas di <html> sesuai pengaturan tampilan (ukuran teks, kurangi animasi). */
export function TerapkanPengaturan() {
  useEffect(() => {
    const terapkan = () => {
      const html = document.documentElement.classList;
      const ukuran = bacaUkuranTeks();
      for (const u of UKURAN_TEKS) html.toggle(`teks-${u.nilai}`, u.nilai !== "normal" && u.nilai === ukuran);
      html.toggle("kurangi-animasi", bacaPengaturan("kurangiAnimasi"));
    };
    terapkan();
    window.addEventListener(EVENT_PENGATURAN, terapkan);
    return () => window.removeEventListener(EVENT_PENGATURAN, terapkan);
  }, []);
  return null;
}
