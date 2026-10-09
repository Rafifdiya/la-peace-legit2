import type { Metadata } from "next";
import { LoginButton } from "@/components/LoginButton";

export const metadata: Metadata = { title: "Masuk" };

// Fallback untuk link langsung /masuk. Login utama berupa overlay.
export default function MasukPage() {
  return (
    <div className="py-24 text-center">
      <h1 className="font-display text-4xl font-semibold">Masuk ke Jejak Jajan</h1>
      <p className="mt-3 text-ink-2">Masuk untuk upload, vote, simpan, dan komentar.</p>
      <LoginButton className="mt-6 rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-hover">Masuk</LoginButton>
    </div>
  );
}
