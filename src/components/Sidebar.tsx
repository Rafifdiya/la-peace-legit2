import Link from "next/link";
import { Suspense } from "react";
import { PlaceholderIklan, SlotIklan } from "./SlotIklan";
import { SidebarLinks } from "./SidebarLinks";
import { TanpaIklanPremium } from "./TanpaIklanPremium";

// Navigasi kiri untuk layar md ke atas (mirip Cookpad). Mobile pakai BottomNav.
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-[111.12vh] w-[19.2rem] shrink-0 [zoom:0.9] flex-col gap-6 overflow-y-auto [scrollbar-width:thin] border-r border-line bg-surface px-4 py-6 md:flex">
      <Link href="/" className="px-3 font-display text-[2.008rem] font-semibold text-brand">
        Jejak Jajan
      </Link>
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
