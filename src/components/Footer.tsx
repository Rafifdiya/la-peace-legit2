import Link from "next/link";
import { KeAtas } from "./KeAtas";
import { FooterDetail } from "./FooterDetail";

export function Footer() {
  return (
    <>
    {/* Tombol kembali ke atas, tepat di atas footer */}
    <div className="mt-16 flex justify-center pb-6">
      <KeAtas />
    </div>
    <footer className="motif-kawung bg-subtle">
      <div className="tepi-batik" aria-hidden />
      {/* Khusus beranda: footer lengkap */}
      <FooterDetail />
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-8 text-sm text-ink-2 sm:flex-row sm:justify-between">
        <p>
          <span className="font-display font-semibold text-brand">Jejak Jajan</span> - arsip jajanan tradisional
          Indonesia dari komunitas.
        </p>
        <p>
          © 2026 Jejak Jajan · Konten komunitas berlisensi CC BY-SA 4.0 ·{" "}
          <Link href="/syarat-ketentuan" className="underline">Syarat</Link> · <Link href="/kebijakan-privasi" className="underline">Privasi</Link>
        </p>
      </div>
    </footer>
    </>
  );
}
