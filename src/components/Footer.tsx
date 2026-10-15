import Link from "next/link";
import { KeAtas } from "./KeAtas";

export function Footer() {
  return (
    <>
    {/* Tombol kembali ke atas, tepat di atas footer */}
    <div className="mt-16 flex justify-center pb-6">
      <KeAtas />
    </div>
    <footer className="motif-kawung bg-subtle">
      <div className="tepi-batik" aria-hidden />
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-8 text-sm text-ink-2 sm:flex-row sm:justify-between">
        <p>
          <span className="font-display font-semibold text-brand">Jejak Jajan</span> - arsip jajanan tradisional
          Indonesia dari komunitas.
        </p>
        <p>
          <Link href="/kelas" className="underline">Kelas bersama penjual</Link> · Konten berlisensi CC BY-SA 4.0 · <Link href="/tentang" className="underline">Aturan kontribusi</Link>
        </p>
      </div>
    </footer>
    </>
  );
}
