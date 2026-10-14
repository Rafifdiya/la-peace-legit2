"use server";

import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type HasilAksi = { error?: string } | undefined;

// Cek admin juga dilakukan di database (fungsi moderasi_jajanan + RLS).
async function moderasi(id: string, aksi: "approve" | "reject", alasan?: string): Promise<HasilAksi> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("moderasi_jajanan", { p_snack: id, p_aksi: aksi, p_alasan: alasan ?? null });
  if (error) return { error: error.message };
  // Katalog & beranda langsung menampilkan hasil moderasi
  updateTag("jajanan");
}

export async function setujui(id: string) {
  return moderasi(id, "approve");
}

export async function tolak(id: string, _prev: HasilAksi, form: FormData) {
  const alasan = String(form.get("alasan") ?? "").trim();
  if (!alasan) return { error: "Alasan wajib diisi." };
  return moderasi(id, "reject", alasan);
}
