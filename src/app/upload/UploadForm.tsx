"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck, Plus, Trash2 } from "lucide-react";
import { LoginButton } from "@/components/LoginButton";
import { WAKTU } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { SnackCardData } from "@/lib/types";
import { PhotoInput } from "./PhotoInput";

type Langkah = { instruksi: string; foto?: string; videoUrl: string };

type Draft = {
  nama: string;
  namaLain: string;
  provinsi: string;
  daerah: string;
  kategori: string;
  deskripsi: string;
  cover?: string;
  cerita: string;
  sumber: string;
  resep: { judulVersi: string; porsi: string; waktuMenit: string; kesulitan: string; bahan: string; videoUrl: string };
  langkah: Langkah[];
  lokasi: { tempat: string; area: string; jenis: string; mapsUrl: string; orderUrl: string; tanggal: string; izinPublik: boolean };
  rarity: string;
};

const kosong: Draft = {
  nama: "",
  namaLain: "",
  provinsi: "",
  daerah: "",
  kategori: "",
  deskripsi: "",
  cerita: "",
  sumber: "",
  resep: { judulVersi: "", porsi: "", waktuMenit: "", kesulitan: "", bahan: "", videoUrl: "" },
  langkah: [{ instruksi: "", videoUrl: "" }],
  lokasi: { tempat: "", area: "", jenis: "kios_tetap", mapsUrl: "", orderUrl: "", tanggal: "", izinPublik: false },
  rarity: "",
};

const LANGKAH = ["Info dasar", "Cerita", "Resep", "Langkah pembuatan", "Lokasi terlihat", "Vote kelangkaan", "Review & kirim"];
const DRAFT_KEY = "jejak-jajan:draft-upload";
const input = "w-full rounded-sm border border-line bg-surface px-3 py-2";

const rarityPilihan = [
  ["umum", "Umum", "Masih mudah ditemukan"],
  ["mulai_langka", "Mulai langka", "Perlu dicari dulu"],
  ["hampir_punah", "Hampir punah", "Sangat jarang ada yang jual"],
  ["punah", "Punah", "Sudah tidak pernah terlihat"],
] as const;

type Props = { provinsi: { nama: string; slug: string }[]; kategori: string[] };

