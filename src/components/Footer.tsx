import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-subtle">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-8 text-sm text-ink-2 sm:flex-row sm:justify-between">
        <p>
          <span className="font-display font-semibold text-brand">Jejak Jajan</span> - arsip jajanan tradisional
          Indonesia dari komunitas.
        </p>
        <p>
          Konten berlisensi CC BY-SA 4.0 · <Link href="/tentang" className="underline">Aturan kontribusi</Link>
        </p>
      </div>
    </footer>
  );
}
