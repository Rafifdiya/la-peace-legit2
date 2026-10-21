import type { Metadata } from "next";
import Link from "next/link";
import { getProvinces } from "@/lib/data";
import { UploadForm } from "./UploadForm";
import { KRITERIA_SINGKAT } from "@/lib/kriteria";
import { ListChecks } from "lucide-react";

export const metadata: Metadata = { title: "Kontribusi" };

// Form kontribusi 7 langkah (docs/03 Flow B). Data referensi dari server, sisanya di browser.
export default async function UploadPage() {
  const provinsi = await getProvinces();
  return (
    // Seluruh halaman kontribusi diperkecil agar tidak terasa terlalu besar di layar 100%
    <div className="[zoom:0.85]">
      {/* Kriteria ditampilkan sebelum mengisi, supaya kontributor tahu yang dicek admin */}
      <details className="mx-auto mt-8 max-w-3xl rounded-xl border border-line bg-surface p-4 text-sm" open>
        <summary className="flex cursor-pointer items-center gap-2 font-semibold">
          <ListChecks size={18} className="text-brand" aria-hidden /> Kriteria kiriman
        </summary>
        <ul className="mt-3 list-inside list-disc space-y-1 text-ink-2">
          {KRITERIA_SINGKAT.map((k) => <li key={k}>{k}</li>)}
        </ul>
        <p className="mt-2 text-ink-2">Dicek admin sebelum tampil. <Link href="/tentang" className="text-brand underline">Kriteria lengkap</Link></p>
      </details>
      <UploadForm provinsi={provinsi} />
    </div>
  );
}
