import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Request" };

export default function RequestPage() {
  return <ComingSoon judul="Request Jajanan" catatan="Halaman ini sedang dibuat (template dasar)." />;
}
