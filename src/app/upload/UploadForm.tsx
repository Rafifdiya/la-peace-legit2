"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, CircleCheck, Loader2, Plus, Send, Trash2 } from "lucide-react";
import { KepalaHalaman } from "@/components/KepalaHalaman";
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

// 3 langkah pertama wajib, 3 terakhir opsional
const LANGKAH = ["Info dasar", "Cerita", "Vote kelangkaan", "Resep", "Langkah pembuatan", "Lokasi penjual"];
const DRAFT_KEY = "jejak-jajan:draft-upload";
const input = "w-full rounded-sm border border-line bg-surface px-3 py-2";

const rarityPilihan = [
  ["umum", "Umum", "Masih mudah ditemukan"],
  ["mulai_langka", "Jarang", "Perlu dicari dulu"],
  ["hampir_punah", "Langka", "Sangat jarang ada yang jual"],
  ["punah", "Kritis", "Sudah tidak pernah terlihat"],
] as const;

/** Warna kotak saat dipilih: hijau -> kuning -> oranye -> merah */
const warnaKelangkaan: Record<string, { bg: string; teks: string }> = {
  umum: { bg: "#2ECC71", teks: "#ffffff" },
  mulai_langka: { bg: "#F1C40F", teks: "#3b2a00" },
  hampir_punah: { bg: "#E67E22", teks: "#ffffff" },
  punah: { bg: "#E74C3C", teks: "#ffffff" },
};

type Props = { provinsi: { nama: string; slug: string }[] };

