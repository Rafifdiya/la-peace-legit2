/** Pengaturan fitur per browser (localStorage). Bukan data penting, jadi aman bila hilang. */
export const EVENT_PENGATURAN = "jj:pengaturan-berubah";

export const PENGATURAN = {
  kurangiAnimasi: { kunci: "jj:set-kurangi-animasi", awal: false },
  teksBesar: { kunci: "jj:set-teks-besar", awal: false },
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
