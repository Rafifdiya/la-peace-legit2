import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { LoginButton } from "@/components/LoginButton";
import { createClient } from "@/lib/supabase/server";
import { PengaturanFitur } from "./PengaturanFitur";

export const metadata: Metadata = { title: "Pengaturan" };

export default function PengaturanPage() {
  return (
    <div className="teks-110 mx-auto max-w-3xl space-y-6 py-10">
      <div className="space-y-1">
        <h1 className="font-display text-4xl font-semibold">Pengaturan</h1>
        <p className="text-ink-2">Atur fitur Jejak Jajan untuk akunmu di browser ini.</p>
      </div>
      <Suspense fallback={<p className="text-ink-2">Memuat...</p>}>
        <Isi />
      </Suspense>
    </div>
  );
}

async function Isi() {
  await connection(); // tergantung user yang login
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return <LoginButton className="rounded-full bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-hover">Masuk dulu</LoginButton>;
  }
  const { data: p } = await supabase
    .from("profiles")
    .select("role, premium_sampai")
    .eq("id", data.user.id)
    .single<{ role: string; premium_sampai: string | null }>();
  // Admin otomatis Premium: semua fitur terbuka + bagian khusus admin
  if (p?.role === "admin") return <PengaturanFitur premium admin />;
  const premium = !!p?.premium_sampai && new Date(p.premium_sampai) > new Date();
  return <PengaturanFitur premium={premium} />;
}
