"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { adaKataKasar } from "@/lib/kata-kasar";
import { openLogin } from "./LoginDialog";

type Laporan = {
  id: string;
  user_id: string;
  berhasil: boolean;
  catatan: string | null;
  foto_url: string | null;
  created_at: string;
  profiles: { username: string | null; nama_tampil: string | null } | null;
};

const pil = "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors";

/**
 * "Saya sudah coba": bukti dari komunitas bahwa resep berhasil dibuat.
 * Halaman detail statis, jadi data diambil di browser.
 */
export function SudahCoba({ slug }: { slug: string }) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [snackId, setSnackId] = useState<string>();
  const [userId, setUserId] = useState<string | null>();
  const [daftar, setDaftar] = useState<Laporan[]>([]);
  const [form, setForm] = useState<{ berhasil: boolean; catatan: string; foto?: File; fotoLama?: string | null }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const muat = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("resep_dicoba")
      .select("id, user_id, berhasil, catatan, foto_url, created_at, profiles (username, nama_tampil)")
      .eq("snack_id", id)
      .order("created_at", { ascending: false })
      .returns<Laporan[]>();
    setDaftar(data ?? []);
  }, [supabase]);

  useEffect(() => {
    (async () => {
      const [{ data: auth }, { data: snack }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("snacks").select("id").eq("slug", slug).maybeSingle(),
      ]);
      setUserId(auth.user?.id ?? null);
      if (snack) {
        setSnackId(snack.id);
        await muat(snack.id);
      }
    })();
  }, [slug, supabase, muat]);

  const milikku = daftar.find((l) => l.user_id === userId);
  const berhasil = daftar.filter((l) => l.berhasil).length;

  function mulai(b: boolean) {
    if (!userId) return openLogin();
    setError("");
    setForm({ berhasil: b, catatan: milikku?.catatan ?? "", fotoLama: milikku?.foto_url });
  }

  async function kirim() {
    if (!form || !snackId || !userId) return;
    const catatan = form.catatan.trim();
    if (adaKataKasar(catatan)) return setError("Catatan mengandung kata yang tidak pantas.");
    setBusy(true);
    setError("");
    try {
      let foto_url = form.fotoLama ?? null;
      if (form.foto) {
        const { file } = await compressImage(form.foto, { maxSizeMB: 1.5, maxWidthOrHeight: 1280 });
        const path = `${userId}/dicoba-${Date.now()}.${file.type.split("/")[1]}`;
        const up = await supabase.storage.from("foto").upload(path, file, { contentType: file.type });
        if (up.error) throw new Error(up.error.message);
        foto_url = supabase.storage.from("foto").getPublicUrl(path).data.publicUrl;
      }
      const { error: err } = await supabase.from("resep_dicoba").upsert(
        { snack_id: snackId, user_id: userId, berhasil: form.berhasil, catatan: catatan || null, foto_url, updated_at: new Date().toISOString() },
        { onConflict: "snack_id,user_id" },
      );
      if (err) throw new Error(err.message);
      setForm(undefined);
      await muat(snackId);
    } catch (e) {
      setError(`Gagal mengirim: ${(e as Error).message}`);
    }
    setBusy(false);
  }

  async function hapus() {
    if (!milikku || !snackId || !confirm("Hapus laporanmu untuk resep ini?")) return;
    await supabase.from("resep_dicoba").delete().eq("id", milikku.id);
    await muat(snackId);
  }

  return (
    <div className="space-y-4 rounded-xl border border-line bg-surface p-5 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold">Sudah coba resep ini?</h3>
          <p className="text-sm text-ink-2">
            {daftar.length === 0
              ? "Belum ada yang melapor. Jadi yang pertama!"
              : <>Dicoba <b className="text-ink">{daftar.length} orang</b> · <b className="text-accent">{berhasil} berhasil</b> ({Math.round((berhasil / daftar.length) * 100)}%)</>}
          </p>
        </div>
        {!form && (
          <div className="flex gap-2">
            <button type="button" onClick={() => mulai(true)} className={`${pil} ${milikku?.berhasil === true ? "border-accent bg-accent text-white" : "border-line hover:border-accent hover:text-accent"}`}>
              <ThumbsUp size={15} aria-hidden /> Berhasil
            </button>
            <button type="button" onClick={() => mulai(false)} className={`${pil} ${milikku?.berhasil === false ? "border-danger bg-danger text-white" : "border-line hover:border-danger hover:text-danger"}`}>
              <ThumbsDown size={15} aria-hidden /> Kurang berhasil
            </button>
          </div>
        )}
      </div>

      {daftar.length > 0 && (
        // Bar perbandingan berhasil / kurang berhasil
        <div className="flex h-2 overflow-hidden rounded-full bg-danger/30" aria-hidden>
          <div className="bg-accent" style={{ width: `${(berhasil / daftar.length) * 100}%` }} />
        </div>
      )}

      {milikku && !form && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
          Kamu melapor: <b className={milikku.berhasil ? "text-accent" : "text-danger"}>{milikku.berhasil ? "Berhasil" : "Kurang berhasil"}</b>.
          <button type="button" onClick={() => mulai(milikku.berhasil)} className="text-brand underline">Ubah</button>
          <button type="button" onClick={hapus} className="flex items-center gap-1 text-danger underline"><Trash2 size={13} aria-hidden /> Hapus</button>
        </p>
      )}

      {form && (
        <div className="space-y-3 rounded-lg bg-subtle p-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm({ ...form, berhasil: true })} className={`${pil} ${form.berhasil ? "border-accent bg-accent text-white" : "border-line bg-surface"}`}>
              <ThumbsUp size={15} aria-hidden /> Berhasil
            </button>
            <button type="button" onClick={() => setForm({ ...form, berhasil: false })} className={`${pil} ${!form.berhasil ? "border-danger bg-danger text-white" : "border-line bg-surface"}`}>
              <ThumbsDown size={15} aria-hidden /> Kurang berhasil
            </button>
          </div>
          <textarea
            value={form.catatan}
            onChange={(e) => setForm({ ...form, catatan: e.target.value })}
            maxLength={280}
            rows={2}
            placeholder={form.berhasil ? "Catatan (opsional), mis. gula saya kurangi sedikit, tetap enak" : "Apa yang kurang? (opsional), mis. adonan terlalu lembek"}
            aria-label="Catatan"
            className="w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 hover:border-brand">
              <Camera size={15} aria-hidden /> {form.foto || form.fotoLama ? "Ganti foto hasil" : "Tambah foto hasil (opsional)"}
            </button>
            {form.foto && <span className="text-ink-2">{form.foto.name}</span>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setForm({ ...form, foto: f }); }} />
          </div>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={kirim} disabled={busy} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60">
              {busy ? "Mengirim..." : "Kirim"}
            </button>
            <button type="button" onClick={() => setForm(undefined)} disabled={busy} className="rounded-full border border-line px-5 py-2 text-sm hover:border-brand">Batal</button>
          </div>
        </div>
      )}

      {daftar.some((l) => l.catatan || l.foto_url) && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {daftar.filter((l) => l.catatan || l.foto_url).slice(0, 6).map((l) => (
            <li key={l.id} className="flex gap-3 rounded-lg border border-line p-3 text-sm">
              {l.foto_url && (
                <Image src={l.foto_url} alt="Foto hasil masakan" width={160} height={160} sizes="80px" className="h-20 w-20 shrink-0 rounded-md object-cover" />
              )}
              <div className="min-w-0 space-y-1">
                <p className={`flex items-center gap-1 font-semibold ${l.berhasil ? "text-accent" : "text-danger"}`}>
                  {l.berhasil ? <ThumbsUp size={13} aria-hidden /> : <ThumbsDown size={13} aria-hidden />}
                  {l.berhasil ? "Berhasil" : "Kurang berhasil"}
                </p>
                {l.catatan && <p className="break-words">{l.catatan}</p>}
                {l.profiles?.username && (
                  <Link href={`/profil/${l.profiles.username}`} className="text-ink-2 hover:text-brand">@{l.profiles.username}</Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
