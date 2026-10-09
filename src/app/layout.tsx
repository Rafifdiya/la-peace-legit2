import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
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

export const metadata: Metadata = {
  title: { default: "Jejak Jajan", template: "%s · Jejak Jajan" },
  description: "Arsip jajanan tradisional Indonesia dari komunitas: cerita, resep, dan lokasi terakhir terlihat.",
};

export const viewport: Viewport = {
  themeColor: "#7a4a2a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${fraunces.variable} ${jakarta.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
