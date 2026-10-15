import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Syarat & Ketentuan" };

const isi: [string, string][] = [
  ["Akun", "Satu orang satu akun. Jaga kerahasiaan password; kamu bertanggung jawab atas aktivitas di akunmu."],
  ["Kontribusi", "Kiriman harus memenuhi kriteria katalog (lihat Tentang kami) dan dicek admin sebelum tampil. Admin boleh menolak atau menghapus kiriman yang melanggar."],
  ["Hak cipta", "Kamu hanya mengunggah foto & tulisan milik sendiri atau berlisensi bebas. Dengan mengirim, kamu setuju kontenmu berlisensi CC BY-SA 4.0: boleh dibagikan ulang dengan menyebut sumber."],
  ["Resep", "Resep berasal dari komunitas. Hasil bisa berbeda; perhatikan alergi & kebersihan bahan. Lihat laporan \"Sudah coba resep ini?\" dari pengguna lain."],
  ["Lokasi penjual", "Info lokasi bisa berubah. Konfirmasi \"Masih ada / Sudah tidak ada\" membantu menjaga info tetap baru."],
  ["Premium (mode demo)", "Fitur Premium saat ini mode demo untuk expo, tanpa pembayaran sungguhan."],
  ["Perilaku", "Dilarang kata kasar, SARA, spam, promosi berlebihan, dan menyamar sebagai orang lain."],
];

export default function SyaratPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 py-10 leading-relaxed">
      <h1 className="font-display text-4xl font-semibold">Syarat & Ketentuan</h1>
      <p className="text-ink-2">Dengan memakai Jejak Jajan, kamu setuju dengan ketentuan berikut.</p>
      {isi.map(([judul, teks]) => (
        <section key={judul} className="space-y-1">
          <h2 className="font-display text-xl font-semibold">{judul}</h2>
          <p>{teks}</p>
        </section>
      ))}
      <p className="text-sm text-ink-2">
        Lihat juga <Link href="/kebijakan-privasi" className="text-brand underline">Kebijakan Privasi</Link>.
      </p>
    </article>
  );
}
