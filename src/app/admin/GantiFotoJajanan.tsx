"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { gantiFotoJajanan } from "./actions";

/** Tombol di atas foto utama jajanan, hanya tampil untuk admin. */
export function GantiFotoJajanan({ slug }: { slug: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [admin, setAdmin] = useState(false);
  const [busy, setBusy] = useState<string>();
  const [info, setInfo] = useState<string>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      setAdmin(p?.role === "admin");
    });
  }, []);

  async function ganti(e: React.ChangeEvent<HTMLInputElement>) {
    const asli = e.target.files?.[0];
    e.target.value = "";
    if (!asli) return;
    setInfo(undefined);
    try {
      setBusy("Mengompres...");
      const { file } = await compressImage(asli);
      setBusy("Mengunggah...");
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Masuk dulu.");
      const path = `${auth.user.id}/${crypto.randomUUID()}.webp`;
      const up = await supabase.storage.from("foto").upload(path, file, { contentType: "image/webp" });
      if (up.error) throw new Error(up.error.message);
      const r = await gantiFotoJajanan(slug, supabase.storage.from("foto").getPublicUrl(path).data.publicUrl);
      if (r?.error) throw new Error(r.error);
      setInfo("Foto utama diganti.");
      router.refresh();
    } catch (err) {
      setInfo(`Gagal: ${(err as Error).message}`);
    }
    setBusy(undefined);
  }

  if (!admin) return null;
  return (
    <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={!!busy}
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1.5 rounded-full bg-ink/75 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-ink disabled:opacity-60"
      >
        <Camera size={16} aria-hidden /> {busy ?? "Ganti foto (admin)"}
      </button>
      {info && <span role="status" className="rounded bg-ink/75 px-2 py-0.5 text-xs text-white">{info}</span>}
      <input ref={fileRef} type="file" accept="image/*" onChange={ganti} className="hidden" />
    </div>
  );
}
