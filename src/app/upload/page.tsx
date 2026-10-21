import type { Metadata } from "next";
import { getCategories, getProvinces } from "@/lib/data";
import { UploadForm } from "./UploadForm";
import { KRITERIA } from "@/lib/kriteria";
import { ListChecks } from "lucide-react";

export const metadata: Metadata = { title: "Kontribusi" };

// Form kontribusi 7 langkah (docs/03 Flow B). Data referensi dari server, sisanya di browser.
export default async function UploadPage() {
  const [provinsi, kategori] = await Promise.all([getProvinces(), getCategories()]);
  return (
    <>
      {/* Kriteria ditampilkan sebelum mengisi, supaya kontributor tahu yang dicek admin */}
      <details className="mx-auto mt-8 max-w-3xl rounded-xl border border-line bg-surface p-4 text-sm" open>
        <summary className="flex cursor-pointer items-center gap-2 font-semibold">
          <ListChecks size={18} className="text-brand" aria-hidden /> Sebelum mengirim, pastikan kirimanmu memenuhi kriteria ini
        </summary>
        <ul className="mt-3 list-inside list-disc space-y-1 text-ink-2">
          {KRITERIA.map((k) => <li key={k}>{k}</li>)}
        </ul>
        <p className="mt-2 text-ink-2">Admin mengecek setiap kiriman dengan kriteria yang sama sebelum tampil di katalog.</p>
      </details>
      <UploadForm provinsi={provinsi} kategori={kategori} />
    </>
  );
}
