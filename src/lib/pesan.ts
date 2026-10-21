/**
 * Pesan dibentuk dari status kiriman. Status "sudah dibaca" & "dihapus" disimpan
 * per browser (localStorage) per akun, cukup untuk titik merah di navbar.
 */
export const EVENT_PESAN = "jj:pesan-dibaca";
type Jenis = "dibaca" | "dihapus";
const kunci = (jenis: Jenis, userId: string) => `jj:pesan-${jenis}:${userId}`;

/** ID unik tiap pesan; status kiriman berubah = pesan baru (belum dibaca). */
export const idKiriman = (k: { id: string; status: string }) => `${k.id}:${k.status}`;
export const idModerasi = (n: number) => `moderasi:${n}`;
export const ID_SELAMAT_DATANG = "selamat-datang";
/** Postingan Forum Jajanan milik user; jumlah balasan bertambah = pesan baru. */
export const idTanya = (t: { id: string; jawaban: number }) => `tanya:${t.id}:${t.jawaban}`;
export type TanyaSaya = { id: string; judul: string; jawaban: number };
/** Baris Supabase `requests (id, judul, request_answers(count))` -> TanyaSaya */
export function keTanya(rows: { id: string; judul: string; request_answers: { count: number }[] }[] | null): TanyaSaya[] {
  return (rows ?? []).map((r) => ({ id: r.id, judul: r.judul, jawaban: r.request_answers[0]?.count ?? 0 }));
}

export function idPesan(kiriman: { id: string; status: string }[], menungguModerasi = 0, tanya: TanyaSaya[] = []): string[] {
  const ids = kiriman.filter((k) => k.status !== "hidden").map(idKiriman);
  ids.push(...tanya.filter((t) => t.jawaban > 0).map(idTanya));
  if (menungguModerasi > 0) ids.push(idModerasi(menungguModerasi));
  ids.push(ID_SELAMAT_DATANG);
  return ids;
}

function baca(jenis: Jenis, userId: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(kunci(jenis, userId)) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

/** Pesan yang dihapus juga dihitung sudah dibaca. */
export const bacaDibaca = (userId: string) => new Set([...baca("dibaca", userId), ...baca("dihapus", userId)]);
export const bacaDihapus = (userId: string) => baca("dihapus", userId);

export function tandai(jenis: Jenis, userId: string, ids: string[]) {
  try {
    const s = baca(jenis, userId);
    ids.forEach((id) => s.add(id));
    localStorage.setItem(kunci(jenis, userId), JSON.stringify([...s]));
  } catch {}
  window.dispatchEvent(new Event(EVENT_PESAN));
}
