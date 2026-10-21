"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Tombol Edit, hanya tampil untuk pengirim jajanan ini. */
export function TombolEditJajanan({ slug }: { slug: string }) {
  const [milikku, setMilikku] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase.from("snacks").select("created_by").eq("slug", slug).maybeSingle();
      setMilikku(data?.created_by === auth.user.id);
    })();
  }, [slug]);

  if (!milikku) return null;
  return (
    <Link href={`/edit-kontribusi?slug=${slug}`} className="flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 hover:border-brand">
      <Pencil size={14} aria-hidden /> Edit
    </Link>
  );
}
