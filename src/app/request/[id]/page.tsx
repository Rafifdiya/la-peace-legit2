import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Award } from "lucide-react";
import { getSnackPage } from "@/lib/data";
import { getRequest, getRequestIds } from "@/lib/komunitas";
import { formatTanggal } from "@/lib/format";
import { cariTopik } from "@/lib/forum";
import { AksiBalasan, AksiPostingan, FormJawab } from "../FormTanya";

// Cache Components butuh minimal 1 param; kalau belum ada postingan, pakai placeholder (404).
export async function generateStaticParams() {
  const ids = await getRequestIds();
  return (ids.length ? ids : ["_"]).map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/request/[id]">): Promise<Metadata> {
  const r = await getRequest((await params).id);
  return r ? { title: r.judul } : {};
}

// Postingan baru (belum ada saat build) membaca params saat request; penanda ini menandai
// bagian dinamis itu disengaja, isi halaman tetap prerender (sama seperti halaman jajanan).
async function Connection() {
  await connection();
  return null;
}

export default async function PostinganForum({ params }: PageProps<"/request/[id]">) {
  const r = await getRequest((await params).id);
  if (!r) notFound();
  const jajanan = (await getSnackPage({ urut: "terbaru" }, 1, 200)).items.map((s) => ({ nama: s.nama, slug: s.slug }));
  const t = cariTopik(r.topik);
  // Balasan terbaik tampil paling atas
  const balasan = [...r.jawaban].sort((a, b) => Number(b.id === r.jawabanTerbaik) - Number(a.id === r.jawabanTerbaik));

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10">
      <Suspense>
        <Connection />
      </Suspense>
      <Link href="/request" className="inline-block pb-2 text-sm text-brand hover:underline">← Forum Jajanan</Link>
      <div className="space-y-2">
        <p className="flex flex-wrap items-center gap-2 text-xs">
          <Link href={`/request?topik=${t.key}`} className="rounded-full bg-subtle px-2.5 py-0.5 font-semibold text-brand hover:underline">{t.emoji} {t.label}</Link>
          {t.mencari && (
            <span className={`rounded-full px-2.5 py-0.5 font-semibold ${r.terjawab ? "bg-accent/15 text-accent" : "bg-rarity-mulai"}`}>
              {r.terjawab ? "Terjawab" : "Belum terjawab"}
            </span>
          )}
        </p>
        <h1 className="font-display text-3xl font-semibold">{r.judul}</h1>
        <p className="text-sm text-ink-2">
          {r.olehUsername ? <Link href={`/profil/${r.olehUsername}`} className="hover:text-brand">@{r.oleh}</Link> : r.oleh}
          {r.daerah && ` · ${r.daerah}`} · {formatTanggal(r.tanggal)}
        </p>
        {r.isi && <p className="whitespace-pre-line pt-2 leading-relaxed">{r.isi}</p>}
        <AksiPostingan id={r.id} pemilikId={r.pemilikId} />
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">{r.jawaban.length} Balasan</h2>
        {balasan.map((j) => {
          const terbaik = j.id === r.jawabanTerbaik;
          return (
            <div key={j.id} className={`space-y-1 rounded-lg border bg-surface p-4 ${terbaik ? "border-2 border-accent" : "border-line"}`}>
              {terbaik && (
                <p className="flex items-center gap-1 text-xs font-semibold text-accent"><Award size={14} aria-hidden /> Balasan terbaik pilihan penanya</p>
              )}
              <p className="text-sm text-ink-2">
                {j.olehUsername ? <Link href={`/profil/${j.olehUsername}`} className="hover:text-brand">@{j.oleh}</Link> : j.oleh} · {formatTanggal(j.tanggal)}
              </p>
              <p className="whitespace-pre-line">{j.isi}</p>
              {j.slug && <Link href={`/jajanan/${j.slug}`} className="text-sm text-brand underline">Lihat jajanan</Link>}
              <AksiBalasan requestId={r.id} id={j.id} pemilikId={j.userId} pemilikPostId={r.pemilikId} terbaik={terbaik} />
            </div>
          );
        })}
        <FormJawab requestId={r.id} jajanan={jajanan} pemilikPostId={r.pemilikId} adaBalasanLain={r.jawaban.some((j) => j.userId !== r.pemilikId)} />
      </section>
    </div>
  );
}
