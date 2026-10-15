"use client";

import { useEffect } from "react";
import { EVENT_PENGATURAN, bacaPengaturan } from "@/lib/pengaturan";

/** Pasang kelas di <html> sesuai pengaturan tampilan (teks besar, kurangi animasi). */
export function TerapkanPengaturan() {
  useEffect(() => {
    const terapkan = () => {
      const html = document.documentElement.classList;
      html.toggle("teks-besar", bacaPengaturan("teksBesar"));
      html.toggle("kurangi-animasi", bacaPengaturan("kurangiAnimasi"));
    };
    terapkan();
    window.addEventListener(EVENT_PENGATURAN, terapkan);
    return () => window.removeEventListener(EVENT_PENGATURAN, terapkan);
  }, []);
  return null;
}
