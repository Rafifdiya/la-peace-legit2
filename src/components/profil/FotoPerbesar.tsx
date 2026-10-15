"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const LAMA = 3000; // pop-up tertutup sendiri setelah 3 detik

/** Foto profil yang bisa dipencet: tampil besar di tengah layar selama 3 detik. */
export function FotoPerbesar({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [buka, setBuka] = useState(false);

  useEffect(() => {
    if (!buka) return;
    ref.current?.showModal();
    const t = setTimeout(() => ref.current?.close(), LAMA);
    return () => clearTimeout(t);
  }, [buka]);

  return (
    <>
      <button type="button" onClick={() => setBuka(true)} aria-label="Perbesar foto profil" className="cursor-zoom-in rounded-full">
        {children}
      </button>
      {buka && (
        <dialog
          ref={ref}
          aria-label={alt}
          onClose={() => setBuka(false)}
          // Klik di mana saja menutup lebih cepat
          onClick={() => ref.current?.close()}
          className="foto-muncul m-auto overflow-hidden rounded-full bg-transparent p-0 backdrop:bg-ink/60"
        >
          <Image
            src={src}
            alt={alt}
            width={640}
            height={640}
            sizes="(max-width: 640px) 80vw, 20rem"
            quality={80}
            className="h-[min(80vw,20rem)] w-[min(80vw,20rem)] rounded-full object-cover ring-4 ring-white/80"
          />
        </dialog>
      )}
    </>
  );
}
