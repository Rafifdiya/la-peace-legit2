import type { Iklan } from "@/lib/iklan";

/** Tampilan media iklan (foto/GIF atau video tanpa suara yang berulang). */
export function IklanMedia({ iklan, kotak }: { iklan: Pick<Iklan, "judul" | "mediaUrl" | "jenis">; kotak?: boolean }) {
  // kotak = sudut tajam (slot sidebar); bawaan sudut membulat (daftar admin)
  const kelas = `aspect-[4/3] w-full bg-subtle object-cover ${kotak ? "" : "rounded-md"}`;
  return iklan.jenis === "video" ? (
    <video src={iklan.mediaUrl} className={kelas} autoPlay muted loop playsInline preload="metadata" aria-label={iklan.judul} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element -- GIF animasi harus tampil apa adanya
    <img src={iklan.mediaUrl} alt={iklan.judul} loading="lazy" className={kelas} />
  );
}
