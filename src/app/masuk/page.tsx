import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Masuk" };

export default function MasukPage() {
  return <ComingSoon judul="Masuk" catatan="Login Google/email menyusul setelah Supabase disambung." />;
}
