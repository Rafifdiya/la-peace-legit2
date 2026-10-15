"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { EVENT_PREMIUM } from "@/components/TanpaIklanPremium";
import { bacaPengaturan, simpanPengaturan, type NamaPengaturan } from "@/lib/pengaturan";

type Item = { nama?: NamaPengaturan; judul: string; ket: string; segera?: boolean };

const GRATIS: Item[] = [
  { nama: "teksBesar", judul: "Teks lebih besar", ket: "Perbesar semua tulisan sekitar 12%, nyaman untuk membaca resep." },
  { nama: "kurangiAnimasi", judul: "Kurangi animasi", ket: "Matikan efek ketik, kilau, dan pantul. Lebih hemat baterai." },
  { judul: "Notifikasi jajanan baru", ket: "Kabar saat ada jajanan baru dari daerahmu.", segera: true },
];

const PREMIUM: Item[] = [
  { nama: "bebasIklan", judul: "Bebas iklan", ket: "Sembunyikan iklan di sidebar, katalog, dan pop-up." },
  { nama: "layarMenyala", judul: "Layar tetap menyala saat mode masak", ket: "Layar HP tidak mati sendiri selama memasak." },
  { nama: "lencana", judul: "Lencana Prem di ikon profil", ket: "Tampilkan lencana Prem berkilau di avatar navbar." },
];

function Saklar({ nyala, terkunci, onKlik, label }: { nyala: boolean; terkunci?: boolean; onKlik: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={nyala}
      aria-label={label}
      onClick={onKlik}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${nyala ? "bg-accent" : "bg-line"} ${terkunci ? "opacity-60" : ""}`}
    >
      <span className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-all ${nyala ? "left-[1.375rem]" : "left-0.5"}`}>
        {terkunci && <Lock size={11} className="text-ink-2" aria-hidden />}
      </span>
    </button>
  );
}

function Baris({ item, kunci, nyala, onKlik }: { item: Item; kunci?: boolean; nyala: boolean; onKlik: () => void }) {
  const terkunci = kunci || item.segera;
  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="font-semibold">
          {item.judul}
          {item.segera && <span className="ml-2 text-xs font-normal text-ink-2">(segera hadir)</span>}
        </p>
        <p className="text-sm text-ink-2">{item.ket}</p>
      </div>
      <Saklar label={item.judul} nyala={!terkunci && nyala} terkunci={terkunci} onKlik={onKlik} />
    </li>
  );
}

export function PengaturanFitur({ premium }: { premium: boolean }) {
  const router = useRouter();
  const [nilai, setNilai] = useState<Partial<Record<NamaPengaturan, boolean>>>({});

  useEffect(() => {
    const semua = [...GRATIS, ...PREMIUM].flatMap((i) => (i.nama ? [i.nama] : []));
    // Nilai tersimpan di browser, baru bisa dibaca setelah halaman tampil
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNilai(Object.fromEntries(semua.map((n) => [n, bacaPengaturan(n)])));
  }, []);

  function klik(item: Item, kunci?: boolean) {
    if (item.segera || !item.nama) return;
    // Fitur Premium terkunci: arahkan ke halaman Premium
    if (kunci) return router.push("/premium");
    const baru = !nilai[item.nama];
    setNilai((s) => ({ ...s, [item.nama!]: baru }));
    simpanPengaturan(item.nama, baru);
    // Iklan & lencana dibaca ulang lewat event yang sama dengan status Premium
    if (item.nama === "bebasIklan" || item.nama === "lencana") window.dispatchEvent(new Event(EVENT_PREMIUM));
  }

  const daftar = (items: Item[], kunci?: boolean) => (
    <ul className="divide-y divide-line">
      {items.map((i) => (
        <Baris key={i.judul} item={i} kunci={kunci} nyala={!!i.nama && !!nilai[i.nama]} onKlik={() => klik(i, kunci)} />
      ))}
    </ul>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-surface px-5">
        <h2 className="border-b border-line py-4 font-display text-2xl font-semibold">Gratis</h2>
        {daftar(GRATIS)}
      </section>

      <section className="rounded-xl border border-line bg-surface px-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-4">
          <h2 className="font-display text-2xl font-semibold"><span className="kilau">Premium</span></h2>
          {!premium && (
            <Link href="/premium" className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-hover">
              <Lock size={14} aria-hidden /> Buka dengan Premium
            </Link>
          )}
        </div>
        {daftar(PREMIUM, !premium)}
      </section>
    </div>
  );
}
