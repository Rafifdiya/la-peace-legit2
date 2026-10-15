"use client";

import { useEffect, useState } from "react";
import type { Iklan } from "@/lib/iklan";
import { IklanMedia } from "./IklanMedia";

const JEDA = 6000; // ganti iklan tiap 6 detik

/** Iklan sponsor bergantian otomatis (maks. 6). Berhenti saat kursor di atasnya. */
export function SlideIklan({ iklan }: { iklan: Iklan[] }) {
  const [i, setI] = useState(0);
  const [jeda, setJeda] = useState(false);

  useEffect(() => {
    if (iklan.length < 2 || jeda) return;
    const t = setInterval(() => setI((n) => (n + 1) % iklan.length), JEDA);
    return () => clearInterval(t);
  }, [iklan.length, jeda]);

  return (
    <div onMouseEnter={() => setJeda(true)} onMouseLeave={() => setJeda(false)} className="space-y-2">
      {/* Semua iklan ditumpuk; hanya yang aktif terlihat (transisi memudar) */}
      <div className="grid">
        {iklan.map((ik, n) => {
          // Foto saja tanpa judul; judul tetap dipakai sebagai teks alternatif
          const isi = <IklanMedia iklan={ik} kotak />;
          return (
            <div
              key={ik.id}
              aria-hidden={n !== i}
              className={`col-start-1 row-start-1 transition-opacity duration-700 ${n === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              {ik.linkUrl ? (
                <a href={ik.linkUrl} target="_blank" rel="noopener sponsored" tabIndex={n === i ? 0 : -1} className="block hover:opacity-90">
                  {isi}
                </a>
              ) : (
                isi
              )}
            </div>
          );
        })}
      </div>
      {iklan.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {iklan.map((ik, n) => (
            <button
              key={ik.id}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Iklan ${n + 1}`}
              aria-current={n === i}
              className={`h-1.5 rounded-full transition-all ${n === i ? "w-4 bg-brand" : "w-1.5 bg-line hover:bg-brand/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
