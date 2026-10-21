"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, FileDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { openLogin } from "./LoginDialog";

type Sesi = { premium: boolean } | null;

const btn = "flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-sm hover:border-brand disabled:opacity-60";

/**
 * Unduh resep PDF, khusus Premium (akun gratis diarahkan ke halaman Premium).
 * Halaman detail statis, jadi status login & premium dicek di browser.
 */
export function AlatResep({ slug }: { slug: string }) {
  const [sesi, setSesi] = useState<Sesi>();
  const [pesan, setPesan] = useState<React.ReactNode>();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return setSesi(null);
      const { data: prof } = await supabase.from("profiles").select("role, premium_sampai").eq("id", auth.user.id).maybeSingle();
      setSesi({ premium: prof?.role === "admin" || (!!prof?.premium_sampai && new Date(prof.premium_sampai) > new Date()) });
    })();
  }, [slug]);

  function unduh() {
    if (!sesi) return openLogin();
    if (!sesi.premium) {
      return setPesan(<>Unduh resep PDF khusus Premium. <Link href="/premium" className="font-semibold text-brand underline">Lihat Premium</Link></>);
    }
    setPesan(undefined);
    // Dialog cetak browser -> pilih "Simpan sebagai PDF"; CSS cetak hanya menampilkan resep
    document.body.classList.add("cetak-resep");
    window.print();
    document.body.classList.remove("cetak-resep");
  }

  return (
    <div className="space-y-2 print:hidden">
      <button type="button" onClick={unduh} disabled={sesi === undefined} className={btn}>
        <FileDown size={14} aria-hidden /> Unduh PDF <Crown size={12} className="text-brand" aria-label="Premium" />
      </button>
      {pesan && <p role="status" className="text-sm text-ink-2">{pesan}</p>}
    </div>
  );
}
