"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChefHat, ChevronLeft, ChevronRight, Crown, FileDown, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { bacaPengaturan } from "@/lib/pengaturan";
import { openLogin } from "./LoginDialog";

type Sesi = { snackId: string; premium: boolean } | null;

const btn = "flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-sm hover:border-brand disabled:opacity-60";

/**
 * Mode masak (khusus Premium) + Unduh PDF (gratis 5x/minggu, Premium sepuasnya).
 * Halaman detail statis, jadi status login & premium dicek di browser.
 */
export function AlatResep({ slug, nama, bahan, langkah }: { slug: string; nama: string; bahan: string[]; langkah: string[] }) {
  const [sesi, setSesi] = useState<Sesi>();
  const [masak, setMasak] = useState(false);
  const [pesan, setPesan] = useState<React.ReactNode>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return setSesi(null);
      const [{ data: snack }, { data: prof }] = await Promise.all([
        supabase.from("snacks").select("id").eq("slug", slug).maybeSingle(),
        supabase.from("profiles").select("role, premium_sampai").eq("id", auth.user.id).maybeSingle(),
      ]);
      if (!snack) return setSesi(null);
      setSesi({ snackId: snack.id, premium: prof?.role === "admin" || (!!prof?.premium_sampai && new Date(prof.premium_sampai) > new Date()) });
    })();
  }, [slug]);

  function bukaMasak() {
    if (!sesi) return openLogin();
    if (!sesi.premium) {
      return setPesan(<>Mode masak khusus Premium. <Link href="/premium" className="font-semibold text-brand underline">Lihat Premium</Link></>);
    }
    setMasak(true);
  }

  async function unduh() {
    if (!sesi) return openLogin();
    setBusy(true);
    setPesan(undefined);
    const { data, error } = await createClient().rpc("catat_unduh_pdf", { p_snack: sesi.snackId });
    setBusy(false);
    if (error) {
      return setPesan(<>{error.message} {/Premium/.test(error.message) && <Link href="/premium" className="font-semibold text-brand underline">Lihat Premium</Link>}</>);
    }
    if (data >= 0) setPesan(`Sisa unduhan minggu ini: ${data}x`);
    // Dialog cetak browser -> pilih "Simpan sebagai PDF"; CSS cetak hanya menampilkan resep
    document.body.classList.add("cetak-resep");
    window.print();
    document.body.classList.remove("cetak-resep");
  }

  return (
    <div className="space-y-2 print:hidden">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={bukaMasak} disabled={sesi === undefined} className={btn}>
          <ChefHat size={14} aria-hidden /> Mode masak <Crown size={12} className="text-brand" aria-label="Premium" />
        </button>
        <button type="button" onClick={unduh} disabled={sesi === undefined || busy} className={btn}>
          <FileDown size={14} aria-hidden /> {busy ? "Menyiapkan..." : "Unduh PDF"}
        </button>
      </div>
      {pesan && <p role="status" className="text-sm text-ink-2">{pesan}</p>}
      {masak && <ModeMasak nama={nama} bahan={bahan} langkah={langkah} tutup={() => setMasak(false)} />}
    </div>
  );
}

function ModeMasak({ nama, bahan, langkah, tutup }: { nama: string; bahan: string[]; langkah: string[]; tutup: () => void }) {
  // Halaman 0 = bahan, 1..n = langkah
  const [i, setI] = useState(0);
  const total = langkah.length + 1;

  useEffect(() => {
    // Layar tetap menyala selama memasak (jika browser mendukung)
    let kunci: WakeLockSentinel | undefined;
    if (bacaPengaturan("layarMenyala")) navigator.wakeLock?.request("screen").then((k) => (kunci = k)).catch(() => {});
    const tombol = (e: KeyboardEvent) => {
      if (e.key === "Escape") tutup();
      if (e.key === "ArrowRight") setI((n) => Math.min(n + 1, total - 1));
      if (e.key === "ArrowLeft") setI((n) => Math.max(n - 1, 0));
    };
    window.addEventListener("keydown", tombol);
    document.body.style.overflow = "hidden";
    return () => {
      kunci?.release();
      window.removeEventListener("keydown", tombol);
      document.body.style.overflow = "";
    };
  }, [total, tutup]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Mode masak ${nama}`} className="fixed inset-0 z-[60] flex flex-col bg-page p-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-xl font-semibold">{nama}</p>
        <button type="button" onClick={tutup} aria-label="Tutup mode masak" className="rounded-full p-2 hover:bg-subtle"><X size={28} /></button>
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 overflow-y-auto py-6">
        {i === 0 ? (
          <>
            <p className="font-hand text-3xl text-brand">Siapkan bahan</p>
            <ul className="list-inside list-disc space-y-2 text-2xl">{bahan.map((b) => <li key={b}>{b}</li>)}</ul>
          </>
        ) : (
          <>
            <p className="font-hand text-3xl text-brand">Langkah {i} dari {langkah.length}</p>
            <p className="text-3xl leading-snug sm:text-4xl">{langkah[i - 1]}</p>
          </>
        )}
      </div>
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
        <button type="button" onClick={() => setI(i - 1)} disabled={i === 0} className="flex items-center gap-1 rounded-full border border-line px-5 py-3 text-lg disabled:opacity-40">
          <ChevronLeft aria-hidden /> Sebelumnya
        </button>
        <span className="text-ink-2">{i + 1}/{total}</span>
        {i < total - 1 ? (
          <button type="button" onClick={() => setI(i + 1)} className="flex items-center gap-1 rounded-full bg-brand px-5 py-3 text-lg font-semibold text-white">
            Berikutnya <ChevronRight aria-hidden />
          </button>
        ) : (
          <button type="button" onClick={tutup} className="rounded-full bg-accent px-5 py-3 text-lg font-semibold text-white">Selesai</button>
        )}
      </div>
    </div>
  );
}
