"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adaKataKasar } from "@/lib/kata-kasar";
import { topikValid } from "@/lib/forum";

export type HasilTanya = { error?: string; ok?: string } | undefined;

async function userMasuk() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}

/** Buat postingan forum, lalu buka halamannya. */
export async function buatPertanyaan(_prev: HasilTanya, form: FormData): Promise<HasilTanya> {
  const judul = String(form.get("judul") ?? "").trim();
  const deskripsi = String(form.get("deskripsi") ?? "").trim();
  const provinsi = String(form.get("provinsi") ?? "");
  const topik = String(form.get("topik") ?? "");
  if (!topikValid(topik)) return { error: "Pilih topik dulu." };
  if (judul.length < 3 || judul.length > 100) return { error: "Judul 3-100 karakter." };
  if (adaKataKasar(judul, deskripsi)) return { error: "Postingan mengandung kata yang tidak pantas." };

  const { supabase, user } = await userMasuk();
  if (!user) return { error: "Masuk dulu untuk membuat postingan." };

  let province_id: number | null = null;
  if (provinsi) {
    const { data } = await supabase.from("provinces").select("id").eq("slug", provinsi).maybeSingle();
    province_id = data?.id ?? null;
  }
  const isi = { judul, deskripsi: deskripsi || null, province_id };
  let res = await supabase.from("requests").insert({ ...isi, topik }).select("id").single();
  // Kolom topik belum ada (migration 0017 belum dijalankan): simpan tanpa topik
  if (res.error?.code === "PGRST204" || res.error?.code === "42703") res = await supabase.from("requests").insert(isi).select("id").single();
  if (res.error) return { error: `Gagal mengirim: ${res.error.message}` };
  updateTag("request");
  redirect(`/request/${res.data.id}`);
}

/** Balas postingan; boleh menautkan jajanan yang sudah ada di katalog. */
export async function jawabPertanyaan(requestId: string, _prev: HasilTanya, form: FormData): Promise<HasilTanya> {
  const isi = String(form.get("isi") ?? "").trim();
  const slug = String(form.get("jajanan") ?? "");
  if (isi.length < 3 || isi.length > 1000) return { error: "Balasan 3-1000 karakter." };
  if (adaKataKasar(isi)) return { error: "Balasan mengandung kata yang tidak pantas." };

  const { supabase, user } = await userMasuk();
  if (!user) return { error: "Masuk dulu untuk membalas." };

  // Pemilik postingan baru boleh membalas setelah ada balasan dari orang lain
  const { data: post } = await supabase.from("requests").select("created_by, request_answers!request_answers_request_id_fkey (user_id)").eq("id", requestId).maybeSingle();
  if (post?.created_by === user.id && !post.request_answers.some((b: { user_id: string | null }) => b.user_id !== user.id)) {
    return { error: "Tunggu balasan dari orang lain dulu, lalu kamu bisa membalasnya." };
  }

  let snack_id: string | null = null;
  if (slug) {
    const { data } = await supabase.from("snacks").select("id").eq("slug", slug).eq("status", "approved").maybeSingle();
    snack_id = data?.id ?? null;
  }
  const { error } = await supabase.from("request_answers").insert({ request_id: requestId, isi, snack_id });
  if (error) return { error: `Gagal mengirim: ${error.message}` };
  updateTag("request");
  return { ok: "Balasan terkirim. Terima kasih!" };
}

/** Hapus postingan (pemilik / admin, dijaga RLS migration 0016). */
export async function hapusPostingan(id: string): Promise<HasilTanya> {
  const { supabase } = await userMasuk();
  const { error, count } = await supabase.from("requests").delete({ count: "exact" }).eq("id", id);
  if (error) return { error: error.message };
  if (!count) return { error: "Tidak bisa menghapus (bukan milikmu, atau migration 0016 belum dijalankan)." };
  updateTag("request");
  redirect("/request");
}

/** Hapus balasan (pemilik / admin). */
export async function hapusBalasan(id: string): Promise<HasilTanya> {
  const { supabase } = await userMasuk();
  const { error, count } = await supabase.from("request_answers").delete({ count: "exact" }).eq("id", id);
  if (error) return { error: error.message };
  if (!count) return { error: "Tidak bisa menghapus (bukan milikmu, atau migration 0016 belum dijalankan)." };
  updateTag("request");
}

/** Pemilik postingan memilih (atau membatalkan, answerId null) balasan terbaik. */
export async function pilihTerbaik(requestId: string, answerId: string | null): Promise<HasilTanya> {
  const { supabase } = await userMasuk();
  const { error } = await supabase.rpc("pilih_jawaban_terbaik", { p_request: requestId, p_answer: answerId });
  if (error) return { error: error.message };
  updateTag("request");
}

/** Laporkan postingan / balasan yang melanggar atau di luar tema. */
export async function laporkan(jenis: "forum_post" | "forum_reply", id: string, alasan: string): Promise<HasilTanya> {
  const teks = alasan.trim();
  if (teks.length < 3) return { error: "Tulis alasan singkat." };
  const { supabase, user } = await userMasuk();
  if (!user) return { error: "Masuk dulu untuk melapor." };
  const { error } = await supabase.from("reports").insert({ target_type: jenis, target_id: id, alasan: teks.slice(0, 300) });
  if (error) return { error: /check/i.test(error.message) ? "Jalankan migration 0017 dulu." : error.message };
  return { ok: "Terima kasih, laporan dikirim ke admin." };
}
