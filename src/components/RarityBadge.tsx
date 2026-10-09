import type { Rarity } from "@/lib/types";

const label: Record<Rarity, string> = {
  umum: "Umum",
  mulai_langka: "Mulai langka",
  hampir_punah: "Hampir punah",
  punah: "Punah",
  unknown: "Belum cukup suara",
};

const style: Record<Rarity, string> = {
  umum: "bg-rarity-umum text-ink",
  mulai_langka: "bg-rarity-mulai text-ink",
  hampir_punah: "bg-rarity-hampir text-white",
  punah: "bg-rarity-punah text-white",
  unknown: "bg-rarity-unknown text-ink-2",
};

/** Label tampil jika minimal 3 suara (docs/03 Flow D) */
export function RarityBadge({ rarity, jumlahVote }: { rarity: Rarity; jumlahVote: number }) {
  const r = jumlahVote < 3 ? "unknown" : rarity;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style[r]}`}>{label[r]}</span>;
}
