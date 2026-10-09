import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";
import { SnackCard } from "@/components/SnackCard";
import { StatCard } from "@/components/StatCard";
import { StatusPill } from "@/components/StatusPill";
import { Tabs } from "@/components/Tabs";
import type { User } from "@/data/dummy";
import { getCards, getSubmissions } from "@/lib/data";
import { formatTanggal } from "@/lib/format";

type Props = { user: User; diriSendiri: boolean; tab: string; basePath: string };

export async function ProfileView({ user, diriSendiri, tab, basePath }: Props) {
  // Tab Tersimpan & Status kiriman hanya untuk profil sendiri
  const tabs = [{ key: "kontribusi", label: "Kontribusi" }];
  if (diriSendiri) tabs.push({ key: "tersimpan", label: "Tersimpan" }, { key: "status", label: "Status kiriman" });
  const active = tabs.some((t) => t.key === tab) ? tab : "kontribusi";

  return (
    <div className="space-y-8 py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand font-display text-3xl text-white">
          {user.nama.charAt(0)}
        </div>
        <div className="flex-1 space-y-1">
          <h1 className="font-display text-3xl font-semibold">{user.nama}</h1>
          <p className="text-sm text-ink-2">@{user.username} · {user.daerah}</p>
          <p>{user.bio}</p>
        </div>
        {diriSendiri && (
          <div className="flex gap-2">
            <LoginButton className="rounded-full border border-line px-4 py-2 text-sm hover:border-brand">Edit profil</LoginButton>
            {user.role === "admin" && (
              <Link href="/admin" className="rounded-full bg-brand px-4 py-2 text-sm text-white">Admin</Link>
            )}
          </div>
        )}
      </header>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Kontribusi" value={user.kontribusi.length} />
        <StatCard label="Lokasi" value={user.jumlahLokasi} />
        <StatCard label="Resep dicoba" value={user.resepDicoba} />
      </div>

      <Tabs basePath={basePath} active={active} tabs={tabs} />
      {active === "kontribusi" && <CardGrid slugs={user.kontribusi} kosong="Belum ada kontribusi." />}
      {active === "tersimpan" && <CardGrid slugs={user.tersimpan} kosong="Belum ada jajanan yang disimpan." />}
      {active === "status" && <SubmissionList username={user.username} />}
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

async function SubmissionList({ username }: { username: string }) {
  const list = await getSubmissions(username);
  if (list.length === 0) return <p className="text-ink-2">Belum ada kiriman.</p>;
  return (
    <ul className="space-y-3">
      {list.map((s) => (
        <li key={s.id} className="space-y-2 rounded-lg border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{s.judul}</p>
              <p className="text-sm text-ink-2">{s.jenis} · {formatTanggal(s.tanggal)}</p>
            </div>
            <StatusPill status={s.status} />
          </div>
          {s.status === "rejected" && (
            <div className="rounded-sm bg-subtle p-3 text-sm">
              <p><span className="font-semibold">Alasan ditolak:</span> {s.alasan}</p>
              <Link href="/upload" className="mt-1 inline-block text-brand underline">Perbaiki & kirim ulang</Link>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
