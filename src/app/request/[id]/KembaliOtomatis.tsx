"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

const DETIK = 3;

/** Setelah membuat postingan (?baru=1): tampilkan pesan, lalu kembali ke Forum Jajanan setelah 3 detik. */
export function KembaliOtomatis() {
  const baru = useSearchParams().get("baru") === "1";
  const router = useRouter();
  const [sisa, setSisa] = useState(DETIK);

  useEffect(() => {
    if (!baru) return;
    const t = setInterval(() => setSisa((n) => n - 1), 1000);
    const pergi = setTimeout(() => router.push("/request"), DETIK * 1000);
    return () => {
      clearInterval(t);
      clearTimeout(pergi);
    };
  }, [baru, router]);

  if (!baru) return null;
  return (
    <p role="status" className="flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent">
      <CheckCircle2 size={18} aria-hidden /> Postingan terkirim! Kembali ke Forum Jajanan dalam {Math.max(sisa, 0)} detik...
    </p>
  );
}
