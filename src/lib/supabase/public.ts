import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase tanpa cookie/sesi, untuk membaca data publik (status approved).
 * Aman dipakai di fungsi "use cache" karena hasilnya sama untuk semua pengunjung.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
