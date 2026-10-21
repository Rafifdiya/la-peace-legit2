"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { segarkanJajanan } from "@/app/jajanan/actions";
import type { Rarity } from "@/lib/types";
import { RarityBadge } from "./RarityBadge";
import { openLogin } from "./LoginDialog";

const PILIHAN = [
  { nilai: "umum", label: "Umum" },
  { nilai: "mulai_langka", label: "Mulai langka" },
  { nilai: "hampir_punah", label: "Hampir punah" },
  { nilai: "punah", label: "Punah" },
] as const;

type Nilai = (typeof PILIHAN)[number]["nilai"];
const MIN_SUARA = 3;

/** Label = suara terbanyak (seri: yang lebih langka), sama seperti view snack_rarity. */
function hitung(votes: Nilai[]) {
  const jumlah = Object.fromEntries(PILIHAN.map((p) => [p.nilai, 0])) as Record<Nilai, number>;
  for (const v of votes) jumlah[v]++;
  let label: Nilai = "umum";
  for (const p of PILIHAN) if (jumlah[p.nilai] >= jumlah[label]) label = p.nilai;
  return { jumlah, label, total: votes.length };
}

/**
 * Vote kelangkaan: 1 akun 1 suara (bisa diganti / dibatalkan).
 * Halaman detail statis, jadi angka terbaru diambil di browser.
 */
export function VoteKelangkaan({ slug, rarity, jumlahVote }: { slug: string; rarity: Rarity; jumlahVote: number }) {
  const supabase = createClient();
  const [snackId, setSnackId] = useState<string>();
  const [userId, setUserId] = useState<string | null>();
  const [votes, setVotes] = useState<{ user_id: string; nilai: Nilai }[]>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const muat = useCallback(async (id: string) => {
    const { data } = await supabase.from("rarity_votes").select("user_id, nilai").eq("snack_id", id);
    setVotes((data as { user_id: string; nilai: Nilai }[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    (async () => {
      const [{ data: auth }, { data: snack }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("snacks").select("id").eq("slug", slug).maybeSingle(),
      ]);
      setUserId(auth.user?.id ?? null);
      if (snack) {
        setSnackId(snack.id);
        await muat(snack.id);
      }
    })();
  }, [slug, supabase, muat]);

  const h = votes && hitung(votes.map((v) => v.nilai));
  const pilihanku = votes?.find((v) => v.user_id === userId)?.nilai;
  // Sebelum data browser siap, pakai angka dari halaman statis
  const total = h?.total ?? jumlahVote;
  const label: Rarity = h ? h.label : rarity;

  async function vote(nilai: Nilai) {
    if (!userId) return openLogin();
    if (!snackId || busy) return;
    setBusy(true);
    setError("");
    const { error: err } = pilihanku === nilai
      ? await supabase.from("rarity_votes").delete().eq("snack_id", snackId).eq("user_id", userId)
      : await supabase.from("rarity_votes").upsert(
          { snack_id: snackId, user_id: userId, nilai, updated_at: new Date().toISOString() },
          { onConflict: "user_id,snack_id" },
        );
    if (err) setError(`Gagal menyimpan suara: ${err.message}`);
    await muat(snackId);
    setBusy(false);
    segarkanJajanan();
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <RarityBadge rarity={label} jumlahVote={total} />
        <span className="text-sm text-ink-2">{total} suara</span>
      </div>
      <div className="rounded-lg border border-line bg-surface p-4 text-sm">
        <p className="font-semibold">Menurutmu seberapa langka?</p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Vote kelangkaan">
          {PILIHAN.map((p) => {
            const aktif = pilihanku === p.nilai;
            return (
              <button
                key={p.nilai}
                type="button"
                onClick={() => vote(p.nilai)}
                disabled={busy}
                aria-pressed={aktif}
                className={`rounded-full border px-3 py-1 transition-colors disabled:opacity-60 ${aktif ? "border-brand bg-brand text-white" : "border-line hover:border-brand"}`}
              >
                {p.label}
                {h && h.jumlah[p.nilai] > 0 && <span className={`ml-1 ${aktif ? "text-white/80" : "text-ink-2"}`}>{h.jumlah[p.nilai]}</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-ink-2">
          {total < MIN_SUARA
            ? `Label tampil setelah ${MIN_SUARA} suara (kurang ${MIN_SUARA - total}).`
            : "Label = pilihan terbanyak."}
          {pilihanku && " Klik pilihanmu lagi untuk membatalkan."}
        </p>
        {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    </>
  );
}
