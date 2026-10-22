// Lapisan akses data jajanan publik (katalog & detail) dari Supabase.
// Request, profil, laporan: lihat komunitas.ts. Kiriman & sesi: kiriman.ts.
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./supabase/public";
import type { Page, Rarity, Recipe, Sighting, Snack, SnackCardData } from "./types";

export const PAGE_SIZE = 9;

export type SnackFilter = {
  q?: string;
  provinsi?: string;
  kategori?: string;
  urut?: "terbaru" | "terlama" | "az" | "langka";
};

// Kolom ringkas dari view snack_cards (lihat migration 0003)
const CARD_COLUMNS =
  "slug, nama, provinsi, kategori, deskripsi_singkat, cover_url, rarity, jumlah_vote, punya_resep, punya_video, punya_lokasi";

type CardRow = {
  slug: string;
  nama: string;
  provinsi: string | null;
  kategori: string | null;
  deskripsi_singkat: string | null;
  cover_url: string | null;
  rarity: string | null;
  jumlah_vote: number;
  punya_resep: boolean;
  punya_video: boolean;
  punya_lokasi: boolean;
};

function toCard(r: CardRow): SnackCardData {
  return {
    slug: r.slug,
    nama: r.nama,
    provinsi: r.provinsi ?? "",
    kategori: r.kategori ?? "",
    deskripsi: r.deskripsi_singkat ?? "",
    cover: r.cover_url ?? undefined,
    rarity: (r.rarity as Rarity | null) ?? "unknown",
    jumlahVote: r.jumlah_vote,
    punyaResep: r.punya_resep,
    punyaVideo: r.punya_video,
    punyaLokasi: r.punya_lokasi,
  };
}

/** Lempar error supaya halaman error tampil, bukan katalog kosong yang menyesatkan. */
function cek<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(`Supabase: ${res.error.message}`);
  return res.data as T;
}

export async function getSnackPage(filter: SnackFilter, page = 1, size = PAGE_SIZE): Promise<Page<SnackCardData>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("jajanan");

  let query = createPublicClient().from("snack_cards").select(CARD_COLUMNS, { count: "exact" });
  // Buang karakter khusus PostgREST/LIKE supaya input user tidak merusak query
  const q = filter.q?.toLowerCase().replace(/[%_,()*\\]/g, " ").trim();
  if (q) query = query.ilike("cari", `%${q}%`);
  if (filter.provinsi) query = query.eq("provinsi_slug", filter.provinsi);
  if (filter.kategori) query = query.eq("kategori", filter.kategori);

  if (filter.urut === "az") query = query.order("nama");
  else if (filter.urut === "langka") query = query.order("rarity_rank", { ascending: false }).order("nama");
  else if (filter.urut === "terlama") query = query.order("created_at");
  else query = query.order("created_at", { ascending: false });

  const from = (page - 1) * size;
  const res = await query.range(from, from + size - 1);
  const rows = cek<CardRow[]>(res);
  const total = res.count ?? rows.length;
  return { items: rows.map(toCard), total, nextPage: from + size < total ? page + 1 : null };
}

type DetailRow = {
  slug: string;
  nama: string;
  nama_lain: string[];
  deskripsi_singkat: string | null;
  cerita: string | null;
  cover_url: string | null;
  created_at: string;
  provinces: { nama: string; slug: string } | null;
  categories: { nama: string } | null;
  recipes: {
    judul_versi: string;
    bahan: string[];
    porsi: number | null;
    waktu_menit: number | null;
    kesulitan: Recipe["kesulitan"] | null;
    video_url: string | null;
    verified: boolean;
    created_at: string;
    recipe_steps: { urutan: number; instruksi: string }[];
  }[];
  sightings: {
    id: string;
    nama_tempat: string;
    area: string;
    jenis: Sighting["jenis"];
    maps_url: string | null;
    lat: number | null;
    lng: number | null;
    tanggal_terlihat: string | null;
    last_confirmed_at: string | null;
    order_url: string | null;
    created_at: string;
  }[];
};

