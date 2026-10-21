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

/** Admin menghapus jajanan beserta resep, foto, lokasi, vote (cascade). RLS: "admin hapus jajanan". */
export async function hapusJajanan(kunci: { id: string } | { slug: string }): Promise<HasilAksi> {
  const supabase = await createClient();
  const [kolom, nilai] = "id" in kunci ? ["id", kunci.id] : ["slug", kunci.slug];
  const { error, count } = await supabase.from("snacks").delete({ count: "exact" }).eq(kolom, nilai);
  if (error) return { error: error.message };
  if (!count) return { error: "Gagal menghapus (hanya pengirim atau admin; pengirim butuh migration 0021)." };
  updateTag("jajanan");
}

/** Admin mengganti foto utama jajanan (foto sudah diunggah dari browser ke bucket "foto"). */
export async function gantiFotoJajanan(slug: string, url: string): Promise<HasilAksi> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_ganti_foto", { p_slug: slug, p_url: url });
  if (error) return { error: /admin_ganti_foto/.test(error.message) ? "Jalankan migration 0018 dulu." : error.message };
  updateTag("jajanan");
}
