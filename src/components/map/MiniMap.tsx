"use client";

// JANGAN impor file ini langsung. Pakai <MiniMapLazy> supaya Leaflet (~150 KB)
// hanya dimuat di browser dan hanya saat peta dibutuhkan.
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

export type MapPoint = { id: string; lat: number; lng: number; label: string };

export default function MiniMap({ points }: { points: MapPoint[] }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current || points.length === 0) return;
    const map = L.map(el.current, {
      preferCanvas: true, // gambar marker di canvas, lebih hemat memori dari banyak elemen DOM
      scrollWheelZoom: false,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "© OpenStreetMap",
      // Tile tidak di-load ulang saat zoom/geser berlangsung
      updateWhenZooming: false,
      updateWhenIdle: true,
      keepBuffer: 1,
    }).addTo(map);

    // circleMarker tidak butuh file gambar ikon
    const markers = points.map((p) =>
      L.circleMarker([p.lat, p.lng], { radius: 8, color: "#7a4a2a", fillColor: "#b5452b", fillOpacity: 0.9 })
        .bindTooltip(p.label)
        .addTo(map),
    );
    map.fitBounds(L.featureGroup(markers).getBounds(), { padding: [30, 30], maxZoom: 14 });

    // Bersihkan peta saat komponen hilang supaya memori dilepas
    return () => {
      map.remove();
    };
  }, [points]);

  return <div ref={el} className="h-full w-full" />;
}
