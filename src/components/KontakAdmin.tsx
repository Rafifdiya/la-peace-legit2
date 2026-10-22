import { MessageCircle, Phone } from "lucide-react";

// Link kontak admin (mis. https://wa.me/62xxx atau mailto:...) diisi di .env.local,
// bukan di kode, karena repo public. Bila kosong, arahkan ke halaman Tentang kami.
const tujuan = process.env.NEXT_PUBLIC_KONTAK_ADMIN || "/tentang#kontak";
const luar = /^(https?:|mailto:)/.test(tujuan);

/** Tombol melayang pojok kanan bawah di semua halaman. */
export function KontakAdmin() {
  return (
    <a
      href={tujuan}
      {...(luar && { target: "_blank", rel: "noopener noreferrer" })}
      aria-label="Kontak admin"
      className="tombol-kontak group fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg ring-2 ring-orange-500/40 transition-colors hover:bg-brand-hover md:bottom-6 md:right-6"
    >
      <span className="relative flex">
        <MessageCircle size={30} aria-hidden />
        <Phone size={12} strokeWidth={2.5} aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      </span>
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-sm font-semibold text-page opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        Kontak admin
      </span>
    </a>
  );
}
