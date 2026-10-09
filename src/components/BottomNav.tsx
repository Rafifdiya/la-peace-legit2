import Link from "next/link";
import { Home, LayoutGrid, MessageCircleQuestion, Plus, User } from "lucide-react";

const items = [
  { href: "/", label: "Beranda", Icon: Home },
  { href: "/katalog", label: "Katalog", Icon: LayoutGrid },
  { href: "/upload", label: "Kontribusi", Icon: Plus },
  { href: "/request", label: "Request", Icon: MessageCircleQuestion },
  { href: "/profil/saya", label: "Profil", Icon: User },
];

// Navigasi bawah khusus mobile (Server Component, tanpa JavaScript)
export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-page pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link href={href} className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-ink-2 hover:text-brand">
              <Icon size={20} aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
