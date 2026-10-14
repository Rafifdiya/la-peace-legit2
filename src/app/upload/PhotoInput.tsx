"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { compressImage } from "@/lib/compress-image";
import { createClient } from "@/lib/supabase/client";

type Props = {
  /** URL publik foto yang sudah terunggah (disimpan di draft) */
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
  kecil?: boolean;
  /** Terima foto dari Ctrl+V di mana saja di halaman (pakai untuk satu input saja) */
  tempel?: boolean;
};

// Pilih foto -> dikompres di browser -> diunggah ke bucket "foto" di folder user.
export function PhotoInput({ value, onChange, label = "Pilih foto jajanan", kecil, tempel }: Props) {
  const [info, setInfo] = useState<string>();
  const [busy, setBusy] = useState<string>();

  function pilih(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) proses(file);
  }

  async function proses(file: File) {
    setInfo(undefined);
    try {
      setBusy("Mengompres foto...");
      const { file: hasil, sebelumKB, sesudahKB } = await compressImage(file);

      setBusy("Mengunggah...");
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Masuk dulu untuk mengunggah foto.");
      const path = `${auth.user.id}/${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage.from("foto").upload(path, hasil, { contentType: "image/webp" });
      if (error) throw new Error(`Gagal mengunggah: ${error.message}`);

      onChange(supabase.storage.from("foto").getPublicUrl(path).data.publicUrl);
      setInfo(`Foto dikompres: ${sebelumKB} KB → ${sesudahKB} KB`);
    } catch (err) {
      setInfo(err instanceof Error ? err.message : "Gagal memproses foto.");
    } finally {
      setBusy(undefined);
    }
  }

  // Ctrl+V: ambil gambar pertama dari clipboard. Teks biasa tetap ditempel seperti normal.
  const prosesRef = useRef(proses);
  useEffect(() => {
    prosesRef.current = proses;
  });
  useEffect(() => {
    if (!tempel || busy) return;
    function onPaste(e: ClipboardEvent) {
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
      if (!file) return;
      e.preventDefault();
      prosesRef.current(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [tempel, busy]);

  return (
    <div className="space-y-2">
      <div className={`relative ${kecil ? "max-w-48" : "max-w-sm"}`}>
        <label className="flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-line bg-surface hover:border-brand">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- pratinjau foto kiriman, belum perlu next/image
            <img src={value} alt="Pratinjau foto" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 p-2 text-center text-sm text-ink-2">
              <ImagePlus size={kecil ? 20 : 28} aria-hidden />
              {busy ?? label}
              {!busy && tempel && <span className="text-xs">atau tekan Ctrl+V untuk menempel gambar</span>}
            </span>
          )}
          <input type="file" accept="image/*" className="sr-only" onChange={pilih} disabled={!!busy} />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Hapus foto"
            className="absolute right-2 top-2 rounded-full bg-ink/70 p-1 text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {info && <p className="text-sm text-ink-2">{info}</p>}
    </div>
  );
}
