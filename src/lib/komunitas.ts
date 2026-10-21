// Data komunitas dari Supabase: Forum Jajanan, profil, laporan.
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./supabase/public";
import { createClient } from "./supabase/server";

function cek<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(`Supabase: ${res.error.message}`);
  return res.data as T;
}

/** Nama yang ditampilkan: @username kalau ada, kalau belum pakai nama tampil. */
function namaUser(p: { username: string | null; nama_tampil: string | null } | null) {
  return p?.username ?? p?.nama_tampil ?? "anonim";
}

// ---------- Forum Jajanan (tabel requests) ----------

export type Balasan = {
  id: string;
  userId: string | null;
  oleh: string;
  olehUsername: string | null;
  isi: string;
  slug?: string;
  tanggal: string;
};

export type RequestItem = {
  id: string;
  judul: string;
  isi: string;
  daerah: string;
  topik: string;
  terjawab: boolean;
  jawabanTerbaik: string | null;
  pemilikId: string | null;
  oleh: string;
  olehUsername: string | null;
  tanggal: string;
  jawaban: Balasan[];
};

type Profil = { username: string | null; nama_tampil: string | null } | null;

type RequestRow = {
  id: string;
  judul: string;
  deskripsi: string | null;
  created_at: string;
  created_by: string | null;
  status: string;
  topik?: string;
  jawaban_terbaik?: string | null;
  provinces: { nama: string } | null;
  profiles: Profil;
  request_answers: { id: string; user_id: string | null; isi: string; created_at: string; profiles: Profil; snacks: { slug: string } | null }[];
};

const KOLOM_DASAR = `id, judul, deskripsi, created_at, created_by, status, provinces (nama),
  profiles!requests_created_by_fkey (username, nama_tampil),
  request_answers!request_answers_request_id_fkey (id, user_id, isi, created_at, profiles!request_answers_user_id_fkey (username, nama_tampil), snacks (slug))`;
// Kolom dari migration 0017; tanpa itu forum tetap jalan dengan topik "obrolan"
const KOLOM_FORUM = `${KOLOM_DASAR}, topik, jawaban_terbaik`;

function toRequest(r: RequestRow): RequestItem {
  return {
    id: r.id,
    judul: r.judul,
    isi: r.deskripsi ?? "",
    daerah: r.provinces?.nama ?? "",
    topik: r.topik ?? "obrolan",
    terjawab: r.status === "answered",
    jawabanTerbaik: r.jawaban_terbaik ?? null,
    pemilikId: r.created_by,
    oleh: namaUser(r.profiles),
    olehUsername: r.profiles?.username ?? null,
    tanggal: r.created_at,
    jawaban: [...r.request_answers]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((j) => ({
        id: j.id,
        userId: j.user_id,
        oleh: namaUser(j.profiles),
        olehUsername: j.profiles?.username ?? null,
        isi: j.isi,
        slug: j.snacks?.slug,
        tanggal: j.created_at,
      })),
  };
}

/** Jalankan query dengan kolom forum; bila kolomnya belum ada (0017 belum dijalankan), ulangi tanpa itu. */
async function denganCadangan<T>(query: (kolom: string, cadangan: boolean) => PromiseLike<{ data: unknown; error: { message: string; code?: string } | null }>): Promise<T> {
  const res = await query(KOLOM_FORUM, false);
  if (res.error?.code === "42703") return cek<T>(await query(KOLOM_DASAR, true));
  return cek<T>(res);
}

/** tab "terbaru" = semua; "belum" = topik mencari yang belum terjawab. topik = filter opsional. */
export async function getRequests(tab: "terbaru" | "belum", topik?: string): Promise<RequestItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("request");
  const rows = await denganCadangan<RequestRow[]>((kolom, cadangan) => {
    let q = createPublicClient().from("requests").select(kolom).order("created_at", { ascending: false });
    if (tab === "belum") q = q.eq("status", "open");
    // Tanpa kolom topik (cadangan) semua postingan dianggap "obrolan"
    if (topik && !cadangan) q = q.eq("topik", topik);
    return q;
  });
  if (topik) rows.splice(0, rows.length, ...rows.filter((r) => (r.topik ?? "obrolan") === topik));
  const list = rows.map(toRequest);
  // "Belum terjawab" hanya untuk topik mencari (resep / penjual)
  return tab === "belum" ? list.filter((r) => r.topik === "cari-resep" || r.topik === "cari-penjual") : list;
}

export async function getRequest(id: string): Promise<RequestItem | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("request");
  // id bukan UUID -> pasti tidak ada (hindari error query)
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const row = await denganCadangan<RequestRow | null>((kolom) =>
    createPublicClient().from("requests").select(kolom).eq("id", id).maybeSingle(),
  );
  return row ? toRequest(row) : undefined;
}

export async function getRequestIds(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("request");
  const rows = cek<{ id: string }[]>(await createPublicClient().from("requests").select("id"));
  return rows.map((r) => r.id);
}

// ---------- Profil ----------

export type ProfilUser = {
  id: string;
  username: string | null;
  nama: string;
  daerah: string;
  bio: string;
  role: "user" | "admin";
  kontribusi: string[]; // slug jajanan yang sudah disetujui
  jumlahLokasi: number;
  premium: boolean; // tampilkan lencana Premium di avatar
  avatarUrl: string | null;
};

type ProfilRow = {
  id: string;
  username: string | null;
  nama_tampil: string | null;
  daerah: string | null;
  bio: string | null;
  role: "user" | "admin";
  avatar_url: string | null;
};

