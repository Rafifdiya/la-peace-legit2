import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { KepalaHalaman } from "@/components/KepalaHalaman";
import { LoginButton } from "@/components/LoginButton";
import { StatCard } from "@/components/StatCard";
import { Tabs } from "@/components/Tabs";
import { getCategories, getStats } from "@/lib/data";
import { getJumlahMinatKelas, getLaporan } from "@/lib/komunitas";
import { formatTanggal } from "@/lib/format";
import { getKirimanAdmin, getSesi } from "@/lib/kiriman";
import { KirimanList } from "./KirimanList";
import { getIklanAdmin } from "@/lib/iklan";
import { IklanForm } from "./IklanForm";
import { LihatIklanToggle } from "./LihatIklanToggle";
import { AksiLaporan } from "./AksiLaporan";
import { IklanItem } from "./IklanItem";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

// Hanya role admin. Cek ulang juga dilakukan di database (RLS + fungsi moderasi).
export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="space-y-8 py-10">
      <KepalaHalaman>
        <h1 className="font-display text-4xl font-semibold">Dashboard Moderasi</h1>
      </KepalaHalaman>
      <Suspense fallback={<p className="text-ink-2">Memuat...</p>}>
        <Isi searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const btn = "rounded-full border border-line px-3 py-1 hover:border-brand";

async function Isi({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  await connection(); // halaman per-request (sesi login), bukan prerender
  const sesi = await getSesi();
  if (!sesi.user) {
    return (
      <p className="text-ink-2">
        Halaman ini khusus admin. <LoginButton className="text-brand underline">Masuk</LoginButton>
      </p>
    );
  }
  if (!sesi.admin) return <p className="text-ink-2">Halaman ini khusus admin.</p>;

  const t = (await searchParams).tab;
  const tab = t === "laporan" || t === "kategori" || t === "iklan" ? t : "kiriman";
  const [kiriman, laporan, kategori, stats, minat] = await Promise.all([
    getKirimanAdmin(),
    getLaporan(),
    getCategories(),
    getStats(),
    getJumlahMinatKelas(),
  ]);
  const iklan = tab === "iklan" ? await getIklanAdmin() : [];
  const menunggu = kiriman.filter((k) => k.status === "pending");

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Menunggu" value={menunggu.length} />
        <StatCard label="Laporan terbuka" value={laporan.length} />
        <StatCard label="Total jajanan" value={stats.jajanan} />
        <StatCard label="Kiriman disetujui" value={kiriman.filter((k) => k.status === "approved").length} />
        <StatCard label="Minat kelas" value={minat} />
      </div>

      <Tabs
        basePath="/admin"
        active={tab}
        tabs={[
          { key: "kiriman", label: `Kiriman (${menunggu.length})` },
          { key: "laporan", label: `Laporan (${laporan.length})` },
          { key: "kategori", label: "Kategori" },
          { key: "iklan", label: "Iklan" },
        ]}
      />

      {tab === "kiriman" && <KirimanList kiriman={kiriman} />}

      {tab === "iklan" && (
        <div className="space-y-6">
          <p className="text-sm text-ink-2">Maksimal 6 iklan aktif, tampil bergantian tiap 6 detik di bawah sidebar (desktop). Nonaktifkan semua untuk kembali ke placeholder.</p>
          <LihatIklanToggle />
          <IklanForm />
          {iklan.length === 0 ? (
            <p className="text-ink-2">Belum ada iklan.</p>
          ) : (
            <ul className="space-y-3">{iklan.map((i) => <IklanItem key={i.id} iklan={i} />)}</ul>
          )}
        </div>
      )}

      {tab === "laporan" && laporan.length === 0 && <p className="text-ink-2">Belum ada laporan terbuka.</p>}

      {tab === "laporan" && (
        <ul className="space-y-3">
          {laporan.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 text-sm sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="font-semibold">
                  {r.target}
                  {r.href && <Link href={r.href} className="ml-2 font-normal text-brand underline">Buka</Link>}
                </p>
                <p className="text-ink-2">{r.alasan} · dilaporkan {r.oleh} · {formatTanggal(r.tanggal)}</p>
              </div>
              <AksiLaporan id={r.id} jenis={r.targetType} targetId={r.targetId} />
            </li>
          ))}
        </ul>
      )}

      {tab === "kategori" && (
        <div className="space-y-4">
          <form className="flex max-w-md gap-2">
            <input required placeholder="Nama kategori baru" aria-label="Nama kategori baru" className="flex-1 rounded-sm border border-line bg-surface px-3 py-2 text-sm" />
            <button type="button" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">Tambah</button>
          </form>
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface text-sm">
            {kategori.map((k) => (
              <li key={k} className="flex items-center justify-between p-3">
                {k}
                <button className={btn}>Ubah</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
