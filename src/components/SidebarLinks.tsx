"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePremium } from "./TanpaIklanPremium";
import { Crown, GraduationCap, Home, Info, LayoutGrid, MessageCircleQuestion, Plus, UserRound } from "lucide-react";

const menu = [
  { href: "/", label: "Beranda", Icon: Home },
  { href: "/katalog", label: "Katalog Jajanan", Icon: LayoutGrid },
  { href: "/request", label: "Forum Jajanan", Icon: MessageCircleQuestion },
  { href: "/kelas", label: "Kelas", Icon: GraduationCap },
  { href: "/profil/saya", label: "Profil saya", Icon: UserRound },
  { href: "/premium", label: "Premium", Icon: Crown },
  { href: "/upload", label: "Kontribusi", Icon: Plus },
  { href: "/tentang", label: "Tentang kami", Icon: Info },
];

/** Menu sidebar; client hanya untuk menandai halaman aktif. */
export function SidebarLinks() {
  const path = usePathname();
  const premium = usePremium();
  return (
    <ul className="space-y-1">
      {menu.map(({ href, label, Icon }) => {
        const aktif = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={aktif ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-[0.73rem] transition-colors ${
                // Kontribusi ditonjolkan: tulisan tangan tebal + bingkai oranye transparan
                href === "/upload"
                  ? "border border-orange-500/40 py-2 font-hand text-[1.73rem] font-bold"
                  : // Tentang kami: 5% lebih kecil dari menu lain
                    href === "/tentang"
                    ? "py-[0.69rem] text-[1.235rem]"
                    : "text-[1.3rem]"
              } ${
                // Sudah Premium: menu Premium selalu berlatar hijau muda transparan
                href === "/premium" && premium
                  ? `bg-green-400/20 ${aktif ? "font-semibold" : ""}`
                  : aktif
                    ? "bg-subtle font-semibold text-brand"
                    : "text-ink-2 hover:bg-subtle hover:text-ink"
              }`}
            >
              {/* Sudah Premium: mahkota & kilau jadi hijau */}
              <Icon size={href === "/tentang" ? 24 : 25} aria-hidden className={href === "/premium" && premium ? "text-accent" : undefined} />
              {/* Premium: teks berkilau kiri ke kanan supaya menarik perhatian */}
              {href === "/premium" ? (
                <span className={`kilau font-semibold ${premium ? "kilau-hijau" : ""}`}>{label}</span>
              ) : href === "/tentang" ? (
                <span className="underline underline-offset-4">{label}</span>
              ) : (
                label
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
