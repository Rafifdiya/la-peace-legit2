import { KRITERIA } from "@/lib/kriteria";
import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = { title: "Tentang" };


// Tim pembuat. Foto di public/tim/. Bio opsional.
// Jangan isi nomor WA / email pribadi / alamat (repo public).
// Sosial: isi link akun publik bila anggota setuju (ikon redup = belum diisi).
type Anggota = { nama: string; peran: string; bio?: string; foto?: string; sosial?: { instagram?: string; discord?: string; linkedin?: string; email?: string } };
const tim: Anggota[] = [
  { nama: "Rafifdiya", peran: "Project Lead", foto: "/tim/rafifdiya.png",
    sosial: { instagram: "https://www.instagram.com/rafif.dy/", discord: "https://discord.com/users/699140515270230076", linkedin: "https://www.linkedin.com/in/rafifdiya", email: "rafifdiya@binus.ac.id" } },
  { nama: "Albert Mario L.", peran: "Creative Design", foto: "/tim/albert-mario.jpg",
    sosial: { instagram: "https://www.instagram.com/albml138/", discord: "https://discord.com/users/455542617166577665", linkedin: "https://www.linkedin.com/in/albert-mario-laurent", email: "albert.laurent@binus.ac.id" } },
  { nama: "Ahmad Daffa H.", peran: "Business Management", foto: "/tim/ahmad-daffa.jpg",
    sosial: { instagram: "https://www.instagram.com/ad_daffa_h/", discord: "https://discord.com/users/346560552333737986", linkedin: "https://www.linkedin.com/in/ahmad-daffa-hidayatullah-44094943a", email: "ahmad.hidayatullah@binus.ac.id" } },
];
// Kontak tim (bukan kontak pribadi). Kosongkan untuk menyembunyikan.
const kontakTim = "email / Instagram tim (segera)";

export default function TentangPage() {
  // Motif kawung samar di belakang halaman, sama seperti hero beranda
  return (
    <article className="motif-kawung motif-pudar mx-auto max-w-3xl space-y-6 rounded-xl px-4 py-10 leading-relaxed sm:px-8">
      <h1 className="font-display text-4xl font-semibold">Tentang Jejak Jajan</h1>
      <p>
        Banyak jajanan tradisional makin sulit ditemukan karena penjualnya makin sedikit dan tidak punya penerus.
        Jejak Jajan adalah arsip yang diisi bersama: cerita, resep, dan lokasi terakhir jajanan itu terlihat.
      </p>
      <h2 className="font-display text-2xl font-semibold">Kriteria masuk katalog</h2>
      <ul className="list-inside list-disc space-y-1">
        {KRITERIA.map((k) => <li key={k}>{k}</li>)}
      </ul>
      <h2 className="font-display text-2xl font-semibold">Lisensi</h2>
      <p>Konten kontributor berlisensi CC BY-SA 4.0. Setiap kiriman dimoderasi admin sebelum tampil.</p>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Tim di balik Jejak Jajan</h2>
        <p className="text-ink-2">Mahasiswa Computer Science, project mata kuliah Venture Creation.</p>
        {/* Kartu profil, diadaptasi dari "card" Uiverse.io (1osm) dengan warna Jejak Jajan */}
        <ul className="grid gap-5 xl:grid-cols-3">
          {tim.map((a) => (
            <li key={a.nama} className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-[7px_5px_10px_rgb(43_33_27/0.15)]">
              <div className="flex min-h-[6.75rem] items-start gap-2.5 bg-brand py-3 pl-3 pr-4 text-white">
                {a.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element -- foto tim kecil, statis
                  <img src={a.foto} alt={a.nama} className="h-14 w-14 shrink-0 rounded-[10px] object-cover object-top ring-2 ring-orange-200/60" />
                ) : (
                  <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-brand-hover font-display text-2xl">
                    {a.nama.charAt(0)}
                  </span>
                )}
                <div className="min-w-0 space-y-1 pt-1">
                  <p className="whitespace-nowrap text-[0.95rem] font-semibold leading-tight">{a.nama}</p>
                  <p className="text-xs font-semibold text-orange-200">{a.peran}</p>
                </div>
              </div>
              <p className="m-1.5 min-h-[7rem] flex-1 rounded-[5px] bg-subtle p-3 text-sm text-ink-2">
                {a.bio ?? "Bio segera diisi."}
              </p>
              <div className="mx-3 flex justify-center gap-5 border-t-2 border-line py-3 text-brand">
                <Sosial href={a.sosial?.instagram} label="Instagram">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
                </Sosial>
                <Sosial href={a.sosial?.discord} label="Discord">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.3 18.3 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.4C.6 9 -.3 13.5.1 18a19.9 19.9 0 0 0 6 3l1.3-2.1a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1L18 21a19.8 19.8 0 0 0 6-3c.5-5.2-.9-9.7-3.7-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" /></svg>
                </Sosial>
                <Sosial href={a.sosial?.linkedin} label="LinkedIn">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8V21h-4z" /></svg>
                </Sosial>
                <Sosial href={a.sosial?.email && `mailto:${a.sosial.email}`} label="Email">
                  <Mail size={20} />
                </Sosial>
              </div>
            </li>
          ))}
        </ul>
        {kontakTim && (
          <p id="kontak" className="scroll-mt-24 text-sm text-ink-2">
            <span className="font-semibold text-ink">Kontak tim:</span> {kontakTim}
          </p>
        )}
      </section>
    </article>
  );
}

function Sosial({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) {
  if (!href) {
    return <span title={`${label} (segera)`} aria-label={`${label} (segera)`} className="opacity-75">{children}</span>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:text-brand-hover">
      {children}
    </a>
  );
}
