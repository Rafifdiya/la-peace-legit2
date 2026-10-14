// Filter kata kasar sederhana: kiriman yang mengandung kata di bawah hanya DITANDAI
// untuk admin, tidak otomatis ditolak (docs/03). Daftar bisa ditambah tim.
const DAFTAR = ["anjing", "bangsat", "babi", "kontol", "memek", "ngentot", "goblok", "tolol", "bajingan", "asu", "jancok", "kampret"];

const pola = new RegExp(`\b(${DAFTAR.join("|")})\b`, "i");

export function adaKataKasar(...teks: (string | null | undefined)[]) {
  return teks.some((t) => !!t && pola.test(t));
}
