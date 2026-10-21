"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { openLogin } from "./LoginDialog";

type State = { snackId: string; tersimpan: boolean };

const btn = "flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 hover:border-brand disabled:opacity-60";

/** Tombol Simpan di halaman detail (halaman statis, jadi status dicek di browser). Tersimpan tampil di profil. */
export function SimpanButton({ slug }: { slug: string }) {
  const [state, setState] = useState<State | null>();
  const [busy, setBusy] = useState(false);
  const [pesan, setPesan] = useState<string>();

  async function muat() {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return setState(null);
    const { data: snack } = await supabase.from("snacks").select("id").eq("slug", slug).maybeSingle();
    if (!snack) return setState(null);
    const { data: save } = await supabase.from("saves").select("snack_id").eq("snack_id", snack.id).maybeSingle();
    setState({ snackId: snack.id, tersimpan: !!save });
  }

  useEffect(() => {
    // Muat status awal; muat() hanya memanggil setState setelah data datang
    // eslint-disable-next-line react-hooks/set-state-in-effect
    muat();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state === undefined) {
    return <span className={`${btn} opacity-60`}><Bookmark size={14} aria-hidden /> Simpan</span>;
  }
  if (state === null) {
    return (
      <button type="button" onClick={openLogin} className={btn}>
        <Bookmark size={14} aria-hidden /> Simpan
      </button>
    );
  }

  async function toggle() {
    if (!state) return;
    setBusy(true);
    setPesan(undefined);
    const supabase = createClient();
    const { error } = state.tersimpan
      ? await supabase.from("saves").delete().eq("snack_id", state.snackId)
      : await supabase.from("saves").insert({ snack_id: state.snackId });
    if (error) setPesan(error.message);
    await muat();
    setBusy(false);
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={toggle} disabled={busy} aria-pressed={state.tersimpan} className={`${btn} ${state.tersimpan ? "border-brand text-brand" : ""}`}>
        {state.tersimpan ? <BookmarkCheck size={14} aria-hidden /> : <Bookmark size={14} aria-hidden />}
        {state.tersimpan ? "Tersimpan" : "Simpan"}
      </button>
      {pesan && <span role="alert" className="text-xs text-danger">{pesan}</span>}
    </span>
  );
}
