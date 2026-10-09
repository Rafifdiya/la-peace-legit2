import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profil/ProfileView";
import { getUser, getUsernames } from "@/lib/data";

export async function generateStaticParams() {
  return (await getUsernames()).map((username) => ({ username }));
}

export async function generateMetadata({ params }: PageProps<"/profil/[username]">): Promise<Metadata> {
  const user = await getUser((await params).username);
  return user ? { title: user.nama } : {};
}

// Profil publik: hanya tab Kontribusi
export default async function ProfilPublik({ params }: PageProps<"/profil/[username]">) {
  const { username } = await params;
  const user = await getUser(username);
  if (!user) notFound();
  return <ProfileView user={user} diriSendiri={false} tab="kontribusi" basePath={`/profil/${username}`} />;
}
