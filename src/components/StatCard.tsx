export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4 text-center">
      <p className="font-display text-2xl font-semibold text-brand sm:text-3xl">{value}</p>
      <p className="text-sm text-ink-2">{label}</p>
    </div>
  );
}
