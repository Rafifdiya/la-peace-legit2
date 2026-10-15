"use server";

import { updateTag } from "next/cache";
import { MAKS_IKLAN_AKTIF } from "@/lib/iklan";
import { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Maks. 4 iklan aktif; iklan berikutnya harus menunggu salah satu dinonaktifkan
async function slotPenuh(supabase: Supabase) {
  const { count } = await supabase.from("iklan").select("id", { count: "exact", head: true }).eq("aktif", true);
  return (count ?? 0) >= MAKS_IKLAN_AKTIF;
}
const PESAN_PENUH = `Maksimal ${MAKS_IKLAN_AKTIF} iklan aktif. Nonaktifkan salah satu dulu.`;

export type HasilIklan = { ok?: boolean; error?: string } | undefined;

// Cek admin dilakukan di database (RLS tabel iklan & storage).
export async function tambahIklan(_prev: HasilIklan, form: FormData): Promise<HasilIklan> {
  const judul = String(form.get("judul") ?? "").trim();
  const link = String(form.get("link") ?? "").trim();
  const mediaUrl = String(form.get("mediaUrl") ?? "");
  const jenis = String(form.get("jenis") ?? "");
  if (judul.length < 2) return { error: "Judul minimal 2 huruf." };
  if (link && !/^https?:\/\//i.test(link)) return { error: "Link harus diawali http:// atau https://" };
  if (!mediaUrl || (jenis !== "foto" && jenis !== "video")) return { error: "Unggah foto atau video dulu." };

  const supabase = await createClient();
  if (await slotPenuh(supabase)) return { error: PESAN_PENUH };
  const { error } = await supabase.from("iklan").insert({ judul, link_url: link || null, media_url: mediaUrl, jenis });
  if (error) return { error: `Gagal menyimpan: ${error.message}` };
  updateTag("iklan");
  return { ok: true };
}

export async function setAktifIklan(id: string, aktif: boolean) {
  const supabase = await createClient();
  if (aktif && (await slotPenuh(supabase))) return { error: PESAN_PENUH };
  const { error } = await supabase.from("iklan").update({ aktif }).eq("id", id);
  if (error) return { error: error.message };
  updateTag("iklan");
}

export async function hapusIklan(id: string, mediaUrl: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("iklan").delete().eq("id", id);
  if (error) return { error: error.message };
  // Hapus file juga supaya storage tidak penuh
  const path = mediaUrl.split("/storage/v1/object/public/iklan/")[1];
  if (path) await supabase.storage.from("iklan").remove([decodeURIComponent(path)]);
  updateTag("iklan");
}
