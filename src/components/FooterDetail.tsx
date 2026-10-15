"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";

// Akun media sosial resmi Jejak Jajan. Kosong = belum ada (ikon tampil redup).
const SOSIAL: { label: string; href?: string; ikon: React.ReactNode }[] = [
  {
    label: "Instagram",
    ikon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>,
  },
  {
    label: "TikTok",
    ikon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M16.6 3c.4 2.2 1.8 3.7 4 3.9v3.2a7.6 7.6 0 0 1-4-1.2v6.6A6.5 6.5 0 1 1 10 9v3.3a3.2 3.2 0 1 0 3.3 3.2V3z" /></svg>,
  },
  {
    label: "YouTube",
    ikon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15V9l5.8 3z" /></svg>,
  },
  {
    label: "Discord",
    ikon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.3 18.3 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.4C.6 9 -.3 13.5.1 18a19.9 19.9 0 0 0 6 3l1.3-2.1a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1L18 21a19.8 19.8 0 0 0 6-3c.5-5.2-.9-9.7-3.7-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" /></svg>,
  },
];

const PETA: [string, [string, string][]][] = [
  ["Jelajahi", [["/", "Beranda"], ["/katalog", "Katalog Jajanan"], ["/request", "Forum Jajanan"], ["/kelas", "Kelas"]]],
  ["Komunitas", [["/upload", "Kontribusi"], ["/premium", "Premium"], ["/profil/saya", "Profil saya"], ["/tentang", "Tentang kami"]]],
  ["Kebijakan & Legal", [["/syarat-ketentuan", "Syarat & Ketentuan"], ["/kebijakan-privasi", "Kebijakan Privasi"], ["/tentang", "Aturan kontribusi"], ["https://creativecommons.org/licenses/by-sa/4.0/deed.id", "Lisensi CC BY-SA 4.0"]]],
];

const kontakAdmin = process.env.NEXT_PUBLIC_KONTAK_ADMIN || "/tentang#kontak";
const judul = "mb-3 font-display text-lg font-semibold text-ink";
const tautan = "hover:text-brand hover:underline";

/** Footer lengkap, khusus beranda: tentang singkat, kontak, sosial, sitemap mini, legal. */
export function FooterDetail() {
  if (usePathname() !== "/") return null;
  return (
    <div className="mx-auto grid max-w-[1440px] gap-8 px-4 pt-10 text-sm text-ink-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr]">
      <div className="space-y-3">
        <p className="font-display text-2xl font-semibold text-brand">Jejak Jajan</p>
        <p>
          Arsip jajanan tradisional Indonesia yang diisi bersama komunitas: cerita, resep, dan lokasi terakhir
          jajanan itu terlihat, sebelum hilang dari ingatan.
        </p>
        <div className="flex gap-3 pt-1">
          {SOSIAL.map((s) =>
            s.href ? (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-brand hover:text-brand-hover">
                {s.ikon}
              </a>
            ) : (
              <span key={s.label} title={`${s.label} (segera)`} aria-label={`${s.label} (segera)`} className="text-brand opacity-75">
                {s.ikon}
              </span>
            ),
          )}
        </div>
      </div>

      {PETA.map(([kepala, daftar]) => (
        <nav key={kepala} aria-label={kepala}>
          <p className={judul}>{kepala}</p>
          <ul className="space-y-2">
            {daftar.map(([href, label]) => (
              <li key={label}>
                {href.startsWith("http") ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={tautan}>{label}</a>
                ) : (
                  <Link href={href} className={tautan}>{label}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      ))}

      <div>
        <p className={judul}>Kontak</p>
        <ul className="space-y-2">
          <li>
            <a href={kontakAdmin} className={`flex items-center gap-2 ${tautan}`}>
              <MessageCircle size={16} aria-hidden /> Kontak admin
            </a>
          </li>
          <li>
            <a href="mailto:rafifdiya@binus.ac.id" className={`flex items-center gap-2 break-all ${tautan}`}>
              <Mail size={16} className="shrink-0" aria-hidden /> rafifdiya@binus.ac.id
            </a>
          </li>
          <li>Project mahasiswa mata kuliah Venture Creation</li>
        </ul>
      </div>
    </div>
  );
}
