// Deteksi perangkat lemah / mode hemat data. Hanya dipanggil di browser.
import { useSyncExternalStore } from "react";
type NavigatorExtra = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

/** true jika RAM <= 2 GB, CPU <= 4 core, atau user menyalakan hemat data / sinyal 2G-3G */
export function isLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as NavigatorExtra;
  const ramKecil = nav.deviceMemory !== undefined && nav.deviceMemory <= 2;
  const cpuLemah = nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4;
  const hematData = nav.connection?.saveData === true || /2g|3g/.test(nav.connection?.effectiveType ?? "");
  return ramKecil || hematData || (cpuLemah && (nav.deviceMemory ?? 4) <= 4);
}

/** Hook React: server selalu false, browser membaca kondisi perangkat (tanpa setState di effect) */
export function useLowEndDevice(): boolean {
  return useSyncExternalStore(noopSubscribe, isLowEndDevice, () => false);
}

const noopSubscribe = () => () => {};
