import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { LoginButton } from "@/components/LoginButton";
import { createClient } from "@/lib/supabase/server";
import { PengaturanForm } from "./PengaturanForm";

export const metadata: Metadata = { title: "Pengaturan profil" };

export default function PengaturanPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 py-10">
      <Link href="/profil/saya" className="inline-flex items-center gap-1 text-[1.155rem] text-ink-2 hover:text-brand">
        <ArrowLeft size={19} aria-hidden /> Kembali ke profil
      </Link>
      <h1 className="font-display text-4xl font-semibold">Pengaturan profil</h1>
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
    return (
      <LoginButton className="rounded-full bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-hover">Masuk dulu</LoginButton>
    );
  }
  const { data: p } = await supabase
    .from("profiles")
    .select("username, nama_tampil, avatar_url")
    .eq("id", data.user.id)
    .single<{ username: string | null; nama_tampil: string | null; avatar_url: string | null }>();
  return (
    <PengaturanForm
      userId={data.user.id}
      email={data.user.email ?? ""}
      nama={p?.nama_tampil ?? ""}
      username={p?.username ?? ""}
      avatarUrl={p?.avatar_url ?? null}
    />
  );
}
