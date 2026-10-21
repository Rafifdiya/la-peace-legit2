"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Award, Flag, Pencil, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { openLogin } from "@/components/LoginDialog";
import { ATURAN_FORUM, TOPIK } from "@/lib/forum";
import { buatPertanyaan, editBalasan, editPostingan, hapusBalasan, hapusPostingan, jawabPertanyaan, laporkan, pilihTerbaik, type HasilTanya } from "./actions";

const input = "w-full rounded-sm border border-line bg-surface px-3 py-2";
const kirim = "rounded-full bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-hover disabled:opacity-60";
const kecil = "flex items-center gap-1 text-xs text-ink-2 hover:text-brand disabled:opacity-50";

type Sesi = { userId: string; admin: boolean } | null;

/** Cek login di browser (halaman forum statis). undefined = masih dicek, null = belum masuk. */
export function useSesi() {
  const [sesi, setSesi] = useState<Sesi>();
  useEffect(() => {
    const supabase = createClient();
    const muat = async (userId?: string) => {
      if (!userId) return setSesi(null);
      const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      setSesi({ userId, admin: data?.role === "admin" });
    };
    supabase.auth.getUser().then(({ data }) => muat(data.user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => muat(s?.user.id));
    return () => sub.subscription.unsubscribe();
  }, []);
  return sesi;
}

/** Tombol "Buat postingan": belum masuk = dialog Masuk, sudah masuk = form postingan. */
export function TombolTanya({ provinsi }: { provinsi: { nama: string; slug: string }[] }) {
  const sesi = useSesi();
  const ref = useRef<HTMLDialogElement>(null);
  const [hasil, aksi, pending] = useActionState<HasilTanya, FormData>(buatPertanyaan, undefined);

  return (
    <>
      <button
        type="button"
        onClick={() => (sesi ? ref.current?.showModal() : openLogin())}
        className="rounded-full bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-hover"
      >
        Buat postingan
      </button>
      <dialog ref={ref} aria-labelledby="judul-post" className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-xl bg-surface p-0 text-ink backdrop:bg-ink/50">
        <form action={aksi} className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="judul-post" className="font-display text-2xl font-semibold">Postingan baru</h2>
              <p className="text-sm text-ink-2">Tanya, cerita, atau berbagi seputar jajanan tradisional.</p>
            </div>
            <button type="button" onClick={() => ref.current?.close()} aria-label="Tutup" className="rounded-full p-1 text-ink-2 hover:text-danger">
              <X size={20} aria-hidden />
            </button>
          </div>
          <ul className="list-inside list-disc rounded-lg bg-subtle p-3 text-xs text-ink-2">
            {ATURAN_FORUM.map((a) => <li key={a}>{a}</li>)}
          </ul>
          <fieldset className="space-y-1">
            <legend className="text-sm font-semibold">Topik</legend>
            <div className="flex flex-wrap gap-2">
              {TOPIK.map((t) => (
                <label key={t.key} className="cursor-pointer">
                  <input type="radio" name="topik" value={t.key} required className="peer sr-only" />
                  <span className="block rounded-full border border-line px-3 py-1 text-sm peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand">
                    {t.emoji} {t.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Judul</span>
            <input name="judul" required minLength={3} maxLength={100} placeholder="mis. Masih ada yang jual kue gandos di Bandung?" className={input} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Isi (opsional)</span>
            <textarea name="deskripsi" rows={4} maxLength={1000} placeholder="Ceritakan lebih lengkap." className={input} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Daerah (opsional)</span>
            <select name="provinsi" defaultValue="" className={input}>
              <option value="">Tidak spesifik</option>
              {provinsi.map((p) => <option key={p.slug} value={p.slug}>{p.nama}</option>)}
            </select>
          </label>
          {hasil?.error && <p role="alert" className="text-sm text-danger">{hasil.error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => ref.current?.close()} className="rounded-full border border-line px-5 py-2 hover:border-brand">Batal</button>
            <button disabled={pending} className={kirim}>{pending ? "Mengirim..." : "Kirim postingan"}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}

/** Form balasan di halaman postingan. */
export function FormJawab({ requestId, jajanan, pemilikPostId, adaBalasanLain }: {
  requestId: string;
  jajanan: { nama: string; slug: string }[];
  pemilikPostId: string | null;
  /** Ada balasan dari selain pemilik postingan */
  adaBalasanLain: boolean;
}) {
  const sesi = useSesi();
  const formRef = useRef<HTMLFormElement>(null);
  const [hasil, aksi, pending] = useActionState<HasilTanya, FormData>(async (prev, form) => {
    const r = await jawabPertanyaan(requestId, prev, form);
    if (r?.ok) formRef.current?.reset();
    return r;
  }, undefined);

  if (!sesi) {
    return (
      <button type="button" onClick={openLogin} disabled={sesi === undefined} className="w-full rounded-full border border-brand py-2 text-brand">
        Masuk untuk membalas
      </button>
    );
  }
  // Pemilik postingan menunggu balasan orang lain dulu
  if (sesi.userId === pemilikPostId && !adaBalasanLain) {
    return (
      <p className="rounded-lg border border-dashed border-line bg-surface p-4 text-center text-sm text-ink-2">
        Ini postinganmu. Tunggu balasan dari komunitas dulu, nanti kamu bisa membalasnya di sini.
      </p>
    );
  }
  return (
    <form ref={formRef} action={aksi} className="space-y-3 rounded-lg border border-line bg-surface p-4">
      <h3 className="font-semibold">Tulis balasan</h3>
      <textarea name="isi" required minLength={3} maxLength={1000} rows={3} placeholder="Bagikan resep, lokasi penjual, cerita, atau tips yang kamu tahu." className={input} />
      <label className="block space-y-1">
        <span className="text-sm text-ink-2">Tautkan jajanan dari katalog (opsional)</span>
        <select name="jajanan" defaultValue="" className={input}>
          <option value="">Tidak ada</option>
          {jajanan.map((j) => <option key={j.slug} value={j.slug}>{j.nama}</option>)}
        </select>
      </label>
      {hasil?.error && <p role="alert" className="text-sm text-danger">{hasil.error}</p>}
      {hasil?.ok && <p role="status" className="text-sm text-accent">{hasil.ok}</p>}
      <button disabled={pending} className={kirim}>{pending ? "Mengirim..." : "Kirim balasan"}</button>
    </form>
  );
}

/** Lapor: minta alasan singkat lewat prompt bawaan browser. */
function TombolLapor({ jenis, id, sesi }: { jenis: "forum_post" | "forum_reply"; id: string; sesi: Sesi | undefined }) {
  const [pending, mulai] = useTransition();
  const [pesan, setPesan] = useState<string>();
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!sesi) return openLogin();
          const alasan = prompt("Kenapa dilaporkan? (mis. di luar tema, kata kasar, spam)");
          if (alasan === null) return;
          mulai(async () => {
            const r = await laporkan(jenis, id, alasan);
            setPesan(r?.error ?? r?.ok);
          });
        }}
        className={kecil}
      >
        <Flag size={13} aria-hidden /> Laporkan
      </button>
      {pesan && <span role="status" className="text-xs text-ink-2">{pesan}</span>}
    </>
  );
}

/** Form edit singkat (judul opsional + isi) untuk postingan / balasan milik sendiri. */
function FormEdit({ judul, isi, onSimpan, onBatal }: {
  judul?: string; isi: string; onSimpan: (judul: string, isi: string) => Promise<HasilTanya>; onBatal: () => void;
}) {
  const [j, setJ] = useState(judul ?? "");
  const [t, setT] = useState(isi);
  const [pending, mulai] = useTransition();
  const [error, setError] = useState<string>();
  return (
    <div className="w-full space-y-2 rounded-lg bg-subtle p-3">
      {judul !== undefined && <input value={j} onChange={(e) => setJ(e.target.value)} maxLength={100} aria-label="Judul" className={input} />}
      <textarea value={t} onChange={(e) => setT(e.target.value)} rows={3} maxLength={1000} aria-label="Isi" className={input} />
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={pending} onClick={() => mulai(async () => { const h = await onSimpan(j, t); if (h?.error) setError(h.error); else onBatal(); })} className={`${kirim} text-sm`}>
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
        <button type="button" onClick={onBatal} className="rounded-full border border-line px-4 py-1.5 text-sm hover:border-brand">Batal</button>
      </div>
    </div>
  );
}

/** Aksi di postingan: Laporkan, Edit (pemilik), Hapus (pemilik/admin). */
export function AksiPostingan({ id, pemilikId, judul, isi }: { id: string; pemilikId: string | null; judul: string; isi: string }) {
  const sesi = useSesi();
  const [pending, mulai] = useTransition();
  const [error, setError] = useState<string>();
  const [edit, setEdit] = useState(false);
  const milikku = !!sesi && sesi.userId === pemilikId;
  const boleh = !!sesi && (sesi.admin || milikku);
  if (edit) return <FormEdit judul={judul} isi={isi} onSimpan={(j, t) => editPostingan(id, j, t)} onBatal={() => setEdit(false)} />;
  return (
    <div className="flex flex-wrap items-center gap-4">
      {milikku && (
        <button type="button" onClick={() => setEdit(true)} className={kecil}>
          <Pencil size={13} aria-hidden /> Edit
        </button>
      )}
      <TombolLapor jenis="forum_post" id={id} sesi={sesi} />
      {boleh && (
        <button
          type="button"
          disabled={pending}
          onClick={() => confirm("Hapus postingan ini beserta semua balasannya?") && mulai(async () => setError((await hapusPostingan(id))?.error))}
          className={`${kecil} hover:text-danger`}
        >
          <Trash2 size={13} aria-hidden /> Hapus
        </button>
      )}
      {error && <span role="alert" className="text-xs text-danger">{error}</span>}
    </div>
  );
}

/** Aksi di balasan: Balasan terbaik (pemilik postingan), Laporkan, Hapus (pemilik/admin). */
export function AksiBalasan({ requestId, id, pemilikId, pemilikPostId, terbaik, isi }: { requestId: string; id: string; pemilikId: string | null; pemilikPostId: string | null; terbaik: boolean; isi: string }) {
  const sesi = useSesi();
  const [pending, mulai] = useTransition();
  const [error, setError] = useState<string>();
  const [edit, setEdit] = useState(false);
  const pemilikPost = !!sesi && sesi.userId === pemilikPostId;
  const milikku = !!sesi && sesi.userId === pemilikId;
  const boleh = !!sesi && (sesi.admin || milikku);
  if (edit) return <FormEdit isi={isi} onSimpan={(_, t) => editBalasan(id, t)} onBatal={() => setEdit(false)} />;
  return (
    <div className="flex flex-wrap items-center gap-4 pt-1">
      {milikku && (
        <button type="button" onClick={() => setEdit(true)} className={kecil}>
          <Pencil size={13} aria-hidden /> Edit
        </button>
      )}
      {pemilikPost && (
        <button type="button" disabled={pending} onClick={() => mulai(async () => setError((await pilihTerbaik(requestId, terbaik ? null : id))?.error))} className={`${kecil} hover:text-accent`}>
          <Award size={13} aria-hidden /> {terbaik ? "Batalkan balasan terbaik" : "Jadikan balasan terbaik"}
        </button>
      )}
      <TombolLapor jenis="forum_reply" id={id} sesi={sesi} />
      {boleh && (
        <button type="button" disabled={pending} onClick={() => confirm("Hapus balasan ini?") && mulai(async () => setError((await hapusBalasan(id))?.error))} className={`${kecil} hover:text-danger`}>
          <Trash2 size={13} aria-hidden /> Hapus
        </button>
      )}
      {error && <span role="alert" className="text-xs text-danger">{error}</span>}
    </div>
  );
}

/** Pisahkan daftar forum jadi "Postingan saya" (milik user yang masuk) dan "Postingan global". */
export function BagianForum({ items }: { items: { id: string; pemilikId: string | null; kartu: React.ReactNode }[] }) {
  const sesi = useSesi();
  const milikku = sesi ? items.filter((i) => i.pemilikId === sesi.userId) : [];
  const global = sesi ? items.filter((i) => i.pemilikId !== sesi.userId) : items;
  const grid = (list: typeof items, bisaHapus = false) => (
    <ul className="grid gap-4 md:grid-cols-2">
      {list.map((i) => (
        <li key={i.id} className="cv-auto flex flex-col rounded-lg border border-line bg-surface hover:border-brand">
          {i.kartu}
          {/* Hanya postingan milik sendiri yang punya tombol hapus, di dalam kotak bagian bawah */}
          {bisaHapus && <HapusDiKartu id={i.id} />}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-8">
      {sesi && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-semibold">Postingan saya</h2>
          {milikku.length ? grid(milikku, true) : <p className="text-sm text-ink-2">Kamu belum membuat postingan di sini.</p>}
        </section>
      )}
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">Postingan global</h2>
        {/* Admin boleh menghapus postingan siapa pun */}
        {global.length ? grid(global, !!sesi?.admin) : <p className="text-sm text-ink-2">Belum ada postingan.</p>}
      </section>
    </div>
  );
}

function HapusDiKartu({ id }: { id: string }) {
  const [pending, mulai] = useTransition();
  const [error, setError] = useState<string>();
  return (
    <div className="flex items-center justify-end gap-2 border-t border-line px-4 py-2">
      {error && <span role="alert" className="text-xs text-danger">{error}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() => confirm("Hapus postingan ini beserta semua balasannya?") && mulai(async () => setError((await hapusPostingan(id))?.error))}
        aria-label="Hapus postingan"
        className="flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-ink-2 hover:border-danger hover:bg-danger hover:text-white disabled:opacity-50"
      >
        <Trash2 size={13} aria-hidden /> {pending ? "Menghapus..." : "Hapus"}
      </button>
    </div>
  );
}
