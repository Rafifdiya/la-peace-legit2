import Image from "next/image";

type Props = {
  src?: string;
  alt: string;
  /** Petunjuk lebar gambar di layar, supaya browser unduh ukuran pas */
  sizes: string;
  /** true hanya untuk gambar utama di atas layar (LCP) */
  utama?: boolean;
  className?: string;
};

// Placeholder ringan (CSS saja, tanpa file gambar) jika foto belum ada
function Placeholder({ alt }: { alt: string }) {
  return (
    <div
      aria-label={alt}
      role="img"
      className="flex h-full w-full items-center justify-center bg-subtle font-display text-4xl text-brand/40"
    >
      {alt.charAt(0)}
    </div>
  );
}

export function SnackImage({ src, alt, sizes, utama = false, className }: Props) {
  return (
    <div className={`relative overflow-hidden bg-subtle ${className ?? ""}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={utama ? 75 : 60}
          preload={utama}
          loading={utama ? "eager" : "lazy"}
          className="object-cover"
        />
      ) : (
        <Placeholder alt={alt} />
      )}
    </div>
  );
}
