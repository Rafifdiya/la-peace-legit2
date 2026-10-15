"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, FolderPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { openLogin } from "./LoginDialog";

type Koleksi = { id: string; nama: string; berisi: boolean };
type State = { userId: string; snackId: string; tersimpan: boolean; koleksi: Koleksi[] };

const btn = "flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 hover:border-brand disabled:opacity-60";

/**
 * Tombol Simpan + pilih koleksi di halaman detail (halaman statis, jadi status dicek di browser).
 * Akun gratis maks. 3 koleksi; batas dicek di database (migration 0010).
 */
export function SimpanButton({ slug }: { slug: string }) {
  const [state, setState] = useState<State | null>();
  const [buka, setBuka] = useState(false);
  const [pesan, setPesan] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function muat() {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return setState(null);
    const { data: snack } = await supabase.from("snacks").select("id").eq("slug", slug).maybeSingle();
    if (!snack) return setState(null);
    const [save, kol] = await Promise.all([
      supabase.from("saves").select("snack_id").eq("snack_id", snack.id).maybeSingle(),
      supabase.from("collections").select("id, nama, collection_items (snack_id)").order("created_at"),
    ]);
    setState({
      userId: auth.user.id,
      snackId: snack.id,
      tersimpan: !!save.data,
      koleksi: (kol.data ?? []).map((k) => ({
        id: k.id,
        nama: k.nama,
        berisi: k.collection_items.some((i: { snack_id: string }) => i.snack_id === snack.id),
      })),
    });
  }

  useEffect(() => {
    // Muat status awal; muat() hanya memanggil setState setelah data datang
    // eslint-disable-next-line react-hooks/set-state-in-effect
    muat();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function jalankan(aksi: () => Promise<{ error: { message: string } | null }>) {
    setBusy(true);
    setPesan(undefined);
    const { error } = await aksi();
    if (error) setPesan(error.message);
    await muat();
    setBusy(false);
  }

  if (state === undefined) {
    return <span className={`${btn} opacity-60`}><Bookmark size={14} aria-hidden /> Simpan</span>;
  }
  if (state === null) {
    return (
      <button type="button" onClick={openLogin} className={btn}>
        <Bookmark size={14} aria-hidden /> Simpan
      </button>
    );
  }

  const supabase = createClient();
  const s = state;
  const toggleSimpan = () =>
    jalankan(async () =>
      s.tersimpan
        ? await supabase.from("saves").delete().eq("snack_id", s.snackId)
        : await supabase.from("saves").insert({ snack_id: s.snackId }),
    );
  const toggleKoleksi = (k: Koleksi) =>
    jalankan(async () => {
      if (k.berisi) return await supabase.from("collection_items").delete().eq("collection_id", k.id).eq("snack_id", s.snackId);
      // Masuk koleksi = otomatis tersimpan juga
      if (!s.tersimpan) await supabase.from("saves").insert({ snack_id: s.snackId });
      return await supabase.from("collection_items").insert({ collection_id: k.id, snack_id: s.snackId });
    });

  async function buatKoleksi(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const nama = String(new FormData(form).get("nama") ?? "").trim();
    if (!nama) return;
    await jalankan(async () => {
      const { data, error } = await supabase.from("collections").insert({ nama }).select("id").single();
      if (error) return { error };
      if (!s.tersimpan) await supabase.from("saves").insert({ snack_id: s.snackId });
      return await supabase.from("collection_items").insert({ collection_id: data.id, snack_id: s.snackId });
    });
    form.reset();
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button type="button" onClick={toggleSimpan} disabled={busy} aria-pressed={s.tersimpan} className={`${btn} ${s.tersimpan ? "border-brand text-brand" : ""}`}>
          {s.tersimpan ? <BookmarkCheck size={14} aria-hidden /> : <Bookmark size={14} aria-hidden />}
          {s.tersimpan ? "Tersimpan" : "Simpan"}
        </button>
        <button type="button" onClick={() => setBuka(!buka)} aria-expanded={buka} className={btn}>
          <FolderPlus size={14} aria-hidden /> Koleksi
        </button>
      </div>

      {buka && (
        <div className="absolute left-0 z-20 mt-2 w-72 space-y-3 rounded-lg border border-line bg-surface p-4 text-sm shadow-card">
          <p className="font-semibold">Tambahkan ke koleksi</p>
          {s.koleksi.length === 0 && <p className="text-ink-2">Belum ada koleksi.</p>}
          <ul className="space-y-1">
            {s.koleksi.map((k) => (
              <li key={k.id}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={k.berisi} disabled={busy} onChange={() => toggleKoleksi(k)} className="accent-brand" />
                  {k.nama}
                </label>
              </li>
            ))}
          </ul>
          <form onSubmit={buatKoleksi} className="flex gap-2">
            <input name="nama" maxLength={40} placeholder="Koleksi baru, mis. Kue Lebaran" aria-label="Nama koleksi baru" className="min-w-0 flex-1 rounded-sm border border-line px-2 py-1" />
            <button disabled={busy} className="rounded-full bg-brand px-3 py-1 font-semibold text-white disabled:opacity-60">Buat</button>
          </form>
          {pesan && (
            <p role="alert" className="text-danger">
              {pesan}{" "}
              {/Premium/.test(pesan) && <Link href="/premium" className="font-semibold text-brand underline">Lihat Premium</Link>}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
