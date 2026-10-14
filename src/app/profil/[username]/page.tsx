import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profil/ProfileView";
import { getProfil, getUsernames } from "@/lib/komunitas";

// Cache Components butuh minimal 1 param; kalau belum ada username, pakai placeholder (404).
export async function generateStaticParams() {
  const list = await getUsernames();
  return (list.length ? list : ["_"]).map((username) => ({ username }));
}

export async function generateMetadata({ params }: PageProps<"/profil/[username]">): Promise<Metadata> {
  const user = await getProfil((await params).username);
  return user ? { title: user.nama } : {};
}

// Profil publik: hanya tab Kontribusi
export default async function ProfilPublik({ params }: PageProps<"/profil/[username]">) {
  const { username } = await params;
  const user = await getProfil(username);
  if (!user) notFound();
  return <ProfileView user={user} diriSendiri={false} tab="kontribusi" basePath={`/profil/${username}`} />;
}
