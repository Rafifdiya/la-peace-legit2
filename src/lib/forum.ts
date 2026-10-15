/** Topik Forum Jajanan. Topik "mencari" bisa berstatus Terjawab. */
export const TOPIK = [
  { key: "cari-resep", label: "Cari resep", emoji: "🔍", mencari: true },
  { key: "cari-penjual", label: "Cari penjual / lokasi", emoji: "📍", mencari: true },
  { key: "sejarah", label: "Sejarah & cerita", emoji: "📜", mencari: false },
  { key: "tips", label: "Tips memasak", emoji: "👩‍🍳", mencari: false },
  { key: "obrolan", label: "Nostalgia & obrolan", emoji: "💬", mencari: false },
] as const;

export type KeyTopik = (typeof TOPIK)[number]["key"];

export const cariTopik = (key: string) => TOPIK.find((t) => t.key === key) ?? TOPIK[TOPIK.length - 1];
export const topikValid = (key: string): key is KeyTopik => TOPIK.some((t) => t.key === key);

export const ATURAN_FORUM = [
  "Bahas seputar jajanan tradisional Indonesia: resep, penjual, sejarah, tips, atau kenangan.",
  "Sopan: tanpa kata kasar, SARA, atau menyerang orang lain.",
  "Bukan tempat jualan / promosi berlebihan.",
  "Postingan di luar tema bisa dilaporkan dan dihapus admin.",
];
