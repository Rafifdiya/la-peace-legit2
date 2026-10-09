import type { Metadata } from "next";
import { getCategories, getProvinces } from "@/lib/data";
import { PhotoInput } from "./PhotoInput";

export const metadata: Metadata = { title: "Kontribusi" };

const langkah = ["Info dasar", "Cerita", "Resep", "Langkah pembuatan", "Lokasi terlihat", "Vote kelangkaan", "Review & kirim"];

// Template langkah 1 (Info dasar). Langkah 2-7 dan simpan ke Supabase menyusul.
export default async function UploadPage() {
  const [provinsi, kategori] = await Promise.all([getProvinces(), getCategories()]);

  return (
    <div className="grid gap-8 py-10 lg:grid-cols-[220px_1fr_260px]">
      <ol className="space-y-2 text-sm">
        {langkah.map((l, i) => (
          <li key={l} className={`rounded-sm px-3 py-2 ${i === 0 ? "bg-brand font-semibold text-white" : "text-ink-2"}`}>
            {i + 1}. {l}
          </li>
        ))}
      </ol>

      <form className="space-y-5">
        <h1 className="font-display text-3xl font-semibold">Info dasar</h1>
        <label className="block space-y-1.5">
          <span className="font-semibold">Nama jajanan *</span>
          <input required className="w-full rounded-sm border border-line bg-surface px-3 py-2" placeholder="mis. Kue Rangi" />
        </label>
        <label className="block space-y-1.5">
          <span className="font-semibold">Provinsi asal *</span>
          <select required className="w-full rounded-sm border border-line bg-surface px-3 py-2">
            <option value="">Pilih provinsi</option>
            {provinsi.map((p) => <option key={p.slug} value={p.slug}>{p.nama}</option>)}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="font-semibold">Kategori</span>
          <select className="w-full rounded-sm border border-line bg-surface px-3 py-2">
            {kategori.map((k) => <option key={k}>{k}</option>)}
          </select>
        </label>
        <div className="space-y-1.5">
          <span className="font-semibold">Foto utama *</span>
          <PhotoInput />
        </div>
        <button type="button" className="rounded-full bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-hover">
          Lanjut
        </button>
      </form>

      <aside className="h-fit space-y-2 rounded-lg bg-subtle p-4 text-sm text-ink-2">
        <p className="font-semibold text-ink">Tips</p>
        <p>Foto otomatis dikecilkan sebelum dikirim, jadi hemat kuota.</p>
        <p>Pakai foto milik sendiri. Lokasi cukup tempat usaha, bukan rumah pribadi.</p>
      </aside>
    </div>
  );
}
