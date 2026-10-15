// Iklan sponsor di sidebar. Dikelola admin di /admin?tab=iklan.
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./supabase/public";
import { createClient } from "./supabase/server";

export type Iklan = {
  id: string;
  judul: string;
  linkUrl: string | null;
  mediaUrl: string;
  jenis: "foto" | "video";
  aktif: boolean;
  tanggal: string;
};

type Row = { id: string; judul: string; link_url: string | null; media_url: string; jenis: Iklan["jenis"]; aktif: boolean; created_at: string };

const KOLOM = "id, judul, link_url, media_url, jenis, aktif, created_at";

function toIklan(r: Row): Iklan {
  return { id: r.id, judul: r.judul, linkUrl: r.link_url, mediaUrl: r.media_url, jenis: r.jenis, aktif: r.aktif, tanggal: r.created_at };
}

/** Maksimal iklan aktif sekaligus (bergantian di slot sidebar tiap 6 detik). */
export const MAKS_IKLAN_AKTIF = 6;

/** Iklan aktif terbaru untuk sidebar (publik, di-cache). Kosong = tampilkan placeholder. */
export async function getIklanAktif(): Promise<Iklan[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("iklan");
  const { data, error } = await createPublicClient()
    .from("iklan")
    .select(KOLOM)
    .eq("aktif", true)
    .order("created_at", { ascending: false })
    .limit(MAKS_IKLAN_AKTIF);
  // Tabel belum dibuat / error: jangan rusak seluruh halaman, cukup placeholder
  if (error || !data) return [];
  return (data as Row[]).map(toIklan);
}

/** Semua iklan untuk admin (RLS: non-admin hanya dapat yang aktif). */
export async function getIklanAdmin(): Promise<Iklan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("iklan").select(KOLOM).order("created_at", { ascending: false });
  if (error) return [];
  return (data as Row[]).map(toIklan);
}
