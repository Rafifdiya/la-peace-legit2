export type Rarity = "umum" | "mulai_langka" | "hampir_punah" | "punah" | "unknown";

export type Sighting = {
  id: string;
  tempat: string;
  area: string;
  jenis: "kios_tetap" | "keliling" | "musiman";
  /** Format YYYY-MM-DD */
  terakhirDikonfirmasi: string;
  lat?: number;
  lng?: number;
  mapsUrl?: string;
  orderUrl?: string;
};

export type Recipe = {
  judulVersi: string;
  porsi: number;
  waktuMenit: number;
  kesulitan: "mudah" | "sedang" | "sulit";
  bahan: string[];
  langkah: string[];
  verified: boolean;
  videoUrl?: string;
};

export type Snack = {
  slug: string;
  nama: string;
  namaLain: string[];
  provinsi: string;
  provinsiSlug: string;
  kategori: string;
  deskripsi: string;
  cerita: string;
  cover?: string;
  rarity: Rarity;
  jumlahVote: number;
  resep?: Recipe;
  sightings: Sighting[];
  createdAt: string;
};

/** Versi ringan untuk kartu katalog: payload kecil = hemat memori & kuota */
export type SnackCardData = Pick<
  Snack,
  "slug" | "nama" | "provinsi" | "kategori" | "deskripsi" | "cover" | "rarity" | "jumlahVote"
> & { punyaResep: boolean; punyaVideo: boolean; punyaLokasi: boolean };

export type Page<T> = { items: T[]; nextPage: number | null; total: number };
