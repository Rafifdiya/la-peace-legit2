import Link from "next/link";
import { Plus, Search, UserRound } from "lucide-react";
import { LoginButton } from "./LoginButton";

const menu = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/request", label: "Request" },
  { href: "/tentang", label: "Tentang" },
];

// Server Component: tanpa JavaScript di browser. Search pakai <form> biasa (GET).
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page">
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-4">
        <Link href="/" className="font-display text-xl font-semibold text-brand">
          Jejak Jajan
        </Link>
        <ul className="hidden gap-5 text-sm md:flex">
          {menu.map((m) => (
            <li key={m.href}>
              <Link href={m.href} className="hover:text-brand">
                {m.label}
              </Link>
            </li>
          ))}
        </ul>
        <form action="/katalog" className="ml-auto hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 sm:flex">
          <Search size={16} className="text-ink-2" aria-hidden />
          <input name="q" placeholder="Cari jajanan..." aria-label="Cari jajanan" className="w-40 bg-transparent text-sm outline-none" />
        </form>
        <LoginButton className="ml-auto text-sm hover:text-brand sm:ml-0">Masuk</LoginButton>
        {/* Template: link profil selalu tampil. Nanti hanya saat sudah login (+ link Admin jika role admin). */}
        <Link href="/profil/saya" aria-label="Profil saya" className="hidden rounded-full bg-subtle p-2 hover:text-brand md:block">
          <UserRound size={18} />
        </Link>
        <Link
          href="/upload"
          className="hidden items-center gap-1 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover sm:flex"
        >
          <Plus size={16} aria-hidden /> Kontribusi
        </Link>
      </nav>
    </header>
  );
}
