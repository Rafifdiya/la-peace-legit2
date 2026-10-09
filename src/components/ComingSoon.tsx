import Link from "next/link";

export function ComingSoon({ judul, catatan }: { judul: string; catatan: string }) {
  return (
    <div className="py-24 text-center">
      <h1 className="font-display text-4xl font-semibold">{judul}</h1>
      <p className="mt-3 text-ink-2">{catatan}</p>
      <Link href="/katalog" className="mt-6 inline-block text-brand underline">Lihat katalog</Link>
    </div>
  );
}
