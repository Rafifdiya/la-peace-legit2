import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CircleCheck, CircleX, Clock, Mail, MessageCircleQuestion, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LoginButton } from "@/components/LoginButton";
import { formatTanggal } from "@/lib/format";
import { getKirimanAdmin, getKirimanSaya, getSesi } from "@/lib/kiriman";
import { ID_SELAMAT_DATANG, idKiriman, idModerasi, idTanya, keTanya } from "@/lib/pesan";
import { DaftarPesan, type ItemPesan } from "./DaftarPesan";

export const metadata: Metadata = { title: "Pesan" };

export default function PesanPage() {
  return (
    <div className="teks-110 mx-auto max-w-3xl space-y-6 py-10">
      <div className="space-y-1">
        <h1 className="font-display text-4xl font-semibold">Pesan</h1>
        <p className="text-ink-2">Kabar tentang kirimanmu dari tim Jejak Jajan.</p>
      </div>
      <Suspense fallback={<p className="text-ink-2">Memuat...</p>}>
        <Isi />
      </Suspense>
    </div>
  );
}

const ikon = (Icon: typeof Mail, warna: string) => <Icon size={22} className={warna} aria-hidden />;

async function Isi() {
  await connection(); // tergantung user yang login
  const sesi = await getSesi();
  if (!sesi.user) {
    return <LoginButton className="rounded-full bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-hover">Masuk dulu</LoginButton>;
  }

  // Pesan dibentuk dari status kiriman (belum ada tabel pesan terpisah)
  const pesan: ItemPesan[] = [];
  if (sesi.admin) {
    const menunggu = (await getKirimanAdmin()).filter((k) => k.status === "pending").length;
    if (menunggu > 0) {
      pesan.push({
        id: idModerasi(menunggu),
        ikon: ikon(ShieldCheck, "text-brand"),
        judul: `${menunggu} kiriman menunggu moderasi`,
        isi: <Link href="/admin" className="text-brand underline">Buka Dashboard Moderasi</Link>,
      });
    }
  }
  for (const k of await getKirimanSaya(sesi.user.id)) {
    const dasar = { id: idKiriman(k), tanggal: formatTanggal(k.tanggal) };
    if (k.status === "approved") {
      pesan.push({
        ...dasar,
        ikon: ikon(CircleCheck, "text-accent"),
        judul: `"${k.nama}" disetujui`,
        isi: <>Kirimanmu sudah tampil di katalog. <Link href={`/jajanan/${k.slug}`} className="text-brand underline">Lihat</Link></>,
      });
    } else if (k.status === "rejected") {
      pesan.push({
        ...dasar,
        ikon: ikon(CircleX, "text-danger"),
        judul: `"${k.nama}" belum bisa ditampilkan`,
        isi: k.alasanTolak ? `Alasan: ${k.alasanTolak}` : "Cek lagi kriteria di halaman Kontribusi, lalu kirim ulang.",
      });
    } else if (k.status === "pending") {
      pesan.push({
        ...dasar,
        ikon: ikon(Clock, "text-ink-2"),
        judul: `"${k.nama}" sedang dicek admin`,
        isi: "Kamu akan melihat hasilnya di sini.",
      });
    }
  }
  // Postingan Forum Jajanan milik user yang mendapat balasan
  const supabase = await createClient();
  const { data: tanyaRows } = await supabase.from("requests").select("id, judul, request_answers!request_answers_request_id_fkey(count)").eq("created_by", sesi.user.id);
  for (const t of keTanya(tanyaRows)) {
    if (t.jawaban === 0) continue;
    pesan.push({
      id: idTanya(t),
      ikon: ikon(MessageCircleQuestion, "text-accent"),
      judul: `Postinganmu "${t.judul}" mendapat balasan`,
      isi: <>{t.jawaban} balasan dari komunitas. <Link href={`/request/${t.id}`} className="text-brand underline">Lihat balasan</Link></>,
    });
  }
  pesan.push({
    id: ID_SELAMAT_DATANG,
    ikon: ikon(Mail, "text-brand"),
    judul: "Selamat datang di Jejak Jajan!",
    isi: (
      <>
        Silakan menjelajah <Link href="/katalog" className="text-brand underline">katalog</Link> jajanan tradisional, simpan yang kamu suka,
        dan coba resepnya di rumah. Kalau tahu jajanan yang hampir hilang di sekitarmu,{" "}
        <Link href="/upload" className="text-brand underline">bantu arsipkan</Link>. Selamat menjelajah!
      </>
    ),
  });

  return <DaftarPesan userId={sesi.user.id} pesan={pesan} />;
}
