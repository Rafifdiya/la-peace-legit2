import type { Metadata } from "next";
import { Suspense } from "react";
import { KepalaHalaman } from "@/components/KepalaHalaman";
import { FormEdit } from "./FormEdit";

export const metadata: Metadata = { title: "Edit kontribusi" };

export default function EditKontribusi() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10">
      <KepalaHalaman>
        <h1 className="font-display text-4xl font-semibold">Edit kontribusi</h1>
        <p className="mt-1.5 text-ink-2">Perbaiki tulisan jajanan yang kamu kirim. Foto & lokasi diubah lewat admin.</p>
      </KepalaHalaman>
      <Suspense fallback={<p className="text-ink-2">Memuat...</p>}>
        <FormEdit />
      </Suspense>
    </div>
  );
}
