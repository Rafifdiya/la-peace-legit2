"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { useLowEndDevice } from "@/lib/device";
import type { MapPoint } from "./MiniMap";

// Dynamic import + ssr:false: Leaflet butuh `window`, dan bundle-nya terpisah
const MiniMap = dynamic(() => import("./MiniMap"), {
  ssr: false,
  loading: () => <MapBox>Memuat peta...</MapBox>,
});

function MapBox({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center bg-subtle text-sm text-ink-2">{children}</div>;
}

/**
 * - Perangkat normal: peta dimuat otomatis saat terlihat di layar.
 * - HP RAM kecil / hemat data: peta baru dimuat jika user menekan tombol.
 */
export function MiniMapLazy({ points }: { points: MapPoint[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const manual = useLowEndDevice();

  useEffect(() => {
    if (manual) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, [manual]);

  if (points.length === 0) return null;

  return (
    <div ref={box} className="h-56 overflow-hidden rounded-lg border border-line">
      {show ? (
        <MiniMap points={points} />
      ) : (
        <MapBox>
          {manual ? (
            <button onClick={() => setShow(true)} className="flex items-center gap-1 rounded-full border border-line bg-surface px-4 py-2 hover:border-brand">
              <MapPin size={16} aria-hidden /> Tampilkan peta
            </button>
          ) : (
            "Peta"
          )}
        </MapBox>
      )}
    </div>
  );
}
