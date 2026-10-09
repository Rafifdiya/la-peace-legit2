import Link from "next/link";

type Tab = { key: string; label: string };

/** Tab berbasis link (?tab=...): tanpa JavaScript, bisa dibagikan & tombol back jalan */
export function Tabs({ tabs, active, basePath }: { tabs: Tab[]; active: string; basePath: string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line text-sm font-semibold">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={`${basePath}?tab=${t.key}`}
          aria-current={t.key === active ? "page" : undefined}
          className={`whitespace-nowrap border-b-2 px-4 py-2.5 ${t.key === active ? "border-brand text-brand" : "border-transparent text-ink-2 hover:text-ink"}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
