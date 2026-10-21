import Link from "next/link";
import { Plus } from "lucide-react";
import { AuthNav } from "./AuthNav";

// Bar atas: logo (hanya mobile, desktop ada di Sidebar) + Masuk/Profil + Kontribusi.
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page md:border-none">
      <nav className="mx-auto flex h-[4.62rem] max-w-[1440px] items-center gap-4 px-4">
        <Link href="/" className="font-display text-xl font-semibold text-brand md:hidden">
          Jejak Jajan
        </Link>
        <span className="ml-auto" />
        <AuthNav />
        <Link
          href="/upload"
          className="hidden items-center gap-1 rounded-full border-2 border-orange-500/40 bg-brand px-[1.155rem] py-[0.578rem] text-[1.155rem] text-white hover:bg-brand-hover sm:flex"
        >
          <Plus size={21} aria-hidden /> Kontribusi
        </Link>
      </nav>
    </header>
  );
}
