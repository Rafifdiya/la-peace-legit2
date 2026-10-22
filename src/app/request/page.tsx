import type { Metadata } from "next";
import Link from "next/link";
import { KepalaHalaman } from "@/components/KepalaHalaman";
import { Suspense } from "react";
import { MessageCircle } from "lucide-react";
import { Tabs } from "@/components/Tabs";
import { getRequests } from "@/lib/komunitas";
import { formatTanggal } from "@/lib/format";
import { cariTopik, topikValid } from "@/lib/forum";
import { BagianForum, TombolTanya } from "./FormTanya";

export const metadata: Metadata = { title: "Forum Jajanan" };

export default function ForumPage({ searchParams }: PageProps<"/request">) {
  return (
    <div className="forum-halaman space-y-4 pt-1 pb-8">
      <KepalaHalaman className="flex flex-wrap items-end justify-between gap-4 py-4!">
        <div>
          <h1 className="font-display text-4xl font-semibold">Forum Jajanan</h1>
          <p className="mt-1.5 text-ink-2">Tanya resep, cari penjual, berbagi cerita & tips seputar jajanan tradisional.</p>
        </div>
        <TombolTanya />
      </KepalaHalaman>
      <Suspense fallback={<p className="text-ink-2">Memuat...</p>}>
        <DaftarPostingan searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DaftarPostingan({ searchParams }: Pick<PageProps<"/request">, "searchParams">) {
  const sp = await searchParams;
  const tab = sp.tab === "belum" ? "belum" : "terbaru";
  const topik = typeof sp.topik === "string" && topikValid(sp.topik) ? sp.topik : undefined;
  const list = await getRequests(tab, topik);

  return (
    <>
      <Tabs basePath="/request" active={tab} tabs={[{ key: "terbaru", label: "Terbaru" }, { key: "belum", label: "Belum terjawab" }]} />
      <BagianForum
        items={list.map((r) => {
          const t = cariTopik(r.topik);
          return {
            id: r.id,
            pemilikId: r.pemilikId,
            teks: { judul: r.judul, isi: r.isi, lain: `${t.label} ${r.daerah} ${r.oleh}` },
            kartu: (
              <Link href={`/request/${r.id}`} className="block flex-1 space-y-1.5 p-4">
                {/* Chip topik di kiri (boleh turun baris), tanggal selalu di pojok kanan atas */}
                <div className="flex flex-wrap items-start gap-x-2 gap-y-1 text-[0.953rem]">
                  <span className="flex flex-wrap gap-1.5">
                    <span className="whitespace-nowrap rounded-full bg-subtle px-1.5 py-0.5 font-semibold text-brand">{t.emoji} {t.label}</span>
                    {t.mencari && r.terjawab && <span className="rounded-full bg-accent/15 px-2 py-0.5 font-semibold text-accent">Terjawab</span>}
                  </span>
                  <span title={formatTanggal(r.tanggal)} className="ml-auto whitespace-nowrap pt-0.5 text-[0.85rem] text-ink/75">
                    {new Date(r.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p className="text-[1.27rem] font-semibold text-ink">{r.judul}</p>
                {r.isi && <p className="line-clamp-2 text-[1.11rem] text-ink/85">{r.isi}</p>}
                <p className="flex flex-wrap items-center gap-3 text-[0.953rem] text-ink/75">
                  {r.daerah && <span>{r.daerah}</span>}
                  <span className={r.olehPremium ? "kilau font-semibold" : undefined}>{r.olehUsername ? `@${r.oleh}` : r.oleh}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={13} aria-hidden /> {r.jawaban.length} balasan</span>
                </p>
              </Link>
            ),
          };
        })}
      />
    </>
  );
}
