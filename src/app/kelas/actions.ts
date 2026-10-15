"use server";

import { createClient } from "@/lib/supabase/server";

export type HasilMinat = { ok?: boolean; error?: string } | undefined;

export async function daftarMinat(_prev: HasilMinat, form: FormData): Promise<HasilMinat> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const jajanan = String(form.get("jajanan") ?? "").trim().slice(0, 100);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Email tidak valid." };

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("minat_kelas")
    .insert({ email, jajanan: jajanan || null, user_id: data.user?.id ?? null });
  // 23505 = email sudah terdaftar: tetap dianggap berhasil
  if (error && error.code !== "23505") return { error: "Gagal menyimpan. Coba lagi." };
  return { ok: true };
}
