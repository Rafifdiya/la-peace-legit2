import Link from "next/link";
import { Suspense } from "react";
import { PlaceholderIklan, SlotIklan } from "./SlotIklan";
import { SidebarLinks } from "./SidebarLinks";
import { TanpaIklanPremium } from "./TanpaIklanPremium";
import { TutupSidebar } from "./TombolSidebar";

// Navigasi kiri untuk layar md ke atas (mirip Cookpad). Mobile pakai BottomNav.
export function Sidebar() {
  return (
    <aside className="sidebar-utama sticky top-0 hidden h-[145.24vh] w-[19.2rem] shrink-0 [zoom:0.6885] flex-col gap-6 overflow-y-auto [scrollbar-width:thin] border-r border-line bg-surface px-4 py-6 md:flex">
      <div className="flex items-center justify-between gap-2">
        <Link href="/" className="px-3 font-display text-[2.008rem] font-semibold text-brand">
          Jejak Jajan
        </Link>
        <TutupSidebar />
      </div>
      <SidebarLinks />
      {/* Slot banner sponsor (monetisasi, docs/05 Tema A); dikelola admin */}
      <TanpaIklanPremium>
        <Suspense fallback={<PlaceholderIklan />}>
          <SlotIklan />
        </Suspense>
      </TanpaIklanPremium>
    </aside>
  );
}
