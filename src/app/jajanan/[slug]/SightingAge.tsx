"use client";

import { useSyncExternalStore } from "react";

const ENAM_BULAN = 1000 * 60 * 60 * 24 * 182;
const noopSubscribe = () => () => {};

/** "Dikonfirmasi Sep 2026", ditandai jika lebih dari 6 bulan lalu (dihitung di browser) */
export function SightingAge({ tanggal }: { tanggal: string }) {
  const lama = useSyncExternalStore(
    noopSubscribe,
    () => Date.now() - new Date(tanggal).getTime() > ENAM_BULAN,
    () => false,
  );

  const teks = new Date(tanggal).toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  return (
    <span className={lama ? "text-danger" : "text-ink-2"}>
      Dikonfirmasi {teks}
      {lama && " · perlu dicek ulang"}
    </span>
  );
}
