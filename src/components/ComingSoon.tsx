import Link from "next/link";
import { KepalaHalaman } from "./KepalaHalaman";

export function ComingSoon({ judul, catatan }: { judul: string; catatan: string }) {
  return (
    <div className="py-16">
      <KepalaHalaman className="text-center">
        <h1 className="font-display text-4xl font-semibold">{judul}</h1>
        <p className="mt-3 text-ink-2">{catatan}</p>
        <Link href="/katalog" className="mt-6 inline-block text-brand underline">Lihat katalog</Link>
      </KepalaHalaman>
    </div>
  );
}
