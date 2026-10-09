import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MessageCircle } from "lucide-react";
import { LoginButton } from "@/components/LoginButton";
import { Tabs } from "@/components/Tabs";
import { getRequests } from "@/lib/data";
import { formatTanggal } from "@/lib/format";

export const metadata: Metadata = { title: "Request" };

export default function RequestPage({ searchParams }: PageProps<"/request">) {
  return (
    <div className="space-y-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Request Jajanan</h1>
          <p className="text-ink-2">Cari resep atau penjual jajanan tertentu? Tanyakan ke komunitas.</p>
        </div>
        <LoginButton className="rounded-full bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-hover">Buat request</LoginButton>
      </div>
      <Suspense fallback={<p className="text-ink-2">Memuat...</p>}>
        <RequestList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function RequestList({ searchParams }: Pick<PageProps<"/request">, "searchParams">) {
  const tab = (await searchParams).tab === "terjawab" ? "terjawab" : "terbuka";
  const list = await getRequests(tab);

  return (
    <>
      <Tabs basePath="/request" active={tab} tabs={[{ key: "terbuka", label: "Terbuka" }, { key: "terjawab", label: "Terjawab" }]} />
      {list.length === 0 && <p className="text-ink-2">Belum ada request.</p>}
      <ul className="space-y-3">
        {list.map((r) => (
          <li key={r.id}>
            <Link href={`/request/${r.id}`} className="cv-auto block space-y-1 rounded-lg border border-line bg-surface p-4 hover:border-brand">
              <p className="font-semibold">{r.judul}</p>
              <p className="line-clamp-1 text-sm text-ink-2">{r.isi}</p>
              <p className="flex items-center gap-3 text-xs text-ink-2">
                <span>{r.daerah}</span>
                <span>@{r.oleh} · {formatTanggal(r.tanggal)}</span>
                <span className="flex items-center gap-1"><MessageCircle size={12} aria-hidden /> {r.jawaban.length} jawaban</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
