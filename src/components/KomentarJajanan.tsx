"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CornerDownRight, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { adaKataKasar } from "@/lib/kata-kasar";
import { formatTanggal } from "@/lib/format";
import { useSesi } from "@/app/request/FormTanya";
import { openLogin } from "./LoginDialog";

type Komentar = {
  id: string;
  parent_id: string | null;
  user_id: string | null;
  isi: string;
  created_at: string;
  diedit_at: string | null;
  profiles: { username: string | null; nama_tampil: string | null } | null;
};

const input = "w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm";
const kirimCls = "rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60";
const kecil = "flex items-center gap-1 text-xs text-ink-2 hover:text-brand";

/** Kotak tulis komentar / balasan / edit. */
function Tulis({ awal = "", placeholder, label, onKirim, onBatal }: {
  awal?: string; placeholder: string; label: string; onKirim: (isi: string) => Promise<string | undefined>; onBatal?: () => void;
}) {
  const [isi, setIsi] = useState(awal);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function kirim() {
    const t = isi.trim();
    if (!t) return;
    if (adaKataKasar(t)) return setError("Komentar mengandung kata yang tidak pantas.");
    setBusy(true);
    const err = await onKirim(t);
    setBusy(false);
    if (err) return setError(err);
    setIsi("");
    setError("");
  }

  return (
    <div className="space-y-2">
      <textarea value={isi} onChange={(e) => setIsi(e.target.value)} maxLength={1000} rows={2} placeholder={placeholder} aria-label={placeholder} className={input} />
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={kirim} disabled={busy || !isi.trim()} className={kirimCls}>{busy ? "Mengirim..." : label}</button>
        {onBatal && <button type="button" onClick={onBatal} className="rounded-full border border-line px-4 py-1.5 text-sm hover:border-brand">Batal</button>}
      </div>
    </div>
  );
}

/**
 * Komentar di halaman jajanan: komentar utama + balasan 1 tingkat.
 * Semua yang masuk (termasuk pengirim jajanan) boleh berkomentar & membalas;
 * edit hanya milik sendiri, hapus milik sendiri atau admin.
 */
export function KomentarJajanan({ slug }: { slug: string }) {
  const supabase = createClient();
  const sesi = useSesi();
  const [snackId, setSnackId] = useState<string>();
  const [daftar, setDaftar] = useState<Komentar[]>();
  const [balas, setBalas] = useState<string>();
  const [edit, setEdit] = useState<string>();

  const muat = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("snack_comments")
      .select("id, parent_id, user_id, isi, created_at, diedit_at, profiles (username, nama_tampil)")
      .eq("snack_id", id)
      .order("created_at")
      .returns<Komentar[]>();
    setDaftar(data ?? []);
  }, [supabase]);

  useEffect(() => {
    supabase.from("snacks").select("id").eq("slug", slug).maybeSingle().then(({ data }) => {
      if (!data) return setDaftar([]);
      setSnackId(data.id);
      muat(data.id);
    });
  }, [slug, supabase, muat]);

  async function tambah(isi: string, parent_id: string | null) {
    if (!snackId) return "Jajanan tidak ditemukan.";
    const { error } = await supabase.from("snack_comments").insert({ snack_id: snackId, parent_id, isi });
    if (error) return /relation|does not exist|schema cache/i.test(error.message) ? "Fitur komentar belum aktif (migration 0019)." : error.message;
    setBalas(undefined);
    await muat(snackId);
  }

  async function ubah(id: string, isi: string) {
    const { error } = await supabase.from("snack_comments").update({ isi, diedit_at: new Date().toISOString() }).eq("id", id);
    if (error) return error.message;
    setEdit(undefined);
    if (snackId) await muat(snackId);
  }

  async function hapus(k: Komentar) {
    const ada = daftar?.some((x) => x.parent_id === k.id);
    if (!confirm(ada ? "Hapus komentar ini beserta balasannya?" : "Hapus komentar ini?")) return;
    await supabase.from("snack_comments").delete().eq("id", k.id);
    if (snackId) await muat(snackId);
  }

  const utama = daftar?.filter((k) => !k.parent_id) ?? [];

  const item = (k: Komentar, anak?: boolean) => {
    const milikku = !!sesi && k.user_id === sesi.userId;
    const nama = k.profiles?.username;
    return (
      <div key={k.id} className={`space-y-1.5 ${anak ? "border-l-2 border-line pl-4" : ""}`}>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-ink-2">
          {anak && <CornerDownRight size={13} aria-hidden />}
          {nama ? <Link href={`/profil/${nama}`} className="font-semibold text-ink hover:text-brand">@{nama}</Link> : <span>Pengguna</span>}
          <span>· {formatTanggal(k.created_at)}</span>
          {k.diedit_at && <span>(diedit)</span>}
        </p>
        {edit === k.id ? (
          <Tulis awal={k.isi} placeholder="Ubah komentar" label="Simpan" onKirim={(isi) => ubah(k.id, isi)} onBatal={() => setEdit(undefined)} />
        ) : (
          <p className="whitespace-pre-line break-words">{k.isi}</p>
        )}
        {edit !== k.id && (
          <div className="flex gap-4">
            {!anak && (
              <button type="button" onClick={() => (sesi ? setBalas(balas === k.id ? undefined : k.id) : openLogin())} className={kecil}>
                <CornerDownRight size={13} aria-hidden /> Balas
              </button>
            )}
            {milikku && <button type="button" onClick={() => setEdit(k.id)} className={kecil}><Pencil size={13} aria-hidden /> Edit</button>}
            {(milikku || sesi?.admin) && (
              <button type="button" onClick={() => hapus(k)} className={`${kecil} hover:text-danger`}><Trash2 size={13} aria-hidden /> Hapus</button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {sesi ? (
        <Tulis placeholder="Tulis komentar, mis. kenangan, tips, atau pertanyaan..." label="Kirim" onKirim={(isi) => tambah(isi, null)} />
      ) : (
        <button type="button" onClick={openLogin} className="w-full rounded-lg border border-dashed border-line p-3 text-left text-sm text-ink-2 hover:border-brand">
          Masuk untuk menulis komentar...
        </button>
      )}

      {daftar === undefined ? (
        <p className="text-sm text-ink-2">Memuat komentar...</p>
      ) : utama.length === 0 ? (
        <p className="text-ink-2">Belum ada komentar. Jadi yang pertama!</p>
      ) : (
        <ul className="space-y-4">
          {utama.map((k) => (
            <li key={k.id} className="space-y-3 rounded-lg border border-line bg-surface p-4">
              {item(k)}
              {daftar.filter((b) => b.parent_id === k.id).map((b) => item(b, true))}
              {balas === k.id && (
                <div className="border-l-2 border-line pl-4">
                  <Tulis placeholder={`Balas @${k.profiles?.username ?? "pengguna"}...`} label="Balas" onKirim={(isi) => tambah(isi, k.id)} onBatal={() => setBalas(undefined)} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
