/** Pencarian forum sederhana di browser: skor kemiripan per postingan, tanpa server. */

export type TeksCari = { judul: string; isi: string; lain: string };

const rapikan = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, " ");

/** Pecah kata kunci; kata 1 huruf diabaikan. */
export function kataKunci(q: string): string[] {
  return [...new Set(rapikan(q).split(/\s+/).filter((k) => k.length >= 2))];
}

/** Skor kemiripan: judul paling berat, lalu isi, lalu topik/daerah/pengirim; bonus bila semua kata ketemu. */
export function skor(t: TeksCari, kata: string[]): number {
  if (kata.length === 0) return 0;
  const judul = ` ${rapikan(t.judul)}`;
  const isi = ` ${rapikan(t.isi)}`;
  const lain = ` ${rapikan(t.lain)}`;
  let total = 0;
  let ketemu = 0;
  for (const k of kata) {
    let s = 0;
    if (judul.includes(k)) s += judul.includes(` ${k}`) ? 7 : 5; // awal kata lebih relevan
    if (isi.includes(k)) s += isi.includes(` ${k}`) ? 3 : 2;
    if (lain.includes(k)) s += 1;
    if (s > 0) ketemu++;
    total += s;
  }
  if (ketemu === kata.length && kata.length > 1) total += 3;
  return total;
}

/** Urutkan item dari yang paling mirip; yang tidak cocok sama sekali dibuang. */
export function cariMirip<T extends { teks: TeksCari }>(items: T[], q: string): T[] {
  const kata = kataKunci(q);
  return items
    .map((item, i) => ({ item, i, n: skor(item.teks, kata) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || a.i - b.i)
    .map((x) => x.item);
}
