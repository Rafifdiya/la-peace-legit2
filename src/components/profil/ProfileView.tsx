import Link from "next/link";
import { Pencil, Settings } from "lucide-react";
import { SnackCard } from "@/components/SnackCard";
import { HapusJajanan } from "@/app/admin/HapusJajanan";
import { AvatarProfil } from "./AvatarProfil";
import { KepalaHalaman } from "@/components/KepalaHalaman";
import { LevelKontributor } from "./LevelKontributor";
import { formatTanggal } from "@/lib/format";
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
  /** Profil sendiri: isi tab Tersimpan. Bila kosong, pakai grid dari `tersimpan`. */
  tersimpanIsi?: React.ReactNode;
  /** Profil sendiri & admin: ringkasan moderasi (selalu tampil, bukan tab) */
  moderasi?: React.ReactNode;
};

export async function ProfileView({ user, diriSendiri, tab, basePath, tersimpan = [], statusKiriman, moderasi, tersimpanIsi }: Props) {
  // Tab Tersimpan & Status kiriman hanya untuk profil sendiri
  const tabs = [{ key: "kontribusi", label: "Kontribusi" }];
  if (diriSendiri) tabs.push({ key: "tersimpan", label: "Tersimpan" }, { key: "status", label: "Status kiriman" });
  const active = tabs.some((t) => t.key === tab) ? tab : "kontribusi";

  return (
    <div className="profil-halaman space-y-8 py-10">
      <KepalaHalaman className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <AvatarProfil nama={user.nama} premium={user.premium} src={user.avatarUrl} />
        <div className="flex-1 space-y-1">
          <h1 className="flex flex-wrap items-center gap-2 font-display text-3xl font-semibold">
            {user.nama}
            {user.premium && (
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 font-sans text-sm">
                {/* Teks berkilau seperti menu Premium di sidebar; admin ditandai "Admin" */}
                <span className="kilau font-semibold">{user.role === "admin" ? "Admin" : "Premium"}</span>
              </span>
            )}
          </h1>
          <p className="text-sm text-ink-2">
            {[user.username && `@${user.username}`, user.daerah].filter(Boolean).join(" · ") || "Belum mengisi username & daerah"}
          </p>
          {user.bio && <p>{user.bio}</p>}
        </div>
        {diriSendiri && (
          <div className="flex flex-wrap gap-2">
            <Link href="/profil/saya/pengaturan" className="flex h-fit items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm hover:border-brand">
              <Pencil size={14} aria-hidden /> Pengaturan profil
            </Link>
            <Link href="/pengaturan" className="flex h-fit items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm hover:border-brand">
              <Settings size={14} aria-hidden /> Pengaturan
            </Link>
            {user.role === "admin" && (
              <Link href="/admin" className="h-fit rounded-full bg-brand px-4 py-2 text-sm text-white">Dashboard Moderasi</Link>
            )}
          </div>
        )}
      </KepalaHalaman>

      {/* Dua kotak sebaris: level kontributor (kiri) dan ringkasan aktivitas (kanan) */}
      <div className="profil-baris gap-3">
        <LevelKontributor jumlah={user.kontribusi.length} diriSendiri={diriSendiri} admin={user.role === "admin"} />
        <section aria-label="Ringkasan aktivitas" className="profil-ringkas rounded-xl border border-line bg-surface p-3 [zoom:0.9]">
          {(
            [
              [user.kontribusi.length, "Kontribusi"],
              [user.jumlahDicoba, "Resep dicoba"],
              [user.jumlahForum, "Postingan forum"],
            ] as const
          ).map(([n, l]) => (
            <p key={l}>
              <span className="block font-display text-2xl font-semibold text-brand">{n}</span>
              <span className="whitespace-nowrap text-sm text-ink-2">{l}</span>
            </p>
          ))}
          <p>
            <span className="block whitespace-nowrap font-semibold text-ink">{formatTanggal(user.bergabung)}</span>
            <span className="whitespace-nowrap text-sm text-ink-2">Bergabung sejak</span>
          </p>
        </section>
      </div>

      {moderasi}

      <Tabs basePath={basePath} active={active} tabs={tabs} />
      {active === "kontribusi" && <CardGrid slugs={user.kontribusi} kosong="Belum ada kontribusi yang disetujui." bisaHapus={diriSendiri} />}
      {active === "tersimpan" && (tersimpanIsi ?? <CardGrid slugs={tersimpan} kosong="Belum ada jajanan yang disimpan." />)}
      {active === "status" && statusKiriman}
    </div>
  );
}

/** bisaHapus: profil sendiri, tombol Hapus di pojok kartu (di luar link kartu). */
async function CardGrid({ slugs, kosong, bisaHapus }: { slugs: string[]; kosong: string; bisaHapus?: boolean }) {
  const cards = await getCards(slugs);
  if (cards.length === 0) return <p className="text-ink-2">{kosong}</p>;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((s) =>
        bisaHapus ? (
          <div key={s.slug} className="relative">
            <SnackCard snack={s} />
            <Link
              href={`/edit-kontribusi?slug=${s.slug}`}
              className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-brand bg-white px-3 py-1 text-sm text-brand shadow-card hover:bg-brand hover:text-white"
            >
              <Pencil size={14} aria-hidden /> Edit
            </Link>
            <div className="absolute bottom-3 right-3 rounded-full bg-white shadow-card">
              <HapusJajanan kunci={{ slug: s.slug }} nama={s.nama} label="Hapus" />
            </div>
          </div>
        ) : (
          <SnackCard key={s.slug} snack={s} />
        ),
      )}
    </div>
  );
}
