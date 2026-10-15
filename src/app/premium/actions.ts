"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type HasilPremium = { error?: string } | undefined;

// MODE DEMO: tanpa pembayaran. Status diubah lewat fungsi SQL (migration 0010).
export async function aktifkanPremium(): Promise<HasilPremium> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("aktifkan_premium_demo");
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
}

export async function batalkanPremium(): Promise<HasilPremium> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("batalkan_premium_demo");
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
}
