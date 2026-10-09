import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";
import { getRequest, getRequestIds } from "@/lib/data";
import { formatTanggal } from "@/lib/format";

export async function generateStaticParams() {
  return (await getRequestIds()).map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/request/[id]">): Promise<Metadata> {
  const r = await getRequest((await params).id);
  return r ? { title: r.judul } : {};
}

export default async function RequestDetail({ params }: PageProps<"/request/[id]">) {
  const r = await getRequest((await params).id);
  if (!r) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10">
      <Link href="/request" className="text-sm text-brand hover:underline">← Semua request</Link>
      <div className="space-y-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.jawaban.length ? "bg-rarity-umum" : "bg-rarity-mulai"}`}>
          {r.jawaban.length ? "Terjawab" : "Terbuka"}
        </span>
        <h1 className="font-display text-3xl font-semibold">{r.judul}</h1>
        <p className="text-sm text-ink-2">
          <Link href={`/profil/${r.oleh}`} className="hover:text-brand">@{r.oleh}</Link> · {r.daerah} · {formatTanggal(r.tanggal)}
        </p>
        <p className="pt-2 leading-relaxed">{r.isi}</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">{r.jawaban.length} Jawaban</h2>
        {r.jawaban.map((j, i) => (
          <div key={i} className="space-y-1 rounded-lg border border-line bg-surface p-4">
            <p className="text-sm text-ink-2">
              <Link href={`/profil/${j.oleh}`} className="hover:text-brand">@{j.oleh}</Link> · {formatTanggal(j.tanggal)}
            </p>
            <p>{j.isi}</p>
            {j.slug && <Link href={`/jajanan/${j.slug}`} className="text-sm text-brand underline">Lihat jajanan</Link>}
          </div>
        ))}
        <LoginButton className="w-full rounded-full border border-brand py-2 text-brand">Jawab request ini</LoginButton>
      </section>
    </div>
  );
}
