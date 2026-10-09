const style = {
  pending: "bg-rarity-mulai text-ink",
  approved: "bg-rarity-umum text-ink",
  rejected: "bg-danger text-white",
};
const label = { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" };

export function StatusPill({ status }: { status: keyof typeof style }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style[status]}`}>{label[status]}</span>;
}
