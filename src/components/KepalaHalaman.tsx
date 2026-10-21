/**
 * Bagian judul halaman dengan motif kawung samar yang memudar ke tepi, sama seperti hero beranda.
 * -mx-4 px-4: motif melebar sampai tepi <main>, teks tetap sejajar dengan isi halaman.
 * className untuk tata letak isinya, mis. "text-center" atau grid.
 */
export function KepalaHalaman({ className, children }: { className?: string; children: React.ReactNode }) {
  return <header className={`motif-kawung motif-pudar -mx-4 rounded-xl px-4 py-8 ${className ?? ""}`}>{children}</header>;
}
