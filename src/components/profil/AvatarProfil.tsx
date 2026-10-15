import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Crown } from "lucide-react";
import { FotoPerbesar } from "./FotoPerbesar";

// Bingkai PNG buatan tim (opsional). Selama file belum ada, pakai bingkai CSS.
const BINGKAI = "/lencana/bingkai-premium.png";
const adaBingkaiPng = existsSync(path.join(process.cwd(), "public", BINGKAI));

/** Foto profil (atau inisial bila belum ada); akun Premium mendapat bingkai raja + mahkota. */
export function AvatarProfil({ nama, premium, src }: { nama: string; premium: boolean; src?: string | null }) {
  // Foto tidak persegi dipotong jadi lingkaran: minta versi besar agar tetap tajam
  const inisial = src ? (
    <FotoPerbesar src={src} alt={`Foto profil ${nama}`}>
      <Image src={src} alt={`Foto profil ${nama}`} width={384} height={384} sizes="384px" quality={75} className="h-24 w-24 rounded-full object-cover" />
    </FotoPerbesar>
  ) : (
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand font-display text-4xl text-white">
      {nama.charAt(0).toUpperCase()}
    </div>
  );
  if (!premium) return <div className="shrink-0">{inisial}</div>;

  if (adaBingkaiPng) {
    return (
      <div className="relative flex h-[8.4rem] w-[8.4rem] shrink-0 items-center justify-center" title="Anggota Premium">
        {inisial}
        <Image src={BINGKAI} alt="Lencana Premium" fill sizes="135px" className="pointer-events-none object-contain" />
      </div>
    );
  }
  return (
    <div className="relative w-fit shrink-0 pt-3" title="Anggota Premium">
      <div className="rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-1 shadow-md">
        <div className="rounded-full bg-page p-0.5">{inisial}</div>
      </div>
      <Crown
        size={31}
        aria-label="Premium"
        className="absolute left-1/2 top-0 -translate-x-1/2 fill-yellow-400 text-amber-600 drop-shadow"
      />
    </div>
  );
}
