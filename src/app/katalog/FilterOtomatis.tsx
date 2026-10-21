"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const JEDA_CARI = 1000; // sama seperti cari di Forum: hasil muncul 1 detik setelah berhenti mengetik

/**
 * Filter katalog otomatis: kolom Cari dijalankan 1 detik setelah berhenti mengetik,
 * pilihan Provinsi / Kategori / Urutkan langsung saat diganti. Dipasang di dalam form filter.
 */
export function FilterOtomatis() {
  const ref = useRef<HTMLSpanElement>(null);
  const [mencari, setMencari] = useState(false);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const kirim = () => {
      setMencari(false);
      form.requestSubmit();
    };
    const ketik = (e: Event) => {
      if (!(e.target instanceof HTMLInputElement)) return;
      clearTimeout(t);
      setMencari(true);
      t = setTimeout(kirim, JEDA_CARI);
    };
    const ganti = (e: Event) => {
      if (!(e.target instanceof HTMLSelectElement)) return;
      clearTimeout(t);
      kirim();
    };
    form.addEventListener("input", ketik);
    form.addEventListener("change", ganti);
    return () => {
      clearTimeout(t);
      form.removeEventListener("input", ketik);
      form.removeEventListener("change", ganti);
    };
  }, []);

  return (
    <span ref={ref} role="status" className={`flex items-center gap-1.5 text-sm text-ink-2 ${mencari ? "" : "hidden"}`}>
      <Loader2 size={14} className="putar-muat" aria-hidden /> Mencari...
    </span>
  );
}