export function UploadForm({ provinsi }: Props) {
  const [masuk, setMasuk] = useState<boolean | null>(null);
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(kosong);
  const [mirip, setMirip] = useState<SnackCardData[]>([]);
  const [error, setError] = useState<string>();
  const [kirim, setKirim] = useState<"idle" | "mengirim" | "terkirim">("idle");

  const konfirmasi = useRef<HTMLDialogElement>(null);
  const [memuat, setMemuat] = useState(true);

  // Setiap membuka Kontribusi: animasi loading singkat lalu form baru yang kosong.
  // Efek tanpa dependensi ini jalan ulang setiap halaman tampil lagi (Next.js menyimpan halaman
  // yang ditinggalkan dalam keadaan tersembunyi, bukan dihapus).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sengaja: reset setiap halaman dibuka
    setMemuat(true);
    setD(kosong);
    setStep(0);
    setKirim("idle");
    setError(undefined);
    setMirip([]);
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    const t = setTimeout(() => setMemuat(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Cek status login (form hanya untuk user yang sudah masuk)
  useEffect(() => {
    const { data: sub } = createClient().auth.onAuthStateChange((_e, session) => setMasuk(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

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
    if (!d.cover) return "Unggah foto utama.";
    if (d.deskripsi.trim().length < 5) return "Isi deskripsi singkat.";
    return undefined;
  }

  // Syarat kirim: Info dasar, Cerita, dan Vote kelangkaan terisi (langkah lain boleh dilewati)
  const MIN_CERITA = 10;
  const kurang: { step: number; pesan: string }[] = [];
  const errInfo = infoDasarValid();
  if (errInfo) kurang.push({ step: 0, pesan: `Info dasar: ${errInfo}` });
  if (d.cerita.trim().length < MIN_CERITA) kurang.push({ step: 1, pesan: `Cerita: tulis minimal ${MIN_CERITA} karakter.` });
  if (!d.rarity) kurang.push({ step: 2, pesan: "Vote kelangkaan: pilih salah satu." });
  const bisaKirim = kurang.length === 0;
  const WAJIB = new Set([0, 1, 2]);

  // Bebas pindah langkah: isi dari mana saja
  function lanjut() {
    setError(undefined);
    setStep((s) => Math.min(s + 1, LANGKAH.length - 1));
  }

  async function kirimKiriman() {
    if (!bisaKirim) {
      setError(`Belum bisa dikirim. ${kurang.map((k) => k.pesan).join(" ")}`);
      setStep(kurang[0].step);
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
    konfirmasi.current?.close();
    setKirim("terkirim");
  }

  if (masuk === null || (masuk && memuat)) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-20 text-ink-2">
        <Loader2 size={40} className="putar-muat text-brand" aria-hidden />
        <p className="font-semibold">Menyiapkan form kontribusi...</p>
      </div>
    );
  }

  if (!masuk) {
    return (
      <div className="mx-auto max-w-md py-8">
        <KepalaHalaman className="space-y-4 text-center">
          <h1 className="font-display text-3xl font-semibold">Masuk untuk berkontribusi</h1>
          <p className="text-ink-2">Kirim jajanan, resep, dan lokasi terakhir terlihat. Kiriman dicek admin dulu sebelum tampil.</p>
          <LoginButton className="rounded-full bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-hover">Masuk</LoginButton>
        </KepalaHalaman>
      </div>
    );
  }

  if (kirim === "terkirim") {
    return (
      <div className="mx-auto max-w-md py-8">
        <KepalaHalaman className="space-y-4 text-center">
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
        </KepalaHalaman>
      </div>
    );
  }

  const namaProvinsi = provinsi.find((p) => p.slug === d.provinsi)?.nama;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 py-10 lg:grid-cols-[200px_1fr_230px]">
      <ol className="langkah-kontribusi flex gap-2 overflow-x-auto lg:block lg:space-y-2">
        {LANGKAH.map((l, i) => (
          <li key={l} className="shrink-0">
            {(i === 0 || i === 3) && (
              <p className={`mb-1.5 mt-2 hidden rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide lg:block ${i === 0 ? "bg-orange-500/15 text-brand" : "bg-line/70 font-bold text-ink-2/[0.56]"}`}>
                {i === 0 ? "Formulir wajib" : "Opsional"}
              </p>
            )}
            <button
              type="button"
              onClick={() => { setError(undefined); setStep(i); }}
              className={`flex w-full items-center gap-1.5 rounded-sm px-3 py-2 text-left ${i === step ? "bg-brand font-semibold text-white" : "font-medium text-ink hover:bg-subtle"}`}
            >
              <span>• {l}</span>
              {/* Langkah wajib: tanda centang bila sudah terisi, "wajib" bila belum */}
              {WAJIB.has(i) &&
                (kurang.some((k) => k.step === i) ? (
                  <span className={`ml-auto text-xs ${i === step ? "text-white/80" : "text-danger"}`}>wajib</span>
                ) : (
                  <Check size={15} strokeWidth={3} className={`ml-auto ${i === step ? "text-white" : "text-green-600"}`} aria-label="sudah terisi" />
                ))}
            </button>
          </li>
        ))}
      </ol>

      <form onSubmit={(e) => { e.preventDefault(); if (step < LANGKAH.length - 1) lanjut(); }} className="space-y-5">
        {/* Judul langkah: padding tipis supaya tidak ada ruang kosong besar di atas & bawahnya */}
        <KepalaHalaman className="py-3!">
          <h1 className="font-display text-3xl font-semibold">{LANGKAH[step]}</h1>
        </KepalaHalaman>

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
            <Field label="Nama lain (jika ada)">
              <input value={d.namaLain} onChange={(e) => ubah({ namaLain: e.target.value })} className={input} placeholder="mis. Kue Bugis, Lapek Bugih, Kue Mendut.." />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Provinsi asal (opsional)">
                <select value={d.provinsi} onChange={(e) => ubah({ provinsi: e.target.value })} className={input}>
                  <option value="">Pilih provinsi</option>
                  {provinsi.map((p) => <option key={p.slug} value={p.slug}>{p.nama}</option>)}
                </select>
              </Field>
              <Field label="Daerah (opsional)">
                <input value={d.daerah} onChange={(e) => ubah({ daerah: e.target.value })} className={input} placeholder="mis. Bogor" />
              </Field>
            </div>
            <Field label="Deskripsi singkat *">
              <input value={d.deskripsi} onChange={(e) => ubah({ deskripsi: e.target.value })} maxLength={200} className={input} placeholder="Satu kalimat, mis. Bola ketan isi gula merah." />
            </Field>
            <div className="space-y-1.5">
              <span className="font-semibold">Foto utama <span className="text-danger">*</span></span>
              <PhotoInput tempel value={d.cover} onChange={(cover) => ubah({ cover })} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Cerita / asal-usul *">
              <textarea value={d.cerita} onChange={(e) => ubah({ cerita: e.target.value })} rows={8} className={input} placeholder="Dari mana asalnya, kapan biasa disajikan, kenangan tentang jajanan ini..." />
            </Field>
            <Field label="Sumber informasi">
              <input value={d.sumber} onChange={(e) => ubah({ sumber: e.target.value })} className={input} placeholder="mis. Cerita nenek, penjual di Pasar Senen" />
            </Field>
          </>
        )}

        {step === 3 && (
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

        {step === 4 && (
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

        {step === 5 && (
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

        {step === 2 && (
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-3 text-ink-2">Menurutmu seberapa langka jajanan ini sekarang? <span className="font-semibold text-danger">*</span> <span className="text-sm">(klik lagi untuk membatalkan)</span></legend>
            {rarityPilihan.map(([v, l, ket]) => (
              <button
                type="button"
                key={v}
                aria-pressed={d.rarity === v}
                // Klik pilihan yang sama sekali lagi = batalkan pilihan
                onClick={() => ubah({ rarity: d.rarity === v ? "" : v })}
                style={d.rarity === v ? { backgroundColor: warnaKelangkaan[v].bg, borderColor: warnaKelangkaan[v].bg, color: warnaKelangkaan[v].teks } : undefined}
                className={`cursor-pointer rounded-lg border-2 p-4 text-left transition-colors ${d.rarity === v ? "shadow" : "border-line bg-surface hover:border-ink-2"}`}
              >
                <span className="block font-semibold">{l}</span>
                <span className={`text-sm ${d.rarity === v ? "opacity-90" : "text-ink-2"}`}>{ket}</span>
              </button>
            ))}
          </fieldset>
        )}


        {error && <p role="alert" className="text-sm text-danger">{error}</p>}

        <div className="flex flex-wrap gap-3">
          {step > 0 && (
            <button type="button" onClick={() => { setError(undefined); setStep(step - 1); }} className="rounded-full border border-line px-6 py-2">
              Kembali
            </button>
          )}
          {step < LANGKAH.length - 1 && (
            <button className="rounded-full bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-hover">
              {WAJIB.has(step) ? "Lanjut" : "Lanjut / lewati"}
            </button>
          )}
          {/* Kirim bisa kapan saja: hijau terang bila syarat terpenuhi, gelap transparan bila belum */}
          <button
            type="button"
            onClick={() => {
              // Belum lengkap: tunjukkan yang kurang. Lengkap: tampilkan ringkasan untuk dikonfirmasi
              if (!bisaKirim) return kirimKiriman();
              setError(undefined);
              konfirmasi.current?.showModal();
            }}
            disabled={kirim === "mengirim"}
            aria-disabled={!bisaKirim}
            title={bisaKirim ? "Kirim kontribusi" : "Isi Info dasar, Cerita, dan Vote kelangkaan dulu"}
            className={`flex items-center gap-1.5 rounded-full px-6 py-2 font-semibold transition-colors disabled:opacity-60 ${
              bisaKirim ? "bg-green-500 text-white shadow hover:bg-green-600" : "cursor-not-allowed bg-ink/15 text-ink/50"
            }`}
          >
            <Send size={16} aria-hidden /> {kirim === "mengirim" ? "Mengirim..." : "Kirim"}
          </button>
        </div>
        <p className="text-sm font-bold italic text-danger">* Kolom bertanda bintang wajib diisi sebelum mengirim.</p>
        {!bisaKirim && (
          <p className="text-sm text-ink-2">
            Wajib diisi sebelum kirim: <b className="text-ink">{kurang.map((k) => LANGKAH[k.step]).join(", ")}</b>. Langkah lain boleh diisi kapan saja atau dilewati.
          </p>
        )}
        <dialog
          ref={konfirmasi}
          aria-labelledby="judul-konfirmasi"
          onClick={(e) => e.target === e.currentTarget && kirim !== "mengirim" && konfirmasi.current?.close()}
          className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-6 text-ink backdrop:bg-black/40"
        >
          <div className="space-y-4">
            <div>
              <h2 id="judul-konfirmasi" className="font-display text-2xl font-semibold">Kirim kontribusi?</h2>
              <p className="text-sm text-ink-2">Periksa ringkasan di bawah. Setelah dikirim, admin akan mengecek dulu sebelum tampil di katalog.</p>
            </div>
            <dl className="divide-y divide-line rounded-lg border border-line bg-surface text-sm">
            <Ringkas label="Nama">{d.nama || "-"}</Ringkas>
            <Ringkas label="Asal">{[d.daerah, namaProvinsi].filter(Boolean).join(", ") || "-"}</Ringkas>
            <Ringkas label="Foto utama">{d.cover ? "Ada" : "Belum"}</Ringkas>
            <Ringkas label="Cerita">{d.cerita ? `${d.cerita.slice(0, 80)}${d.cerita.length > 80 ? "..." : ""}` : "Dilewati"}</Ringkas>
            <Ringkas label="Resep">
              {d.langkah.some((l) => l.instruksi.trim()) ? `${d.langkah.filter((l) => l.instruksi.trim()).length} langkah` : "Dilewati"}
            </Ringkas>
            <Ringkas label="Lokasi">{d.lokasi.tempat || "Dilewati"}</Ringkas>
            <Ringkas label="Kelangkaan">{rarityPilihan.find(([v]) => v === d.rarity)?.[1] ?? "Dilewati"}</Ringkas>
          </dl>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => konfirmasi.current?.close()} disabled={kirim === "mengirim"} className="flex-1 rounded-full border border-line py-2.5 hover:border-brand disabled:opacity-60">
                Periksa lagi
              </button>
              <button type="button" onClick={kirimKiriman} disabled={kirim === "mengirim"} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-green-500 py-2.5 font-semibold text-white hover:bg-green-600 disabled:opacity-60">
                <Send size={16} aria-hidden /> {kirim === "mengirim" ? "Mengirim..." : "Ya, kirim"}
              </button>
            </div>
          </div>
        </dialog>
      </form>

      <aside className="h-fit space-y-2 rounded-lg bg-subtle p-4 text-sm text-ink-2">
        <p className="font-semibold text-ink">Tips</p>
        <p>Setiap membuka Kontribusi, form dimulai dari awal. Selesaikan dan kirim dalam satu kali buka.</p>
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
      <span className="font-semibold">
        {/* Penanda "(opsional)" / "(jika ada)": tebal tapi lebih pudar dari label */}
        {label.endsWith(" *") ? (
          <>
            {label.slice(0, -2)} <span className="text-danger">*</span>
          </>
        ) : /\((opsional|jika ada)\)$/.test(label) ? (
          <>
            {label.replace(/ \((opsional|jika ada)\)$/, "")} <span className="font-bold opacity-[0.56]">{label.match(/\((opsional|jika ada)\)$/)?.[0]}</span>
          </>
        ) : (
          label
        )}
      </span>
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
