import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { Suspense } from "react";
import { KontakAdmin } from "@/components/KontakAdmin";
import { TerapkanPengaturan } from "@/components/TerapkanPengaturan";
import { SlotPopupIklan } from "@/components/SlotPopupIklan";
import { LoginDialog } from "@/components/LoginDialog";
import { Navbar } from "@/components/Navbar";
import { SKRIP_SIDEBAR } from "@/components/TombolSidebar";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

// Font di-host sendiri oleh Next.js, hanya ketebalan yang dipakai
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

// Aksen tulisan tangan: hanya untuk teks pendek (tagline, kutipan), bukan paragraf
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Jejak Jajan", template: "%s · Jejak Jajan" },
  description: "Arsip jajanan tradisional Indonesia dari komunitas: cerita, resep, dan lokasi terakhir terlihat.",
};

export const viewport: Viewport = {
  themeColor: "#7a4a2a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" suppressHydrationWarning className={`${fraunces.variable} ${jakarta.variable} ${caveat.variable} antialiased`}>
      <body className="flex min-h-screen pb-16 md:pb-0">
        {/* Status buka/tutup sidebar diterapkan sebelum tampil agar tidak berkedip */}
        <script dangerouslySetInnerHTML={{ __html: SKRIP_SIDEBAR }} />
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4">{children}</main>
          <Footer />
        </div>
        <BottomNav />
        <KontakAdmin />
        <TerapkanPengaturan />
        <Suspense>
          <SlotPopupIklan />
        </Suspense>
        <LoginDialog />
      </body>
    </html>
  );
}
