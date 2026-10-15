// Data kiriman jajanan per user (butuh sesi login, jadi tidak di-cache).
import { createClient } from "./supabase/server";
import { adaKataKasar } from "./kata-kasar";

export type Kiriman = {
  id: string;
  slug: string;
  nama: string;
  status: "pending" | "approved" | "rejected" | "hidden";
  alasanTolak: string | null;
  tanggal: string;
  oleh: string;
  provinsi: string;
  deskripsi: string;
  cerita: string;
  cover: string | null;
  jumlahLangkah: number;
  adaLokasi: boolean;
  ditandaiKataKasar: boolean;
};

type Row = {
  id: string;
  slug: string;
  nama: string;
  status: Kiriman["status"];
  alasan_tolak: string | null;
  created_at: string;
  deskripsi_singkat: string | null;
  cerita: string | null;
  cover_url: string | null;
  profiles: { username: string | null; nama_tampil: string | null } | null;
  provinces: { nama: string } | null;
  recipes: { recipe_steps: { instruksi: string }[] }[];
  sightings: { nama_tempat: string }[];
};

const KOLOM = `id, slug, nama, status, alasan_tolak, created_at, deskripsi_singkat, cerita, cover_url,
  profiles!snacks_created_by_fkey (username, nama_tampil), provinces (nama),
  recipes (recipe_steps (instruksi)), sightings (nama_tempat)`;

function toKiriman(r: Row): Kiriman {
  const langkah = r.recipes.flatMap((x) => x.recipe_steps.map((s) => s.instruksi));
  return {
    id: r.id,
    slug: r.slug,
    nama: r.nama,
    status: r.status,
    alasanTolak: r.alasan_tolak,
    tanggal: r.created_at,
    oleh: r.profiles?.username ?? r.profiles?.nama_tampil ?? "anonim",
    provinsi: r.provinces?.nama ?? "",
    deskripsi: r.deskripsi_singkat ?? "",
    cerita: r.cerita ?? "",
    cover: r.cover_url,
    jumlahLangkah: langkah.length,
    adaLokasi: r.sightings.length > 0,
    ditandaiKataKasar: adaKataKasar(r.nama, r.deskripsi_singkat, r.cerita, ...langkah),
  };
}

export async function getSesi() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { user: null, admin: false, premium: false, premiumSampai: null };
  let { data: p } = await supabase
    .from("profiles")
    .select("role, premium_sampai")
    .eq("id", data.user.id)
    .single<{ role: string; premium_sampai: string | null }>();
  // Cadangan bila migration 0010 belum dijalankan (kolom premium belum ada)
  if (!p) {
    const r = await supabase.from("profiles").select("role").eq("id", data.user.id).single<{ role: string }>();
    p = r.data && { ...r.data, premium_sampai: null };
  }
  // premium_sampai > sekarang = premium aktif (lihat migration 0010, mode demo)
  const sampai = p?.premium_sampai ?? null;
  const admin = p?.role === "admin";
  const premiumSampai = sampai && new Date(sampai) > new Date() ? sampai : null;
  // Admin otomatis Premium (migration 0012)
  return { user: data.user, admin, premium: admin || !!premiumSampai, premiumSampai };
}

/** Admin: kiriman terbaru (pending dulu). RLS memastikan hanya admin yang melihat semua. */
export async function getKirimanAdmin(): Promise<Kiriman[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("snacks")
    .select(KOLOM)
    .not("created_by", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(`Supabase: ${error.message}`);
  const list = (data as unknown as Row[]).map(toKiriman);
  return [...list.filter((k) => k.status === "pending"), ...list.filter((k) => k.status !== "pending")];
}

/** Kiriman milik user yang sedang login (tab Status kiriman). */
export async function getKirimanSaya(userId: string): Promise<Kiriman[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("snacks")
    .select(KOLOM)
    .eq("created_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Supabase: ${error.message}`);
  return (data as unknown as Row[]).map(toKiriman);
}
