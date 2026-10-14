import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { LoginButton } from "@/components/LoginButton";
import { ProfileView } from "@/components/profil/ProfileView";
import { StatusPill } from "@/components/StatusPill";
import { formatTanggal } from "@/lib/format";
import { getProfilSaya } from "@/lib/komunitas";
import { getKirimanAdmin, getKirimanSaya, getSesi } from "@/lib/kiriman";
import { KirimanList } from "@/app/admin/KirimanList";

export const metadata: Metadata = { title: "Profil saya" };

export default function ProfilSaya({ searchParams }: PageProps<"/profil/saya">) {
  return (
    <Suspense fallback={<p className="py-10 text-ink-2">Memuat profil...</p>}>
      <Isi searchParams={searchParams} />
    </Suspense>
  );
}

async function Isi({ searchParams }: Pick<PageProps<"/profil/saya">, "searchParams">) {
  // Isi bergantung pada user yang login: selalu dibuat saat request
  await connection();
  const tab = (await searchParams).tab;
  const sesi = await getSesi();
  if (!sesi.user) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold">Masuk untuk melihat profil</h1>
        <LoginButton className="rounded-full bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-hover">Masuk</LoginButton>
      </div>
    );
  }
  const { profil, tersimpan } = await getProfilSaya(sesi.user.id);
  return (
    <ProfileView
      user={profil}
      tersimpan={tersimpan}
      diriSendiri
      tab={typeof tab === "string" ? tab : "kontribusi"}
      basePath="/profil/saya"
      statusKiriman={<KirimanSaya userId={sesi.user.id} />}
      moderasi={sesi.admin ? <Moderasi /> : undefined}
    />
  );
}

async function KirimanSaya({ userId }: { userId: string }) {
  const list = await getKirimanSaya(userId);
  if (list.length === 0) {
    return (
      <p className="text-ink-2">
        Belum ada kiriman. <Link href="/upload" className="text-brand underline">Kirim jajanan pertama</Link>
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {list.map((k) => (
        <li key={k.id} className="space-y-2 rounded-lg border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">
                {k.status === "approved" ? <Link href={`/jajanan/${k.slug}`} className="hover:text-brand">{k.nama}</Link> : k.nama}
              </p>
              <p className="text-sm text-ink-2">Jajanan baru · {formatTanggal(k.tanggal)}</p>
            </div>
            <StatusPill status={k.status === "hidden" ? "rejected" : k.status} />
          </div>
          {k.status === "rejected" && k.alasanTolak && (
            <div className="rounded-sm bg-subtle p-3 text-sm">
              <p><span className="font-semibold">Alasan ditolak:</span> {k.alasanTolak}</p>
              <Link href="/upload" className="mt-1 inline-block text-brand underline">Perbaiki & kirim ulang</Link>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

const TAMPIL = 3;

/** Admin: 3 kiriman menunggu terbaru, sisanya di dashboard /admin. */
async function Moderasi() {
  const menunggu = (await getKirimanAdmin()).filter((k) => k.status === "pending");
  return (
    <section className="space-y-3 rounded-xl border border-line bg-subtle p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">Menunggu moderasi ({menunggu.length})</h2>
      </div>
      {menunggu.length === 0 ? (
        <p className="text-sm text-ink-2">Tidak ada kiriman yang menunggu.</p>
      ) : (
        <KirimanList kiriman={menunggu.slice(0, TAMPIL)} />
      )}
      <div className="flex justify-end">
        <Link href="/admin" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">
          {menunggu.length > TAMPIL ? `Lihat semua (${menunggu.length}) →` : "Buka dashboard →"}
        </Link>
      </div>
    </section>
  );
}
