import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import { formatTanggal } from "@/lib/format";
import type { Kiriman } from "@/lib/kiriman";
import { ChecklistSetujui } from "./ChecklistSetujui";
import { RejectButton } from "./RejectButton";

const btn = "rounded-full border border-line px-3 py-1 hover:border-brand";

/** Daftar kiriman untuk moderasi. Dipakai di /admin dan bagian "Menunggu moderasi" di profil admin. */
export function KirimanList({ kiriman }: { kiriman: Kiriman[] }) {
  if (kiriman.length === 0) return <p className="text-ink-2">Belum ada kiriman dari pengguna.</p>;
  return (
    <ul className="space-y-3">
      {kiriman.map((k) => (
        <li key={k.id} className="space-y-3 rounded-lg border border-line bg-surface p-4 text-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {k.nama}
                {k.ditandaiKataKasar && (
                  <span className="flex items-center gap-1 text-xs font-normal text-danger">
                    <TriangleAlert size={14} aria-hidden /> Ditandai filter kata kasar
                  </span>
                )}
              </p>
              <p className="text-ink-2">Jajanan baru · @{k.oleh} · {formatTanggal(k.tanggal)}</p>
            </div>
            {k.status === "pending" ? (
              <RejectButton id={k.id} judul={k.nama} />
            ) : (
              <div className="flex items-center gap-2">
                {k.status === "approved" && <Link href={`/jajanan/${k.slug}`} className={btn}>Buka</Link>}
                <StatusPill status={k.status === "approved" ? "approved" : "rejected"} />
              </div>
            )}
          </div>
          {k.status === "pending" && <ChecklistSetujui id={k.id} />}
          <details>
            <summary className="cursor-pointer text-brand">Lihat isi kiriman</summary>
            <div className="mt-3 grid gap-4 sm:grid-cols-[160px_1fr]">
              {k.cover && (
                // eslint-disable-next-line @next/next/no-img-element -- pratinjau admin, foto belum tentu disetujui
                <img src={k.cover} alt={k.nama} className="aspect-[4/3] w-40 rounded-sm object-cover" loading="lazy" />
              )}
              <div className="space-y-1 text-ink-2">
                <p><b className="text-ink">Asal:</b> {k.provinsi || "-"}</p>
                <p><b className="text-ink">Deskripsi:</b> {k.deskripsi || "-"}</p>
                <p className="whitespace-pre-line"><b className="text-ink">Cerita:</b> {k.cerita || "-"}</p>
                <p><b className="text-ink">Resep:</b> {k.jumlahLangkah ? `${k.jumlahLangkah} langkah` : "-"} · <b className="text-ink">Lokasi:</b> {k.adaLokasi ? "Ada" : "-"}</p>
                {k.alasanTolak && <p className="text-danger">Alasan ditolak: {k.alasanTolak}</p>}
              </div>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