async function lengkapiProfil(p: ProfilRow): Promise<ProfilUser> {
  const supabase = createPublicClient();
  const [snacks, lokasi, premium] = await Promise.all([
    supabase.from("snacks").select("slug").eq("created_by", p.id).eq("status", "approved").order("created_at", { ascending: false }),
    supabase.from("sightings").select("id", { count: "exact", head: true }).eq("created_by", p.id).eq("status", "approved"),
    // Fungsi dari migration 0010; bila belum dijalankan, anggap bukan premium
    supabase.rpc("is_premium", { uid: p.id }),
  ]);
  return {
    id: p.id,
    username: p.username,
    nama: p.nama_tampil ?? p.username ?? "Pengguna",
    daerah: p.daerah ?? "",
    bio: p.bio ?? "",
    role: p.role,
    kontribusi: cek<{ slug: string }[]>(snacks).map((s) => s.slug),
    jumlahLokasi: lokasi.count ?? 0,
    premium: premium.data === true,
    avatarUrl: p.avatar_url,
  };
}

const PROFIL_KOLOM = "id, username, nama_tampil, daerah, bio, role, avatar_url";

/** Profil publik berdasarkan username. */
export async function getProfil(username: string): Promise<ProfilUser | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("profil", "jajanan");
  const p = cek<ProfilRow | null>(
    await createPublicClient().from("profiles").select(PROFIL_KOLOM).eq("username", username).maybeSingle(),
  );
  return p ? lengkapiProfil(p) : undefined;
}

export async function getUsernames(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("profil");
  const rows = cek<{ username: string }[]>(
    await createPublicClient().from("profiles").select("username").not("username", "is", null),
  );
  return rows.map((r) => r.username);
}

/** Profil user yang sedang login, plus daftar jajanan yang ia simpan. */
export async function getProfilSaya(userId: string): Promise<{ profil: ProfilUser; tersimpan: string[] }> {
  const supabase = await createClient();
  const [p, saves] = await Promise.all([
    supabase.from("profiles").select(PROFIL_KOLOM).eq("id", userId).single(),
    supabase.from("saves").select("snacks (slug)").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);
  const profil = await lengkapiProfil(cek<ProfilRow>(p));
  const tersimpan = cek<{ snacks: { slug: string } | null }[]>(saves)
    .map((s) => s.snacks?.slug)
    .filter((s): s is string => !!s);
  return { profil, tersimpan };
}

// ---------- Laporan (admin) ----------

export type Laporan = {
  id: string;
  target: string;
  targetType: string;
  targetId: string;
  /** Link ke konten yang dilaporkan (forum), bila bisa ditentukan */
  href?: string;
  alasan: string;
  oleh: string;
  tanggal: string;
};

const targetLabel: Record<string, string> = {
  snack: "Jajanan",
  recipe: "Resep",
  sighting: "Lokasi",
  comment: "Komentar",
  photo: "Foto",
  forum_post: "Postingan forum",
  forum_reply: "Balasan forum",
};

export async function getLaporan(): Promise<Laporan[]> {
  const supabase = await createClient();
  const rows = cek<
    { id: string; target_type: string; target_id: string; alasan: string; created_at: string; profiles: Profil }[]
  >(
    await supabase
      .from("reports")
      .select("id, target_type, target_id, alasan, created_at, profiles!reports_reported_by_fkey (username, nama_tampil)")
      .eq("status", "open")
      .order("created_at", { ascending: false }),
  );
  // Balasan forum: cari postingan induknya untuk link
  const idBalasan = rows.filter((r) => r.target_type === "forum_reply").map((r) => r.target_id);
  const induk = new Map<string, string>();
  if (idBalasan.length) {
    const { data } = await supabase.from("request_answers").select("id, request_id").in("id", idBalasan);
    for (const b of data ?? []) induk.set(b.id, b.request_id);
  }
  return rows.map((r) => {
    const postId = r.target_type === "forum_post" ? r.target_id : induk.get(r.target_id);
    return {
      id: r.id,
      target: targetLabel[r.target_type] ?? r.target_type,
      targetType: r.target_type,
      targetId: r.target_id,
      href: postId ? `/request/${postId}` : undefined,
      alasan: r.alasan,
      oleh: namaUser(r.profiles),
      tanggal: r.created_at,
    };
  });
}

// ---------- Minat kelas (admin) ----------

/** Jumlah pendaftar minat kelas. RLS: hanya admin yang bisa membaca (selain admin = 0). */
export async function getJumlahMinatKelas(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from("minat_kelas").select("id", { count: "exact", head: true });
  return count ?? 0;
}

// ---------- Koleksi (profil sendiri) ----------

export type KoleksiSaya = { id: string; nama: string; slugs: string[] };

/** Koleksi milik user login beserta slug jajanan di dalamnya. Kosong bila migration 0010 belum ada. */
export async function getKoleksiSaya(): Promise<KoleksiSaya[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, nama, collection_items (created_at, snacks (slug))")
    .order("created_at");
  if (error || !data) return [];
  type Row = { id: string; nama: string; collection_items: { created_at: string; snacks: { slug: string } | null }[] };
  return (data as unknown as Row[]).map((k) => ({
    id: k.id,
    nama: k.nama,
    slugs: [...k.collection_items]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((i) => i.snacks?.slug)
      .filter((s): s is string => !!s),
  }));
}
