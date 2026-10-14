import Link from "next/link";
import { SnackCard } from "@/components/SnackCard";
import { StatCard } from "@/components/StatCard";
import { Tabs } from "@/components/Tabs";
import { getCards } from "@/lib/data";
import type { ProfilUser } from "@/lib/komunitas";

type Props = {
  user: ProfilUser;
  diriSendiri: boolean;
  tab: string;
  basePath: string;
  /** Profil sendiri: slug jajanan yang disimpan */
  tersimpan?: string[];
  /** Profil sendiri: isi tab Status kiriman */
  statusKiriman?: React.ReactNode;
  /** Profil sendiri & admin: ringkasan moderasi (selalu tampil, bukan tab) */
  moderasi?: React.ReactNode;
};

export async function ProfileView({ user, diriSendiri, tab, basePath, tersimpan = [], statusKiriman, moderasi }: Props) {
  // Tab Tersimpan & Status kiriman hanya untuk profil sendiri
  const tabs = [{ key: "kontribusi", label: "Kontribusi" }];
  if (diriSendiri) tabs.push({ key: "tersimpan", label: "Tersimpan" }, { key: "status", label: "Status kiriman" });
  const active = tabs.some((t) => t.key === tab) ? tab : "kontribusi";

  return (
    <div className="space-y-8 py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand font-display text-3xl text-white">
          {user.nama.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 space-y-1">
          <h1 className="font-display text-3xl font-semibold">{user.nama}</h1>
          <p className="text-sm text-ink-2">
            {[user.username && `@${user.username}`, user.daerah].filter(Boolean).join(" · ") || "Belum mengisi username & daerah"}
          </p>
          {user.bio && <p>{user.bio}</p>}
        </div>
        {diriSendiri && user.role === "admin" && (
          <Link href="/admin" className="h-fit rounded-full bg-brand px-4 py-2 text-sm text-white">Dashboard Moderasi</Link>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Kontribusi" value={user.kontribusi.length} />
        <StatCard label="Lokasi" value={user.jumlahLokasi} />
      </div>

      {moderasi}

      <Tabs basePath={basePath} active={active} tabs={tabs} />
      {active === "kontribusi" && <CardGrid slugs={user.kontribusi} kosong="Belum ada kontribusi yang disetujui." />}
      {active === "tersimpan" && <CardGrid slugs={tersimpan} kosong="Belum ada jajanan yang disimpan." />}
      {active === "status" && statusKiriman}
    </div>
  );
}

async function CardGrid({ slugs, kosong }: { slugs: string[]; kosong: string }) {
  const cards = await getCards(slugs);
  if (cards.length === 0) return <p className="text-ink-2">{kosong}</p>;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((s) => <SnackCard key={s.slug} snack={s} />)}
    </div>
  );
}
