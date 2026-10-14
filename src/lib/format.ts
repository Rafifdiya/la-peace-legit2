export function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/** Pilihan waktu masak. Disimpan di DB sebagai batas atas (menit). */
export const WAKTU = [
  { menit: 10, label: "< 10 menit" },
  { menit: 20, label: "10-20 menit" },
  { menit: 30, label: "20-30 menit" },
  { menit: 60, label: "30-60 menit" },
  { menit: 120, label: "1-2 jam" },
  { menit: 240, label: "2-4 jam" },
  { menit: 1440, label: "> 4 jam / semalam" },
];

/** Label rentang waktu; data lama berupa angka bebas masuk ke rentang terdekat di atasnya. */
export function labelWaktu(menit: number) {
  return (WAKTU.find((w) => menit <= w.menit) ?? WAKTU[WAKTU.length - 1]).label;
}