export async function getSnack(slug: string): Promise<Snack | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("jajanan", `jajanan-${slug}`);

  const supabase = createPublicClient();
  const [detail, label] = await Promise.all([
    supabase
      .from("snacks")
      .select(
        `slug, nama, nama_lain, deskripsi_singkat, cerita, cover_url, created_at,
         provinces (nama, slug), categories (nama),
         recipes (judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, verified, created_at, recipe_steps (urutan, instruksi)),
         sightings (id, nama_tempat, area, jenis, maps_url, lat, lng, tanggal_terlihat, last_confirmed_at, order_url, created_at)`,
      )
      .eq("slug", slug)
      .eq("status", "approved")
      .eq("recipes.status", "approved")
      .eq("sightings.status", "approved")
      .maybeSingle(),
    supabase.from("snack_cards").select("rarity, jumlah_vote").eq("slug", slug).maybeSingle(),
  ]);

  const s = cek<DetailRow | null>(detail);
  if (!s) return undefined;
  const l = cek<{ rarity: string | null; jumlah_vote: number } | null>(label);

  // Resep terverifikasi dulu, lalu versi paling awal
  const r = [...s.recipes].sort(
    (a, b) => Number(b.verified) - Number(a.verified) || a.created_at.localeCompare(b.created_at),
  )[0];

  return {
    slug: s.slug,
    nama: s.nama,
    namaLain: s.nama_lain,
    provinsi: s.provinces?.nama ?? "",
    provinsiSlug: s.provinces?.slug ?? "",
    kategori: s.categories?.nama ?? "",
    deskripsi: s.deskripsi_singkat ?? "",
    cerita: s.cerita ?? "",
    cover: s.cover_url ?? undefined,
    rarity: (l?.rarity as Rarity | null) ?? "unknown",
    jumlahVote: l?.jumlah_vote ?? 0,
    resep: r && {
      judulVersi: r.judul_versi,
      porsi: r.porsi ?? 0,
      waktuMenit: r.waktu_menit ?? 0,
      kesulitan: r.kesulitan ?? "sedang",
      bahan: r.bahan,
      langkah: [...r.recipe_steps].sort((a, b) => a.urutan - b.urutan).map((x) => x.instruksi),
      verified: r.verified,
      videoUrl: r.video_url ?? undefined,
    },
    sightings: s.sightings.map((g) => ({
      id: g.id,
      tempat: g.nama_tempat,
      area: g.area,
      jenis: g.jenis,
      terakhirDikonfirmasi: (g.last_confirmed_at ?? g.tanggal_terlihat ?? g.created_at).slice(0, 10),
      lat: g.lat ?? undefined,
      lng: g.lng ?? undefined,
      mapsUrl: g.maps_url ?? undefined,
      orderUrl: g.order_url ?? undefined,
    })),
    createdAt: s.created_at.slice(0, 10),
  };
}

export async function getAllSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("jajanan");
  const rows = cek<{ slug: string }[]>(await createPublicClient().from("snack_cards").select("slug"));
  return rows.map((r) => r.slug);
}

export async function getProvinces(): Promise<{ nama: string; slug: string }[]> {
  "use cache";
  cacheLife("days");
  return cek(await createPublicClient().from("provinces").select("nama, slug").order("nama"));
}

export async function getCategories(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  const rows = cek<{ nama: string }[]>(await createPublicClient().from("categories").select("nama").order("nama"));
  return rows.map((r) => r.nama);
}

export async function getStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("jajanan");

  const supabase = createPublicClient();
  const [kartu, kontributor, lokasi] = await Promise.all([
    supabase.from("snack_cards").select("provinsi"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("sightings").select("id", { count: "exact", head: true }),
  ]);
  const rows = cek<{ provinsi: string | null }[]>(kartu);
  return {
    jajanan: rows.length,
    provinsi: new Set(rows.map((r) => r.provinsi).filter(Boolean)).size,
    kontributor: kontributor.count ?? 0,
    lokasi: lokasi.count ?? 0,
  };
}

export async function getRelated(snack: Snack, limit = 3): Promise<SnackCardData[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("jajanan");
  const rows = cek<CardRow[]>(
    await createPublicClient()
      .from("snack_cards")
      .select(CARD_COLUMNS)
      .eq("provinsi_slug", snack.provinsiSlug)
      .neq("slug", snack.slug)
      .limit(limit),
  );
  return rows.map(toCard);
}

export async function getCards(slugs: string[]): Promise<SnackCardData[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("jajanan");
  if (slugs.length === 0) return [];
  const rows = cek<CardRow[]>(await createPublicClient().from("snack_cards").select(CARD_COLUMNS).in("slug", slugs));
  // Jaga urutan sesuai input
  return slugs.map((s) => rows.find((r) => r.slug === s)).filter((r): r is CardRow => !!r).map(toCard);
}

/**
 * Beranda "Langka & Kritis": jajanan yang oleh PENGIRIMNYA sendiri divote Langka (hampir_punah)
 * atau Kritis (punah) saat mengisi form kontribusi. Terbaru di depan.
 */
export async function getLangkaKritis(limit: number): Promise<SnackCardData[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("jajanan");
  const { data, error } = await createPublicClient()
    .from("rarity_votes")
    .select("user_id, snacks!inner (slug, created_by, created_at, status)")
    .in("nilai", ["hampir_punah", "punah"])
    .eq("snacks.status", "approved");
  if (error || !data) return [];
  type Row = { user_id: string; snacks: { slug: string; created_by: string | null; created_at: string } };
  const slugs = (data as unknown as Row[])
    .filter((r) => r.user_id === r.snacks.created_by)
    .sort((a, b) => b.snacks.created_at.localeCompare(a.snacks.created_at))
    .map((r) => r.snacks.slug);
  return getCards([...new Set(slugs)].slice(0, limit));
}
