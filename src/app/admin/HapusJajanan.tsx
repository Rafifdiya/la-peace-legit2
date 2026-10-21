"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hapusJajanan } from "./actions";

/**
 * Tombol hapus jajanan untuk admin atau pengirimnya sendiri.
 * cekAdmin: tampil hanya bila yang membuka admin / pengirim (dipakai di halaman jajanan statis).
 * label: teks tombol bila tidak dicek (default "Hapus (admin)"). sesudah: ke mana setelah terhapus.
 */
export function HapusJajanan({ kunci, nama, cekAdmin = false, sesudah, label = "Hapus (admin)" }: { kunci: { id: string } | { slug: string }; nama: string; cekAdmin?: boolean; sesudah?: string; label?: string }) {
  const router = useRouter();
  const [teks, setTeks] = useState<string | null>(cekAdmin ? null : label);
  const [pending, mulai] = useTransition();
  const [error, setError] = useState<string>();

  const [kolom, nilai] = "id" in kunci ? ["id", kunci.id] : ["slug", kunci.slug];

  useEffect(() => {
    if (!cekAdmin) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle(),
        supabase.from("snacks").select("created_by").eq(kolom, nilai).maybeSingle(),
      ]);
      if (s?.created_by === data.user.id) setTeks("Hapus");
      else if (p?.role === "admin") setTeks("Hapus (admin)");
    });
  }, [cekAdmin, kolom, nilai]);

  if (!teks) return null;
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          confirm(`Hapus "${nama}" beserta resep, foto, lokasi, vote, komentar, dan laporan "sudah coba" dari orang lain? Tidak bisa dibatalkan.`) &&
          mulai(async () => {
            const r = await hapusJajanan(kunci);
            if (r?.error) return setError(r.error);
            if (sesudah) router.push(sesudah);
            else router.refresh();
          })
        }
        className="flex items-center gap-1 rounded-full border border-danger px-3 py-1 text-sm text-danger hover:bg-danger hover:text-white disabled:opacity-60"
      >
        <Trash2 size={14} aria-hidden /> {pending ? "Menghapus..." : teks}
      </button>
      {error && <span role="alert" className="text-xs text-danger">{error}</span>}
    </span>
  );
}
