/** Pengaturan fitur per browser (localStorage). Bukan data penting, jadi aman bila hilang. */
export const EVENT_PENGATURAN = "jj:pengaturan-berubah";

export const PENGATURAN = {
  kurangiAnimasi: { kunci: "jj:set-kurangi-animasi", awal: false },
  bebasIklan: { kunci: "jj:set-bebas-iklan", awal: true },
  layarMenyala: { kunci: "jj:set-layar-menyala", awal: true },
  lencana: { kunci: "jj:set-lencana", awal: true },
} as const;

export type NamaPengaturan = keyof typeof PENGATURAN;

export function bacaPengaturan(nama: NamaPengaturan): boolean {
  const { kunci, awal } = PENGATURAN[nama];
  try {
    const v = localStorage.getItem(kunci);
    return v === null ? awal : v === "1";
  } catch {
    return awal;
  }
}

export function simpanPengaturan(nama: NamaPengaturan, nilai: boolean) {
  try { localStorage.setItem(PENGATURAN[nama].kunci, nilai ? "1" : "0"); } catch {}
  window.dispatchEvent(new Event(EVENT_PENGATURAN));
}

/** Ukuran teks: persen dari ukuran dasar web (normal). */
export const UKURAN_TEKS = [
  { nilai: "kecil", label: "Kecil", persen: 90 },
  { nilai: "normal", label: "Normal", persen: 100 },
  { nilai: "sedang", label: "Sedang", persen: 112 },
  { nilai: "besar", label: "Besar", persen: 120 },
] as const;

export type UkuranTeks = (typeof UKURAN_TEKS)[number]["nilai"];
const KUNCI_UKURAN = "jj:set-ukuran-teks";

export function bacaUkuranTeks(): UkuranTeks {
  try {
    const v = localStorage.getItem(KUNCI_UKURAN);
    if (UKURAN_TEKS.some((u) => u.nilai === v)) return v as UkuranTeks;
    // Pengaturan lama "Teks lebih besar" (saklar) = Sedang
    if (localStorage.getItem("jj:set-teks-besar") === "1") return "sedang";
  } catch {}
  return "normal";
}

export function simpanUkuranTeks(nilai: UkuranTeks) {
  try {
    localStorage.setItem(KUNCI_UKURAN, nilai);
    localStorage.removeItem("jj:set-teks-besar");
  } catch {}
  window.dispatchEvent(new Event(EVENT_PENGATURAN));
}
