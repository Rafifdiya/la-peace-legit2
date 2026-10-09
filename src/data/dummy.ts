// DATA DUMMY untuk request, profil, dan admin. Nanti diganti query Supabase.

export type User = {
  username: string;
  nama: string;
  daerah: string;
  bio: string;
  role: "user" | "admin";
  kontribusi: string[]; // slug jajanan
  tersimpan: string[];
  jumlahLokasi: number;
  resepDicoba: number;
};

export type RequestItem = {
  id: string;
  judul: string;
  isi: string;
  daerah: string;
  oleh: string; // username
  tanggal: string;
  jawaban: { oleh: string; isi: string; slug?: string; tanggal: string }[];
};

export type Submission = {
  id: string;
  judul: string;
  jenis: "Jajanan baru" | "Versi resep" | "Lokasi" | "Foto";
  oleh: string;
  tanggal: string;
  status: "pending" | "approved" | "rejected";
  alasan?: string;
  ditandaiKataKasar?: boolean;
};

export type Report = {
  id: string;
  target: string;
  alasan: string;
  oleh: string;
  tanggal: string;
};

export const users: User[] = [
  {
    username: "sari",
    nama: "Sari Wulandari",
    daerah: "Jakarta Timur",
    bio: "Suka berburu jajanan pasar tiap akhir pekan.",
    role: "user",
    kontribusi: ["kue-rangi", "kue-ape", "kue-cucur"],
    tersimpan: ["klepon", "barongko"],
    jumlahLokasi: 5,
    resepDicoba: 3,
  },
  {
    username: "budi",
    nama: "Budi Santoso",
    daerah: "Solo",
    bio: "Anak penjual klepon generasi kedua.",
    role: "user",
    kontribusi: ["klepon", "clorot"],
    tersimpan: [],
    jumlahLokasi: 2,
    resepDicoba: 1,
  },
  {
    username: "admin",
    nama: "Admin Jejak Jajan",
    daerah: "Jakarta",
    bio: "Moderator.",
    role: "admin",
    kontribusi: [],
    tersimpan: [],
    jumlahLokasi: 0,
    resepDicoba: 0,
  },
];

/** User yang dianggap sedang login di template (belum ada auth) */
export const currentUsername = "sari";

export const requests: RequestItem[] = [
  {
    id: "1",
    judul: "Ada yang tahu resep kue sengkulun?",
    isi: "Dulu nenek saya sering buat saat Imlek dan Lebaran Betawi, sekarang tidak pernah lihat lagi.",
    daerah: "DKI Jakarta",
    oleh: "sari",
    tanggal: "2026-10-05",
    jawaban: [],
  },
  {
    id: "2",
    judul: "Di mana masih ada yang jual kue putu bambu di Surabaya?",
    isi: "Yang pakai gerobak dan bunyi siulan.",
    daerah: "Jawa Timur",
    oleh: "budi",
    tanggal: "2026-10-01",
    jawaban: [
      { oleh: "sari", isi: "Pernah lihat di dekat Pasar Genteng sore hari, sudah saya tambahkan lokasinya.", slug: "kue-putu", tanggal: "2026-10-03" },
    ],
  },
  {
    id: "3",
    judul: "Resep wajik klethik yang tahan lama",
    isi: "Wajik saya cepat keras. Ada tips?",
    daerah: "Jawa Timur",
    oleh: "sari",
    tanggal: "2026-09-27",
    jawaban: [{ oleh: "budi", isi: "Sudah ada versi resepnya di halaman wajik klethik.", slug: "wajik-klethik", tanggal: "2026-09-29" }],
  },
  {
    id: "4",
    judul: "Kue jongkong di Batam masih ada?",
    isi: "Mau beli untuk oleh-oleh.",
    daerah: "Kepulauan Riau",
    oleh: "budi",
    tanggal: "2026-09-20",
    jawaban: [],
  },
];

export const submissions: Submission[] = [
  { id: "k1", judul: "Kue Rangi", jenis: "Jajanan baru", oleh: "sari", tanggal: "2026-10-08", status: "pending" },
  { id: "k2", judul: "Klepon - Versi Mbah Sri", jenis: "Versi resep", oleh: "budi", tanggal: "2026-10-07", status: "pending" },
  { id: "k3", judul: "Kue Ape - Pasar Rawamangun", jenis: "Lokasi", oleh: "sari", tanggal: "2026-10-06", status: "approved" },
  { id: "k4", judul: "Kue A*e", jenis: "Jajanan baru", oleh: "budi", tanggal: "2026-10-06", status: "pending", ditandaiKataKasar: true },
  { id: "k5", judul: "Foto Kue Cucur", jenis: "Foto", oleh: "sari", tanggal: "2026-10-02", status: "rejected", alasan: "Foto buram, mohon unggah ulang yang lebih jelas." },
];

export const reports: Report[] = [
  { id: "r1", target: "Komentar di Klepon", alasan: "Spam / promosi", oleh: "sari", tanggal: "2026-10-08" },
  { id: "r2", target: "Lokasi Gatot - Pasar Beringharjo", alasan: "Penjual sudah pindah", oleh: "budi", tanggal: "2026-10-07" },
];
