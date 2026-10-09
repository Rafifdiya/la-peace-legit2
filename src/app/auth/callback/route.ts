import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Tujuan link di email. Tukar kode jadi sesi login, lalu kembali ke halaman asal.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  // Hanya izinkan path internal agar tidak bisa dipakai redirect ke situs lain.
  const tujuan = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${tujuan}`);
  }

  return NextResponse.redirect(`${origin}/masuk?error=link`);
}
