import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileView } from "@/components/profil/ProfileView";
import { getCurrentUser } from "@/lib/data";

export const metadata: Metadata = { title: "Profil saya" };

export default function ProfilSaya({ searchParams }: PageProps<"/profil/saya">) {
  return (
    <Suspense fallback={<p className="py-10 text-ink-2">Memuat profil...</p>}>
      <Isi searchParams={searchParams} />
    </Suspense>
  );
}

async function Isi({ searchParams }: Pick<PageProps<"/profil/saya">, "searchParams">) {
  const tab = (await searchParams).tab;
  const user = await getCurrentUser();
  return <ProfileView user={user} diriSendiri tab={typeof tab === "string" ? tab : "kontribusi"} basePath="/profil/saya" />;
}
