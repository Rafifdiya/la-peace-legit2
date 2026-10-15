"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function HapusKoleksi({ id, nama }: { id: string; nama: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Hapus koleksi "${nama}"? Jajanan tetap tersimpan.`)) return;
        start(async () => {
          await createClient().from("collections").delete().eq("id", id);
          router.push("/profil/saya?tab=tersimpan");
          router.refresh();
        });
      }}
      className="text-sm text-danger underline disabled:opacity-60"
    >
      Hapus koleksi
    </button>
  );
}
