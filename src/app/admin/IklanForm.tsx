"use client";

import { useActionState, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { IklanMedia } from "@/components/IklanMedia";
import { compressImage } from "@/lib/compress-image";
import { createClient } from "@/lib/supabase/client";
import { tambahIklan, type HasilIklan } from "./iklan-actions";

const MAKS = 2 * 1024 * 1024; // 2 MB, sama dengan batas bucket "iklan"
const kb = (n: number) => Math.round(n / 1024);

type Media = { url: string; jenis: "foto" | "video" };

// Foto JPG/PNG/WebP > 2 MB dikompres otomatis. GIF & video harus sudah <= 2 MB
// (kompres video di browser butuh library besar, belum dipakai).
async function siapkan(file: File): Promise<{ file: File; jenis: Media["jenis"]; info: string }> {
  if (file.type.startsWith("video/")) {
    if (!["video/mp4", "video/webm"].includes(file.type)) throw new Error("Video harus MP4 atau WebM.");
    if (file.size > MAKS) {
      throw new Error(
        `Video ${kb(file.size)} KB, maksimal 2048 KB. Perpendek durasi (5-10 detik) atau kecilkan resolusi, mis. lewat HandBrake atau clideo.com.`,
      );
    }
    return { file, jenis: "video", info: `Video ${kb(file.size)} KB` };
  }
  if (file.type === "image/gif") {
    if (file.size > MAKS) throw new Error(`GIF ${kb(file.size)} KB, maksimal 2048 KB. Ubah ke MP4 agar jauh lebih kecil.`);
    return { file, jenis: "foto", info: `GIF ${kb(file.size)} KB` };
  }
  if (!file.type.startsWith("image/")) throw new Error("Format harus foto (JPG/PNG/WebP/GIF) atau video (MP4/WebM).");
  if (file.size <= MAKS) return { file, jenis: "foto", info: `Foto ${kb(file.size)} KB (tidak perlu dikompres)` };
  const hasil = await compressImage(file, { maxSizeMB: 1.8, maxWidthOrHeight: 1600 });
  return { file: hasil.file, jenis: "foto", info: `Foto dikompres: ${hasil.sebelumKB} KB → ${hasil.sesudahKB} KB` };
}

export function IklanForm() {
  const [media, setMedia] = useState<Media>();
  const [info, setInfo] = useState<string>();
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Setelah tersimpan: kosongkan form
  const [hasil, kirim, proses] = useActionState(async (prev: HasilIklan, form: FormData) => {
    const res = await tambahIklan(prev, form);
    if (res?.ok) {
      formRef.current?.reset();
      setMedia(undefined);
      setInfo("Iklan tersimpan dan langsung tampil di sidebar.");
    }
    return res;
  }, undefined);

  async function pilih(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setInfo("Memproses...");
    try {
      const siap = await siapkan(file);
      const supabase = createClient();
      const ext = siap.file.name.split(".").pop() ?? "bin";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("iklan").upload(path, siap.file, { contentType: siap.file.type });
      if (error) throw new Error(`Gagal mengunggah: ${error.message}`);
      setMedia({ url: supabase.storage.from("iklan").getPublicUrl(path).data.publicUrl, jenis: siap.jenis });
      setInfo(siap.info);
    } catch (err) {
      setInfo(err instanceof Error ? err.message : "Gagal memproses file.");
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-sm border border-line bg-surface px-3 py-2";
  return (
    <form ref={formRef} action={kirim} className="grid max-w-3xl gap-5 rounded-lg border border-line bg-surface p-5 sm:grid-cols-[1fr_220px]">
      <div className="space-y-3">
        <h2 className="font-semibold">Tambah iklan</h2>
        <input name="judul" required minLength={2} maxLength={80} placeholder="Judul / nama sponsor" aria-label="Judul iklan" className={input} />
        <input name="link" type="url" placeholder="Link tujuan (opsional), https://..." aria-label="Link tujuan" className={input} />
        <input type="hidden" name="mediaUrl" value={media?.url ?? ""} />
        <input type="hidden" name="jenis" value={media?.jenis ?? ""} />
        <label className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-brand">
          <Upload size={16} aria-hidden /> {busy ? "Memproses..." : "Pilih foto / GIF / video"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            onChange={pilih}
            disabled={busy}
            className="sr-only"
          />
        </label>
        <p className="text-xs text-ink-2">Maks. 2 MB. Foto lebih besar dikompres otomatis; video & GIF harus sudah di bawah 2 MB.</p>
        {info && <p role="status" className="text-sm text-ink-2">{info}</p>}
        {hasil?.error && <p role="alert" className="text-sm text-danger">{hasil.error}</p>}
        <button
          disabled={proses || busy || !media}
          className="rounded-full bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
        >
          {proses ? "Menyimpan..." : "Simpan iklan"}
        </button>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-2">Pratinjau</p>
        {media ? (
          <IklanMedia iklan={{ judul: "Pratinjau iklan", mediaUrl: media.url, jenis: media.jenis }} />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-subtle text-sm text-ink-2">Belum ada media</div>
        )}
      </div>
    </form>
  );
}
