import Link from "next/link";
import { SidebarLinks } from "./SidebarLinks";

// Navigasi kiri untuk layar md ke atas (mirip Cookpad). Mobile pakai BottomNav.
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[17.6rem] shrink-0 flex-col gap-6 border-r border-line bg-surface px-4 py-6 md:flex">
      <Link href="/" className="px-3 font-display text-[1.73rem] font-semibold text-brand">
        Jejak Jajan
      </Link>
      <SidebarLinks />
    </aside>
  );
}
