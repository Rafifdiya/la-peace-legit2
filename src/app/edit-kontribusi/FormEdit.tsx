"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { adaKataKasar } from "@/lib/kata-kasar";
import { segarkanJajanan } from "@/app/jajanan/actions";
import { LoginButton } from "@/components/LoginButton";

type Data = {
  nama: string;
  namaLain: string;
  deskripsi: string;
  cerita: string;
  daerah: string;
  sumber: string;
  status: string;
  resep?: { bahan: string; porsi: string; waktuMenit: string; kesulitan: string; videoUrl: string; langkah: string[] };
};

type Row = {
  nama: string;
  nama_lain: string[];
  deskripsi_singkat: string | null;
  cerita: string | null;
  daerah_detail: string | null;
  sumber_info: string | null;
  status: string;
  created_by: string;
  recipes: {
    bahan: string[];
    porsi: number | null;
    waktu_menit: number | null;
    kesulitan: string | null;
    video_url: string | null;
    created_by: string;
    created_at: string;
    recipe_steps: { urutan: number; instruksi: string }[];
  }[];
};

const input = "w-full rounded-sm border border-line bg-surface px-3 py-2";
const labelCls = "block space-y-1 text-sm font-semibold";

/** Form edit teks kontribusi milik sendiri (fungsi edit_jajanan, migration 0019). */
export function FormEdit() {
  const slug = useSearchParams().get("slug") ?? "";
  const router = useRouter();
  const [d, setD] = useState<Data | null>();
  const [masuk, setMasuk] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return setMasuk(false);
      const { data } = await supabase
        .from("snacks")
        .select(`nama, nama_lain, deskripsi_singkat, cerita, daerah_detail, sumber_info, status, created_by,
          recipes (bahan, porsi, waktu_menit, kesulitan, video_url, created_by, created_at, recipe_steps (urutan, instruksi))`)
        .eq("slug", slug)
        .maybeSingle()
        .returns<Row>();
      if (!data || data.created_by !== auth.user.id) return setD(null);
      const r = data.recipes.filter((x) => x.created_by === auth.user.id).sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
      setD({
        nama: data.nama,
        namaLain: data.nama_lain.join(", "),
        deskripsi: data.deskripsi_singkat ?? "",
        cerita: data.cerita ?? "",
        daerah: data.daerah_detail ?? "",
        sumber: data.sumber_info ?? "",
        status: data.status,
        resep: r && {
          bahan: r.bahan.join("\n"),
          porsi: r.porsi ? String(r.porsi) : "",
          waktuMenit: r.waktu_menit ? String(r.waktu_menit) : "",
          kesulitan: r.kesulitan ?? "",
          videoUrl: r.video_url ?? "",
          langkah: [...r.recipe_steps].sort((a, b) => a.urutan - b.urutan).map((s) => s.instruksi),
        },
      });
    })();
  }, [slug]);

  if (!masuk) {
    return <LoginButton className="rounded-full bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-hover">Masuk dulu</LoginButton>;
  }
  if (d === undefined) return <p className="text-ink-2">Memuat...</p>;
  if (d && d.status !== "approved") {
    return (
      <p className="text-ink-2">
        Kiriman ini belum disetujui admin. Edit baru bisa dilakukan setelah disetujui.{" "}
        <Link href="/profil/saya?tab=status" className="text-brand underline">Lihat status kiriman</Link>
      </p>
    );
  }
  if (d === null) {
    return (
      <p className="text-ink-2">
        Jajanan tidak ditemukan atau bukan kirimanmu. Kamu hanya bisa mengedit kiriman sendiri.{" "}
        <Link href="/profil/saya?tab=status" className="text-brand underline">Lihat kirimanku</Link>
      </p>
    );
  }

  const ubah = (k: keyof Data, v: string) => setD({ ...d, [k]: v });
  const ubahResep = (k: keyof NonNullable<Data["resep"]>, v: string | string[]) => d.resep && setD({ ...d, resep: { ...d.resep, [k]: v } });

  async function simpan() {
    if (!d) return;
    if (d.nama.trim().length < 2) return setError("Nama minimal 2 karakter.");
    if (adaKataKasar(d.nama, d.deskripsi, d.cerita, d.resep?.bahan ?? "", ...(d.resep?.langkah ?? []))) {
      return setError("Ada kata yang tidak pantas. Periksa lagi tulisanmu.");
    }
    setBusy(true);
    setError("");
    const data = {
      nama: d.nama,
      namaLain: d.namaLain.split(","),
      deskripsi: d.deskripsi,
      cerita: d.cerita,
      daerah: d.daerah,
      sumber: d.sumber,
      ...(d.resep && {
        resep: {
          ...d.resep,
          bahan: d.resep.bahan.split("\n").map((b) => b.trim()).filter(Boolean),
          langkah: d.resep.langkah.filter((l) => l.trim()),
        },
      }),
    };
    const { error: err } = await createClient().rpc("edit_jajanan", { p_slug: slug, data });
    setBusy(false);
    if (err) {
      return setError(/function|schema cache/i.test(err.message) ? "Fitur edit belum aktif (jalankan migration 0019 & 0020)." : `Gagal menyimpan: ${err.message}`);
    }
    await segarkanJajanan();
    router.push(`/jajanan/${slug}`);
  }

  return (
    <div className="space-y-5">
      <label className={labelCls}>Nama jajanan
        <input value={d.nama} onChange={(e) => ubah("nama", e.target.value)} maxLength={80} className={input} />
      </label>
      <label className={labelCls}>Nama lain (pisahkan dengan koma)
        <input value={d.namaLain} onChange={(e) => ubah("namaLain", e.target.value)} className={input} />
      </label>
      <label className={labelCls}>Daerah detail
        <input value={d.daerah} onChange={(e) => ubah("daerah", e.target.value)} className={input} />
      </label>
      <label className={labelCls}>Deskripsi singkat
        <input value={d.deskripsi} onChange={(e) => ubah("deskripsi", e.target.value)} maxLength={200} className={input} />
      </label>
      <label className={labelCls}>Cerita / asal-usul
        <textarea value={d.cerita} onChange={(e) => ubah("cerita", e.target.value)} rows={6} className={input} />
      </label>
      <label className={labelCls}>Sumber info
        <input value={d.sumber} onChange={(e) => ubah("sumber", e.target.value)} className={input} />
      </label>

      {d.resep && (
        <fieldset className="space-y-4 rounded-xl border border-line p-4">
          <legend className="px-1 font-display text-xl font-semibold">Resep</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={labelCls}>Porsi
              <input type="number" min={1} value={d.resep.porsi} onChange={(e) => ubahResep("porsi", e.target.value)} className={input} />
            </label>
            <label className={labelCls}>Waktu (menit)
              <input type="number" min={1} value={d.resep.waktuMenit} onChange={(e) => ubahResep("waktuMenit", e.target.value)} className={input} />
            </label>
            <label className={labelCls}>Kesulitan
              <select value={d.resep.kesulitan} onChange={(e) => ubahResep("kesulitan", e.target.value)} className={input}>
                <option value="">-</option>
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </label>
          </div>
          <label className={labelCls}>Bahan (satu per baris)
            <textarea value={d.resep.bahan} onChange={(e) => ubahResep("bahan", e.target.value)} rows={6} className={input} />
          </label>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Langkah</p>
            {d.resep.langkah.map((l, i) => (
              <div key={i} className="flex gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm text-white">{i + 1}</span>
                <textarea
                  value={l}
                  onChange={(e) => ubahResep("langkah", d.resep!.langkah.map((x, j) => (j === i ? e.target.value : x)))}
                  rows={2}
                  aria-label={`Langkah ${i + 1}`}
                  className={input}
                />
                <button type="button" onClick={() => ubahResep("langkah", d.resep!.langkah.filter((_, j) => j !== i))} aria-label={`Hapus langkah ${i + 1}`} className="self-start p-1 text-ink-2 hover:text-danger">
                  <X size={18} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => ubahResep("langkah", [...d.resep!.langkah, ""])} className="flex items-center gap-1 text-sm text-brand hover:underline">
              <Plus size={15} aria-hidden /> Tambah langkah
            </button>
          </div>
          <label className={labelCls}>Link video (opsional)
            <input value={d.resep.videoUrl} onChange={(e) => ubahResep("videoUrl", e.target.value)} className={input} />
          </label>
        </fieldset>
      )}

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={simpan} disabled={busy} className="rounded-full bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-hover disabled:opacity-60">
          {busy ? "Menyimpan..." : "Simpan perubahan"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-full border border-line px-6 py-2 hover:border-brand">Batal</button>
      </div>
    </div>
  );
}
