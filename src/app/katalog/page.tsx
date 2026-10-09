import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCategories, getProvinces, getSnackPage, type SnackFilter } from "@/lib/data";
import { InfiniteList } from "./InfiniteList";

export const metadata: Metadata = { title: "Katalog" };

export default function KatalogPage({ searchParams }: PageProps<"/katalog">) {
  return (
    <div className="py-10">
      <h1 className="font-display text-4xl font-semibold">Katalog Jajanan</h1>
      {/* Judul tampil instan (static shell); hasil filter menyusul */}
      <Suspense fallback={<p className="mt-6 text-ink-2">Memuat katalog...</p>}>
        <Katalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

async function Katalog({ searchParams }: Pick<PageProps<"/katalog">, "searchParams">) {
  const sp = await searchParams;
  const filter: SnackFilter = {
    q: one(sp.q),
    provinsi: one(sp.provinsi),
    kategori: one(sp.kategori),
    urut: one(sp.urut) as SnackFilter["urut"],
  };
  const [page, provinsi, kategori] = await Promise.all([getSnackPage(filter), getProvinces(), getCategories()]);
  const query = new URLSearchParams(Object.entries(filter).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
      {/* Filter = form GET biasa: jalan tanpa JavaScript, URL bisa dibagikan */}
      <form className="h-fit space-y-5 rounded-lg border border-line bg-surface p-5 text-sm">
        <Field label="Cari">
          <input name="q" defaultValue={filter.q} placeholder="Nama jajanan" className="w-full rounded-sm border border-line px-3 py-2" />
        </Field>
        <Field label="Provinsi">
          <select name="provinsi" defaultValue={filter.provinsi ?? ""} className="w-full rounded-sm border border-line px-3 py-2">
            <option value="">Semua provinsi</option>
            {provinsi.map((p) => <option key={p.slug} value={p.slug}>{p.nama}</option>)}
          </select>
        </Field>
        <Field label="Kategori">
          <select name="kategori" defaultValue={filter.kategori ?? ""} className="w-full rounded-sm border border-line px-3 py-2">
            <option value="">Semua kategori</option>
            {kategori.map((k) => <option key={k}>{k}</option>)}
          </select>
        </Field>
        <Field label="Urutkan">
          <select name="urut" defaultValue={filter.urut ?? "terbaru"} className="w-full rounded-sm border border-line px-3 py-2">
            <option value="terbaru">Terbaru</option>
            <option value="az">A-Z</option>
            <option value="langka">Paling langka</option>
          </select>
        </Field>
        <div className="flex gap-2">
          <button className="flex-1 rounded-full bg-brand py-2 font-semibold text-white hover:bg-brand-hover">Terapkan</button>
          <Link href="/katalog" className="rounded-full border border-line px-4 py-2">Reset</Link>
        </div>
      </form>

      <section className="space-y-4">
        <p className="text-sm text-ink-2">{page.total} jajanan ditemukan</p>
        {page.total === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-10 text-center">
            <p>Belum ada jajanan yang cocok.</p>
            <p className="mt-2 text-sm text-ink-2">
              <Link href="/request" className="text-brand underline">Buat request</Link> atau{" "}
              <Link href="/upload" className="text-brand underline">tambahkan jajanan</Link>.
            </p>
          </div>
        ) : (
          // key = query: daftar di-reset saat filter berubah
          <InfiniteList key={query} initial={page} query={query} />
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="font-semibold">{label}</span>
      {children}
    </label>
  );
}
