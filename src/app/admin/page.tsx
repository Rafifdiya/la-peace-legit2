import type { Metadata } from "next";
import { Suspense } from "react";
import { TriangleAlert } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusPill } from "@/components/StatusPill";
import { Tabs } from "@/components/Tabs";
import { getCategories, getReports, getStats, getSubmissions } from "@/lib/data";
import { formatTanggal } from "@/lib/format";
import { RejectButton } from "./RejectButton";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

// Template: belum ada cek role. Nanti hanya role admin yang boleh masuk.
export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="space-y-8 py-10">
      <h1 className="font-display text-4xl font-semibold">Dashboard Moderasi</h1>
      <Suspense fallback={<p className="text-ink-2">Memuat...</p>}>
        <Isi searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const btn = "rounded-full border border-line px-3 py-1 hover:border-brand";

async function Isi({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  const t = (await searchParams).tab;
  const tab = t === "laporan" || t === "kategori" ? t : "kiriman";
  const [kiriman, laporan, kategori, stats] = await Promise.all([getSubmissions(), getReports(), getCategories(), getStats()]);
  const menunggu = kiriman.filter((k) => k.status === "pending");

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Menunggu" value={menunggu.length} />
        <StatCard label="Laporan terbuka" value={laporan.length} />
        <StatCard label="Total jajanan" value={stats.jajanan} />
        <StatCard label="Disetujui minggu ini" value={kiriman.filter((k) => k.status === "approved").length} />
      </div>

      <Tabs
        basePath="/admin"
        active={tab}
        tabs={[
          { key: "kiriman", label: `Kiriman (${menunggu.length})` },
          { key: "laporan", label: `Laporan (${laporan.length})` },
          { key: "kategori", label: "Kategori" },
        ]}
      />

      {tab === "kiriman" && (
        <ul className="space-y-3">
          {kiriman.map((k) => (
            <li key={k.id} className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 text-sm sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="flex items-center gap-2 font-semibold">
                  {k.judul}
                  {k.ditandaiKataKasar && (
                    <span className="flex items-center gap-1 text-xs font-normal text-danger">
                      <TriangleAlert size={14} aria-hidden /> Ditandai filter kata kasar
                    </span>
                  )}
                </p>
                <p className="text-ink-2">{k.jenis} · @{k.oleh} · {formatTanggal(k.tanggal)}</p>
              </div>
              {k.status === "pending" ? (
                <div className="flex gap-2">
                  <button className={btn}>Lihat</button>
                  <button className="rounded-full bg-accent px-3 py-1 text-white">Setujui</button>
                  <RejectButton judul={k.judul} />
                </div>
              ) : (
                <StatusPill status={k.status} />
              )}
            </li>
          ))}
        </ul>
      )}

      {tab === "laporan" && (
        <ul className="space-y-3">
          {laporan.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 text-sm sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="font-semibold">{r.target}</p>
                <p className="text-ink-2">{r.alasan} · dilaporkan @{r.oleh} · {formatTanggal(r.tanggal)}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-full bg-danger px-3 py-1 text-white">Sembunyikan konten</button>
                <button className={btn}>Abaikan</button>
              </div>
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
