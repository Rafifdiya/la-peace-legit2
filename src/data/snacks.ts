// DATA DUMMY untuk template dasar. Nanti diganti query Supabase (lihat src/lib/data.ts).
import type { Rarity, Recipe, Sighting, Snack } from "@/lib/types";

type Seed = [
  slug: string,
  nama: string,
  namaLain: string[],
  provinsi: string,
  kategori: string,
  rarity: Rarity,
  jumlahVote: number,
  deskripsi: string,
];

const seeds: Seed[] = [
  ["klepon", "Klepon", ["Kelepon"], "Jawa Tengah", "Kue basah", "umum", 12, "Bola ketan isi gula merah, dibalur kelapa parut."],
  ["kue-ape", "Kue Ape", ["Kue Tetek", "Serabi Jakarta"], "DKI Jakarta", "Kue basah", "mulai_langka", 8, "Kue tipis renyah di pinggir, empuk di tengah, warna hijau pandan."],
  ["kue-rangi", "Kue Rangi", ["Sagu Rangi"], "DKI Jakarta", "Kue kering", "hampir_punah", 15, "Kelapa dan sagu dipanggang di cetakan, disiram gula merah kental."],
  ["kue-cucur", "Kue Cucur", ["Cucur"], "DKI Jakarta", "Gorengan manis", "mulai_langka", 6, "Kue goreng bertopi dari tepung beras dan gula merah."],
  ["getuk-lindri", "Getuk Lindri", ["Gethuk"], "Jawa Tengah", "Kue basah", "umum", 9, "Singkong tumbuk berwarna-warni, ditabur kelapa parut."],
  ["gatot", "Gatot", [], "DI Yogyakarta", "Kue basah", "mulai_langka", 4, "Gaplek singkong kukus bertekstur kenyal, disajikan dengan kelapa."],
  ["kue-putu", "Kue Putu", ["Putu Bambu"], "Jawa Timur", "Kue basah", "mulai_langka", 11, "Tepung beras isi gula merah dikukus dalam tabung bambu, bersiul."],
  ["lupis", "Lupis", ["Lopis"], "Jawa Barat", "Kue basah", "umum", 7, "Ketan segitiga dibungkus daun pisang, disiram kinca."],
  ["kue-gandos", "Kue Gandos", ["Bandros"], "Jawa Barat", "Kue basah", "mulai_langka", 5, "Adonan kelapa dan tepung beras dipanggang di cetakan setengah lingkaran."],
  ["clorot", "Clorot", ["Celorot"], "Jawa Tengah", "Kue basah", "hampir_punah", 9, "Adonan manis dalam gulungan janur kerucut."],
  ["kue-jongkong", "Kue Jongkong", [], "Kepulauan Riau", "Kue basah", "hampir_punah", 3, "Puding tepung beras berlapis gula merah dalam daun pisang."],
  ["bingka-kentang", "Bingka Kentang", ["Bingka"], "Kalimantan Selatan", "Kue panggang", "mulai_langka", 6, "Kue panggang lembut berbentuk bunga dari kentang dan santan."],
  ["kue-lumpang", "Kue Lumpang", [], "Sumatera Utara", "Kue basah", "hampir_punah", 4, "Kue kukus berbentuk mangkuk kecil dengan kelapa parut."],
  ["lemang", "Lemang", [], "Sumatera Barat", "Olahan ketan", "umum", 10, "Ketan santan dimasak dalam bambu di atas bara api."],
  ["kue-lapek-bugis", "Lapek Bugis", ["Kue Bugis"], "Sumatera Barat", "Kue basah", "mulai_langka", 5, "Ketan hitam isi kelapa gula merah, dibungkus daun pisang."],
  ["barongko", "Barongko", [], "Sulawesi Selatan", "Kue basah", "mulai_langka", 7, "Pisang dihaluskan dengan telur dan santan, dikukus dalam daun pisang."],
  ["kue-bagea", "Kue Bagea", ["Bagea"], "Maluku", "Kue kering", "hampir_punah", 6, "Kue sagu keras beraroma kenari dan cengkih."],
  ["papeda-bakar", "Sagu Lempeng", ["Sagu Bakar"], "Papua", "Kue kering", "mulai_langka", 3, "Lempengan sagu dipanggang, teman minum teh."],
  ["jaja-laklak", "Jaja Laklak", ["Laklak"], "Bali", "Kue basah", "umum", 8, "Serabi kecil hijau dengan kelapa parut dan gula merah cair."],
  ["jaja-uli", "Jaja Uli", [], "Bali", "Olahan ketan", "mulai_langka", 2, "Ketan tumbuk padat, biasa dihidangkan saat upacara."],
  ["kue-satu", "Kue Satu", ["Koya"], "Jawa Timur", "Kue kering", "mulai_langka", 5, "Kue kacang hijau sangrai dicetak motif, lumer di mulut."],
  ["gemblong", "Gemblong", ["Jemblem"], "Jawa Barat", "Gorengan manis", "umum", 6, "Ketan goreng berbalut gula merah karamel."],
  ["kue-pancong", "Kue Pancong", ["Bandros Betawi"], "DKI Jakarta", "Kue basah", "mulai_langka", 4, "Kue kelapa setengah matang, lembek di dalam."],
  ["wajik-klethik", "Wajik Klethik", [], "Jawa Timur", "Olahan ketan", "hampir_punah", 3, "Ketan gula merah kering yang dibungkus kulit jagung."],
  ["kue-sengkulun", "Kue Sengkulun", [], "DKI Jakarta", "Kue basah", "punah", 4, "Kue ketan kenyal berwarna, kini hampir tak ada yang menjual."],
  ["dodol-garut", "Dodol Garut", ["Dodol"], "Jawa Barat", "Kue basah", "umum", 1, "Dodol ketan manis kenyal khas Garut."],
];

