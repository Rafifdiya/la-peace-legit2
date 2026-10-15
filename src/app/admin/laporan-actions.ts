"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type HasilLaporan = { error?: string } | undefined;

async function selesai(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reports").update({ status: "resolved" }).eq("id", id);
  return error;
}

/** Abaikan laporan (konten tetap). */
export async function abaikanLaporan(id: string): Promise<HasilLaporan> {
  const error = await selesai(id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
}

/** Hapus konten forum yang dilaporkan, lalu tandai laporan selesai. */
export async function hapusKontenForum(id: string, jenis: string, targetId: string): Promise<HasilLaporan> {
  const tabel = jenis === "forum_post" ? "requests" : jenis === "forum_reply" ? "request_answers" : null;
  if (!tabel) return { error: "Jenis konten ini belum bisa dihapus dari sini." };
  const supabase = await createClient();
  const { error } = await supabase.from(tabel).delete().eq("id", targetId);
  if (error) return { error: error.message };
  const e2 = await selesai(id);
  if (e2) return { error: e2.message };
  updateTag("request");
  revalidatePath("/admin");
}
