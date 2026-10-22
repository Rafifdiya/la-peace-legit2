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
              className={`flex items-center gap-3 whitespace-nowrap rounded-md tracking-[0.03em] px-3 py-[0.73rem] transition-colors ${
                // Kontribusi ditonjolkan: tulisan tangan tebal + bingkai oranye transparan
                href === "/upload"
                  ? "border border-orange-500/40 py-2 font-hand text-[2.008rem] font-bold"
                  : // Tentang kami: 5% lebih kecil dari menu lain
                    href === "/tentang"
                    ? "py-[0.69rem] text-[1.513rem]"
                    : "text-[1.578rem]"
              } ${
                aktif ? "bg-subtle font-semibold text-brand" : "text-ink-2 hover:bg-subtle hover:text-ink"
              }`}
            >
              <Icon size={href === "/tentang" ? 24 : 25} aria-hidden />
              {/* Premium: teks berkilau kiri ke kanan supaya menarik perhatian */}
              {href === "/premium" ? (
                // Teks selalu berkilau; bila Premium aktif cukup ditandai label kecil hijau "aktif"
                <span className="flex items-baseline gap-2">
                  <span className="kilau font-semibold">{label}</span>
                  {premium && <span className="rounded-full bg-green-500/15 px-1.5 py-px text-[0.7em] font-semibold text-green-700">aktif</span>}
                </span>
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