// Koordinat contoh per provinsi (hanya untuk demo mini map)
const koordinat: Record<string, [number, number]> = {
  "DKI Jakarta": [-6.2, 106.82],
  "Jawa Tengah": [-7.15, 110.14],
  "Jawa Barat": [-6.91, 107.61],
  "Jawa Timur": [-7.25, 112.75],
  "DI Yogyakarta": [-7.8, 110.36],
  Bali: [-8.65, 115.22],
  "Sumatera Barat": [-0.95, 100.35],
  "Sulawesi Selatan": [-5.14, 119.42],
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function resepContoh(nama: string, i: number): Recipe | undefined {
  if (i % 3 === 2) return undefined; // sebagian jajanan belum punya resep
  return {
    judulVersi: i % 2 ? `Versi Mbah Sri` : `Versi rumahan`,
    porsi: 20,
    waktuMenit: 45 + (i % 4) * 15,
    kesulitan: (["mudah", "sedang", "sulit"] as const)[i % 3],
    bahan: ["250 g tepung beras", "150 g gula merah", "200 ml santan", "1/2 butir kelapa parut", "Sejumput garam"],
    langkah: [
      `Siapkan semua bahan ${nama}.`,
      "Campur tepung dan santan hingga adonan halus.",
      "Masak sesuai cara tradisional (kukus/panggang/goreng).",
      "Angkat, dinginkan sebentar, lalu sajikan.",
    ],
    verified: i % 5 === 0,
    videoUrl: i % 4 === 0 ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : undefined,
  };
}

function sightingContoh(provinsi: string, i: number): Sighting[] {
  const c = koordinat[provinsi];
  if (!c || i % 4 === 3) return [];
  return [
    {
      id: `s${i}a`,
      tempat: `Pasar ${provinsi.split(" ").pop()}`,
      area: provinsi,
      jenis: "kios_tetap",
      terakhirDikonfirmasi: i % 2 ? "2026-09-20" : "2026-02-11", // yang Februari jadi "lama" (> 6 bulan)
      lat: c[0] + (i % 5) * 0.01,
      lng: c[1] + (i % 3) * 0.01,
      mapsUrl: `https://maps.google.com/?q=${c[0]},${c[1]}`,
      orderUrl: i % 3 === 0 ? "https://gofood.co.id" : undefined,
    },
    {
      id: `s${i}b`,
      tempat: "Pedagang keliling depan sekolah",
      area: provinsi,
      jenis: "keliling",
      terakhirDikonfirmasi: "2026-08-02",
    },
  ];
}

export const snacks: Snack[] = seeds.map(([slug, nama, namaLain, provinsi, kategori, rarity, jumlahVote, deskripsi], i) => ({
  slug,
  nama,
  namaLain,
  provinsi,
  provinsiSlug: slugify(provinsi),
  kategori,
  deskripsi,
  cerita: `${nama} dikenal di ${provinsi} sejak lama. Dulu mudah ditemukan di pasar tradisional dan pedagang keliling, kini penjualnya makin sedikit. Cerita ini contoh (data dummy) dan akan diganti kiriman komunitas.`,
  rarity,
  jumlahVote,
  resep: resepContoh(nama, i),
  sightings: sightingContoh(provinsi, i),
  createdAt: `2026-09-${String(28 - i).padStart(2, "0")}`,
}));
