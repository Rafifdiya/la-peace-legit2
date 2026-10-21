/** labelClass: ganti gaya label (default kecil abu-abu). */
export function StatCard({ label, value, labelClass = "text-sm text-ink-2" }: { label: string; value: number | string; labelClass?: string }) {
  return (
    <div className="@container rounded-lg border border-line bg-surface p-4 text-center">
      <p className="font-display text-2xl font-semibold text-brand sm:text-3xl">{value}</p>
      <p className={labelClass}>{label}</p>
    </div>
  );
}
