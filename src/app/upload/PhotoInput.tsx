"use client";

import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { compressImage } from "@/lib/compress-image";

// Pilih foto -> dikompres di browser -> pratinjau. Upload ke Supabase menyusul.
export function PhotoInput() {
  const [preview, setPreview] = useState<string>();
  const [info, setInfo] = useState<string>();
  const [busy, setBusy] = useState(false);

  // Lepas memori object URL lama
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setInfo(undefined);
    try {
      const { file: kecil, sebelumKB, sesudahKB } = await compressImage(file);
      setPreview(URL.createObjectURL(kecil));
      setInfo(`Foto dikompres: ${sebelumKB} KB → ${sesudahKB} KB`);
      // TODO (sprint Supabase): supabase.storage.from("foto").upload(path, kecil)
    } catch (err) {
      setInfo(err instanceof Error ? err.message : "Gagal memproses foto.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="flex aspect-[4/3] max-w-sm cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-line bg-surface hover:border-brand">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- pratinjau blob lokal, tidak perlu next/image
          <img src={preview} alt="Pratinjau foto" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-sm text-ink-2">
            <ImagePlus size={28} aria-hidden />
            {busy ? "Mengompres foto..." : "Pilih foto jajanan"}
          </span>
        )}
        <input type="file" accept="image/*" className="sr-only" onChange={onChange} disabled={busy} />
      </label>
      {info && <p className="text-sm text-ink-2">{info}</p>}
    </div>
  );
}
