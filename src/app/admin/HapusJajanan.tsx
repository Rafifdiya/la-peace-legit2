"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hapusJajanan } from "./actions";

/**
 * Tombol hapus jajanan khusus admin. cekAdmin: tampil hanya bila yang membuka admin
 * (dipakai di halaman jajanan statis). sesudah: ke mana setelah terhapus.
 */
export function HapusJajanan({ kunci, nama, cekAdmin = false, sesudah }: { kunci: { id: string } | { slug: string }; nama: string; cekAdmin?: boolean; sesudah?: string }) {
  const router = useRouter();
  const [admin, setAdmin] = useState(!cekAdmin);
  const [pending, mulai] = useTransition();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!cekAdmin) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      setAdmin(p?.role === "admin");
    });
  }, [cekAdmin]);

  if (!admin) return null;
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          confirm(`Hapus "${nama}" beserta resep, foto, dan lokasinya? Tidak bisa dibatalkan.`) &&
          mulai(async () => {
            const r = await hapusJajanan(kunci);
            if (r?.error) return setError(r.error);
            if (sesudah) router.push(sesudah);
            else router.refresh();
          })
        }
        className="flex items-center gap-1 rounded-full border border-danger px-3 py-1 text-sm text-danger hover:bg-danger hover:text-white disabled:opacity-60"
      >
        <Trash2 size={14} aria-hidden /> {pending ? "Menghapus..." : "Hapus (admin)"}
      </button>
      {error && <span role="alert" className="text-xs text-danger">{error}</span>}
    </span>
  );
}