export function UploadForm({ provinsi, kategori }: Props) {
  const [masuk, setMasuk] = useState<boolean | null>(null);
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(kosong);
  const [mirip, setMirip] = useState<SnackCardData[]>([]);
  const [error, setError] = useState<string>();
  const [kirim, setKirim] = useState<"idle" | "mengirim" | "terkirim">("idle");

  // Cek status login (form hanya untuk user yang sudah masuk)
  useEffect(() => {
    const { data: sub } = createClient().auth.onAuthStateChange((_e, session) => setMasuk(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Muat draft tersimpan sekali saat halaman dibuka
  useEffect(() => {
    try {
      const simpan = localStorage.getItem(DRAFT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hanya ada di browser
      if (simpan) setD({ ...kosong, ...JSON.parse(simpan) });
    } catch {}
  }, []);

  // Draft tersimpan otomatis setiap ada perubahan
  useEffect(() => {
    try {
      if (d !== kosong) localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    } catch {}
  }, [d]);

  // Cek duplikat: cari jajanan dengan nama mirip
  useEffect(() => {
    const q = d.nama.trim();
    if (q.length < 3) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/jajanan?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((p) => setMirip(p.items.slice(0, 3)))
        .catch(() => {});
    }, 400);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [d.nama]);

  const ubah = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const ubahResep = (patch: Partial<Draft["resep"]>) => setD((x) => ({ ...x, resep: { ...x.resep, ...patch } }));
  const ubahLokasi = (patch: Partial<Draft["lokasi"]>) => setD((x) => ({ ...x, lokasi: { ...x.lokasi, ...patch } }));
  const ubahLangkah = (i: number, patch: Partial<Langkah>) =>
    setD((x) => ({ ...x, langkah: x.langkah.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));

  function infoDasarValid() {
    if (d.nama.trim().length < 2) return "Nama jajanan minimal 2 huruf.";
    if (!d.provinsi) return "Pilih provinsi asal.";
    if (!d.cover) return "Unggah foto utama.";
    return undefined;
  }

  function lanjut() {
    const err = step === 0 ? infoDasarValid() : undefined;
    setError(err);
    if (!err) setStep((s) => Math.min(s + 1, LANGKAH.length - 1));
  }

  async function kirimKiriman() {
    const err = infoDasarValid();
    if (err) {
      setError(err);
      setStep(0);
      return;
    }
    setError(undefined);
    setKirim("mengirim");
    const data = {
      nama: d.nama,
      namaLain: d.namaLain.split(","),
      provinsi: d.provinsi,
      daerah: d.daerah,
      kategori: d.kategori,
      deskripsi: d.deskripsi,
      cover: d.cover,
      cerita: d.cerita,
      sumber: d.sumber,
      resep: {
        ...d.resep,
        bahan: d.resep.bahan.split("\n").map((b) => b.trim()).filter(Boolean),
        langkah: d.langkah,
      },
      lokasi: d.lokasi,
      rarity: d.rarity,
    };
    const { error } = await createClient().rpc("kirim_jajanan", { data });
    if (error) {
      setError(`Gagal mengirim: ${error.message}`);
      setKirim("idle");
      return;
    }
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setKirim("terkirim");
  }

  if (masuk === null) return <p className="py-10 text-ink-2">Memuat...</p>;

  if (!masuk) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold">Masuk untuk berkontribusi</h1>
        <p className="text-ink-2">Kirim jajanan, resep, dan lokasi terakhir terlihat. Kiriman dicek admin dulu sebelum tampil.</p>
        <LoginButton className="rounded-full bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-hover">Masuk</LoginButton>
      </div>
    );
  }

  if (kirim === "terkirim") {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <CircleCheck size={48} className="mx-auto text-accent" aria-hidden />
        <h1 className="font-display text-3xl font-semibold">Terkirim!</h1>
        <p className="text-ink-2">Kirimanmu menunggu moderasi admin. Statusnya bisa dilihat di profil, tab Status kiriman.</p>
        <div className="flex justify-center gap-3">
          <Link href="/profil/saya?tab=status" className="rounded-full border border-line px-5 py-2">Lihat status</Link>
          <button
            type="button"
            onClick={() => { setD(kosong); setStep(0); setKirim("idle"); }}
            className="rounded-full bg-brand px-5 py-2 font-semibold text-white"
          >
            Kirim lagi
          </button>
        </div>
      </div>
    );
  }

  const namaProvinsi = provinsi.find((p) => p.slug === d.provinsi)?.nama;

  return (
    <div className="grid gap-8 py-10 lg:grid-cols-[220px_1fr_260px]">
      <ol className="flex gap-2 overflow-x-auto text-sm lg:block lg:space-y-2">
        {LANGKAH.map((l, i) => (
          <li key={l} className="shrink-0">
            <button
              type="button"
              onClick={() => (i === 0 || !infoDasarValid() ? setStep(i) : setError(infoDasarValid()))}
              className={`w-full rounded-sm px-3 py-2 text-left ${i === step ? "bg-brand font-semibold text-white" : "text-ink-2 hover:bg-subtle"}`}
            >
              {i + 1}. {l}
            </button>
          </li>
        ))}
      </ol>

      <form onSubmit={(e) => { e.preventDefault(); if (step === LANGKAH.length - 1) kirimKiriman(); else lanjut(); }} className="space-y-5">
        <h1 className="font-display text-3xl font-semibold">{LANGKAH[step]}</h1>

        {step === 0 && (
          <>
            <Field label="Nama jajanan *">
              <input value={d.nama} onChange={(e) => ubah({ nama: e.target.value })} maxLength={80} className={input} placeholder="mis. Kue Rangi" />
            </Field>
            {d.nama.trim().length >= 3 && mirip.length > 0 && (
              <div className="rounded-lg bg-subtle p-3 text-sm">
                <p className="font-semibold">Mungkin sudah ada:</p>
                <ul className="mt-1 list-disc pl-5">
                  {mirip.map((m) => (
                    <li key={m.slug}>
                      <Link href={`/jajanan/${m.slug}`} target="_blank" className="text-brand underline">{m.nama}</Link> ({m.provinsi})
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-ink-2">Kalau jajanannya sama, cukup tambah lokasi atau resep di halamannya.</p>
              </div>
            )}
            <Field label="Nama lain (pisahkan dengan koma)">
              <input value={d.namaLain} onChange={(e) => ubah({ namaLain: e.target.value })} className={input} placeholder="mis. Sagu Rangi" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Provinsi asal *">
                <select value={d.provinsi} onChange={(e) => ubah({ provinsi: e.target.value })} className={input}>
                  <option value="">Pilih provinsi</option>
                  {provinsi.map((p) => <option key={p.slug} value={p.slug}>{p.nama}</option>)}
                </select>
              </Field>
              <Field label="Daerah (kota/kabupaten)">
                <input value={d.daerah} onChange={(e) => ubah({ daerah: e.target.value })} className={input} placeholder="mis. Bogor" />
              </Field>
            </div>
            <Field label="Kategori">
              <select value={d.kategori} onChange={(e) => ubah({ kategori: e.target.value })} className={input}>
                <option value="">Pilih kategori</option>
                {kategori.map((k) => <option key={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="Deskripsi singkat">
              <input value={d.deskripsi} onChange={(e) => ubah({ deskripsi: e.target.value })} maxLength={200} className={input} placeholder="Satu kalimat, mis. Bola ketan isi gula merah." />
            </Field>
            <div className="space-y-1.5">
              <span className="font-semibold">Foto utama *</span>
              <PhotoInput tempel value={d.cover} onChange={(cover) => ubah({ cover })} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Cerita / asal-usul">
              <textarea value={d.cerita} onChange={(e) => ubah({ cerita: e.target.value })} rows={8} className={input} placeholder="Dari mana asalnya, kapan biasa disajikan, kenangan tentang jajanan ini..." />
            </Field>
            <Field label="Sumber informasi">
              <input value={d.sumber} onChange={(e) => ubah({ sumber: e.target.value })} className={input} placeholder="mis. Cerita nenek, penjual di Pasar Senen" />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Nama versi resep">
              <input value={d.resep.judulVersi} onChange={(e) => ubahResep({ judulVersi: e.target.value })} className={input} placeholder="mis. Versi Mbah Sri" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Porsi">
                <input type="number" min={1} value={d.resep.porsi} onChange={(e) => ubahResep({ porsi: e.target.value })} className={input} />
              </Field>
              <Field label="Waktu">
                <select value={d.resep.waktuMenit} onChange={(e) => ubahResep({ waktuMenit: e.target.value })} className={input}>
                  <option value="">-</option>
                  {WAKTU.map((w) => <option key={w.menit} value={w.menit}>{w.label}</option>)}
                </select>
              </Field>
              <Field label="Kesulitan">
                <select value={d.resep.kesulitan} onChange={(e) => ubahResep({ kesulitan: e.target.value })} className={input}>
                  <option value="">-</option>
                  <option value="mudah">Mudah</option>
                  <option value="sedang">Sedang</option>
                  <option value="sulit">Sulit</option>
                </select>
              </Field>
            </div>
            <Field label="Bahan (satu per baris)">
              <textarea value={d.resep.bahan} onChange={(e) => ubahResep({ bahan: e.target.value })} rows={6} className={input} placeholder={"250 g tepung beras\n150 g gula merah"} />
            </Field>
            <Field label="Link video resep (YouTube/TikTok/IG)">
              <input type="url" value={d.resep.videoUrl} onChange={(e) => ubahResep({ videoUrl: e.target.value })} className={input} placeholder="https://..." />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm text-ink-2">Resep baru tersimpan jika minimal satu langkah diisi. Foto dan video per langkah boleh dikosongkan.</p>
            <ol className="space-y-4">
              {d.langkah.map((l, i) => (
                <li key={i} className="space-y-3 rounded-lg border border-line bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Langkah {i + 1}</span>
                    {d.langkah.length > 1 && (
                      <button type="button" aria-label={`Hapus langkah ${i + 1}`} onClick={() => ubah({ langkah: d.langkah.filter((_, j) => j !== i) })} className="text-danger">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <textarea value={l.instruksi} onChange={(e) => ubahLangkah(i, { instruksi: e.target.value })} rows={3} className={input} placeholder="Tulis langkahnya..." aria-label={`Instruksi langkah ${i + 1}`} />
                  <div className="grid gap-3 sm:grid-cols-[192px_1fr]">
                    <PhotoInput kecil label="Foto langkah" value={l.foto} onChange={(foto) => ubahLangkah(i, { foto })} />
                    <input type="url" value={l.videoUrl} onChange={(e) => ubahLangkah(i, { videoUrl: e.target.value })} className={`${input} h-fit`} placeholder="Link video langkah (opsional)" aria-label={`Video langkah ${i + 1}`} />
                  </div>
                </li>
              ))}
            </ol>
            <button type="button" onClick={() => ubah({ langkah: [...d.langkah, { instruksi: "", videoUrl: "" }] })} className="flex items-center gap-1 rounded-full border border-line px-4 py-2 text-sm hover:border-brand">
              <Plus size={16} /> Tambah langkah
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <p className="text-sm text-ink-2">Cukup tempat usaha atau area umum, bukan rumah pribadi.</p>
            <Field label="Nama tempat">
              <input value={d.lokasi.tempat} onChange={(e) => ubahLokasi({ tempat: e.target.value })} className={input} placeholder="mis. Pasar Senen, lapak depan pintu 2" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Area">
                <input value={d.lokasi.area} onChange={(e) => ubahLokasi({ area: e.target.value })} className={input} placeholder="mis. Senen, Jakarta Pusat" />
              </Field>
              <Field label="Jenis">
                <select value={d.lokasi.jenis} onChange={(e) => ubahLokasi({ jenis: e.target.value })} className={input}>
                  <option value="kios_tetap">Kios tetap</option>
                  <option value="keliling">Keliling</option>
                  <option value="musiman">Musiman</option>
                </select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Link Google Maps">
                <input type="url" value={d.lokasi.mapsUrl} onChange={(e) => ubahLokasi({ mapsUrl: e.target.value })} className={input} placeholder="https://maps.app.goo.gl/..." />
              </Field>
              <Field label="Terakhir terlihat">
                <input type="date" value={d.lokasi.tanggal} onChange={(e) => ubahLokasi({ tanggal: e.target.value })} className={input} />
              </Field>
            </div>
            <Field label="Link pesan online (GoFood/GrabFood/WA usaha)">
              <input type="url" value={d.lokasi.orderUrl} onChange={(e) => ubahLokasi({ orderUrl: e.target.value })} className={input} placeholder="https://..." />
            </Field>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={d.lokasi.izinPublik} onChange={(e) => ubahLokasi({ izinPublik: e.target.checked })} className="mt-1" />
              Tempat ini usaha terbuka untuk umum dan boleh ditampilkan.
            </label>
          </>
        )}

        {step === 5 && (
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-3 text-ink-2">Menurutmu seberapa langka jajanan ini sekarang?</legend>
            {rarityPilihan.map(([v, l, ket]) => (
              <label key={v} className={`cursor-pointer rounded-lg border p-4 ${d.rarity === v ? "border-brand bg-subtle" : "border-line bg-surface"}`}>
                <input type="radio" name="rarity" value={v} checked={d.rarity === v} onChange={() => ubah({ rarity: v })} className="sr-only" />
                <span className="block font-semibold">{l}</span>
                <span className="text-sm text-ink-2">{ket}</span>
              </label>
            ))}
          </fieldset>
        )}

        {step === 6 && (
          <dl className="divide-y divide-line rounded-lg border border-line bg-surface text-sm">
            <Ringkas label="Nama">{d.nama || "-"}</Ringkas>
            <Ringkas label="Asal">{[d.daerah, namaProvinsi].filter(Boolean).join(", ") || "-"}</Ringkas>
            <Ringkas label="Kategori">{d.kategori || "-"}</Ringkas>
            <Ringkas label="Foto utama">{d.cover ? "Ada" : "Belum"}</Ringkas>
            <Ringkas label="Cerita">{d.cerita ? `${d.cerita.slice(0, 80)}${d.cerita.length > 80 ? "..." : ""}` : "Dilewati"}</Ringkas>
            <Ringkas label="Resep">
              {d.langkah.some((l) => l.instruksi.trim()) ? `${d.langkah.filter((l) => l.instruksi.trim()).length} langkah` : "Dilewati"}
            </Ringkas>
            <Ringkas label="Lokasi">{d.lokasi.tempat || "Dilewati"}</Ringkas>
            <Ringkas label="Kelangkaan">{rarityPilihan.find(([v]) => v === d.rarity)?.[1] ?? "Dilewati"}</Ringkas>
          </dl>
        )}

        {error && <p role="alert" className="text-sm text-danger">{error}</p>}

        <div className="flex flex-wrap gap-3">
          {step > 0 && (
            <button type="button" onClick={() => { setError(undefined); setStep(step - 1); }} className="rounded-full border border-line px-6 py-2">
              Kembali
            </button>
          )}
          <button disabled={kirim === "mengirim"} className="rounded-full bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-hover disabled:opacity-60">
            {step === LANGKAH.length - 1 ? (kirim === "mengirim" ? "Mengirim..." : "Kirim") : step === 0 ? "Lanjut" : "Lanjut / lewati"}
          </button>
        </div>
      </form>

      <aside className="h-fit space-y-2 rounded-lg bg-subtle p-4 text-sm text-ink-2">
        <p className="font-semibold text-ink">Tips</p>
        <p>Isian tersimpan otomatis di perangkat ini, jadi aman kalau ditinggal.</p>
        <p>Foto otomatis dikecilkan sebelum dikirim, jadi hemat kuota.</p>
        <p>Pakai foto milik sendiri. Lokasi cukup tempat usaha, bukan rumah pribadi.</p>
        <p>Kiriman dicek admin dulu sebelum tampil di katalog.</p>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="font-semibold">{label}</span>
      {children}
    </label>
  );
}

function Ringkas({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 p-3">
      <dt className="w-28 shrink-0 text-ink-2">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
