import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Kebijakan Privasi" };

const isi: [string, string][] = [
  ["Data yang kami simpan", "Email, username, nama, dan foto profil saat kamu mendaftar; serta kiriman jajanan, resep, foto, dan lokasi yang kamu unggah."],
  ["Untuk apa", "Menjalankan fitur Jejak Jajan: masuk akun, menampilkan kontribusi, moderasi, dan pesan status kiriman. Kami tidak menjual data pribadi."],
  ["Yang tampil publik", "Username, nama, foto profil, dan kontribusi yang sudah disetujui admin. Email tidak ditampilkan."],
  ["Lokasi", "Hanya lokasi tempat usaha / tempat umum yang kamu tulis sendiri, bukan lokasi langsung dari perangkatmu."],
  ["Penyimpanan di browser", "Beberapa pengaturan (mis. teks lebih besar, pesan sudah dibaca) disimpan di browsermu sendiri."],
  ["Hak kamu", "Kamu bisa mengubah profil kapan saja di Pengaturan profil, atau menghubungi admin untuk menghapus akun dan data."],
];

export default function KebijakanPrivasiPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 py-10 leading-relaxed">
      <h1 className="font-display text-4xl font-semibold">Kebijakan Privasi</h1>
      <p className="text-ink-2">Jejak Jajan adalah project mahasiswa (Venture Creation). Ringkasnya, data kamu dipakai seperlunya untuk menjalankan arsip ini.</p>
      {isi.map(([judul, teks]) => (
        <section key={judul} className="space-y-1">
          <h2 className="font-display text-xl font-semibold">{judul}</h2>
          <p>{teks}</p>
        </section>
      ))}
      <p className="text-sm text-ink-2">
        Pertanyaan? <Link href="/tentang#kontak" className="text-brand underline">Hubungi tim</Link>.
      </p>
    </article>
  );
}
