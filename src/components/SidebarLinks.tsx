"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, LayoutGrid, MessageCircleQuestion, Plus } from "lucide-react";

const menu = [
  { href: "/", label: "Beranda", Icon: Home },
  { href: "/katalog", label: "Katalog", Icon: LayoutGrid },
  { href: "/request", label: "Request", Icon: MessageCircleQuestion },
  { href: "/upload", label: "Kontribusi", Icon: Plus },
  { href: "/tentang", label: "Tentang", Icon: Info },
];

/** Menu sidebar; client hanya untuk menandai halaman aktif. */
export function SidebarLinks() {
  const path = usePathname();
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
                href === "/upload" ? "border border-orange-500/40 py-2 font-hand text-[1.73rem] font-bold" : "text-[1.3rem]"
              } ${aktif ? "bg-subtle font-semibold text-brand" : "text-ink-2 hover:bg-subtle hover:text-ink"}`}
            >
              <Icon size={25} aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
