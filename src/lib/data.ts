// Lapisan akses data. Sekarang membaca data dummy; nanti cukup ganti isi fungsi
// ini dengan query Supabase (mis. .range(from, to) untuk pagination).
import { currentUsername, reports, requests, submissions, users } from "@/data/dummy";
import { snacks } from "@/data/snacks";
import type { Page, Snack, SnackCardData } from "./types";

export const PAGE_SIZE = 9;

export type SnackFilter = {
  q?: string;
  provinsi?: string;
  kategori?: string;
  urut?: "terbaru" | "az" | "langka";
};

const rarityRank = { punah: 4, hampir_punah: 3, mulai_langka: 2, umum: 1, unknown: 0 };

export function toCard(s: Snack): SnackCardData {
  return {
    slug: s.slug,
    nama: s.nama,
    provinsi: s.provinsi,
    kategori: s.kategori,
    deskripsi: s.deskripsi,
    cover: s.cover,
    rarity: s.rarity,
    jumlahVote: s.jumlahVote,
    punyaResep: !!s.resep,
    punyaVideo: !!s.resep?.videoUrl,
    punyaLokasi: s.sightings.length > 0,
  };
}

export async function getSnackPage(filter: SnackFilter, page = 1, size = PAGE_SIZE): Promise<Page<SnackCardData>> {
  const q = filter.q?.trim().toLowerCase();
  let list = snacks.filter(
    (s) =>
      (!q || s.nama.toLowerCase().includes(q) || s.namaLain.some((n) => n.toLowerCase().includes(q))) &&
      (!filter.provinsi || s.provinsiSlug === filter.provinsi) &&
      (!filter.kategori || s.kategori === filter.kategori),
  );

  if (filter.urut === "az") list = [...list].sort((a, b) => a.nama.localeCompare(b.nama));
  else if (filter.urut === "langka") list = [...list].sort((a, b) => rarityRank[b.rarity] - rarityRank[a.rarity]);
  else list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const from = (page - 1) * size;
  const items = list.slice(from, from + size).map(toCard);
  return { items, total: list.length, nextPage: from + size < list.length ? page + 1 : null };
}

export async function getSnack(slug: string): Promise<Snack | undefined> {
  return snacks.find((s) => s.slug === slug);
}

export async function getAllSlugs(): Promise<string[]> {
  return snacks.map((s) => s.slug);
}

export async function getProvinces(): Promise<{ nama: string; slug: string }[]> {
  const map = new Map(snacks.map((s) => [s.provinsiSlug, s.provinsi]));
  return [...map].map(([slug, nama]) => ({ slug, nama })).sort((a, b) => a.nama.localeCompare(b.nama));
}

export async function getCategories(): Promise<string[]> {
  return [...new Set(snacks.map((s) => s.kategori))].sort();
}

export async function getStats() {
  return {
    jajanan: snacks.length,
    provinsi: new Set(snacks.map((s) => s.provinsi)).size,
    kontributor: 12,
    lokasi: snacks.reduce((n, s) => n + s.sightings.length, 0),
  };
}

export async function getRelated(snack: Snack, limit = 3): Promise<SnackCardData[]> {
  return snacks.filter((s) => s.provinsi === snack.provinsi && s.slug !== snack.slug).slice(0, limit).map(toCard);
}

// ---------- Request, profil, admin (dummy) ----------

export async function getRequests(status: "terbuka" | "terjawab") {
  return requests
    .filter((r) => (status === "terjawab" ? r.jawaban.length > 0 : r.jawaban.length === 0))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

export async function getRequest(id: string) {
  return requests.find((r) => r.id === id);
}

export async function getUser(username: string) {
  return users.find((u) => u.username === username);
}

/** Template: user yang dianggap sedang login. Nanti dari Supabase Auth. */
export async function getCurrentUser() {
  return users.find((u) => u.username === currentUsername)!;
}

export async function getCards(slugs: string[]): Promise<SnackCardData[]> {
  return slugs.map((s) => snacks.find((x) => x.slug === s)).filter((s): s is Snack => !!s).map(toCard);
}

export async function getSubmissions(oleh?: string) {
  return submissions.filter((s) => !oleh || s.oleh === oleh);
}

export async function getReports() {
  return reports;
}

export async function getRequestIds() {
  return requests.map((r) => r.id);
}

export async function getUsernames() {
  return users.map((u) => u.username);
}
