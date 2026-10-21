"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

/** Salin link halaman ini ke clipboard. */
export function TombolBagikan() {
  const [tersalin, setTersalin] = useState(false);

  async function salin() {
    const url = window.location.href.split("#")[0];
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard diblokir (mis. bukan https): pakai cara lama
      window.prompt("Salin link ini:", url);
      return;
    }
    setTersalin(true);
    setTimeout(() => setTersalin(false), 2000);
  }

  return (
    <button type="button" onClick={salin} className="flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 hover:border-brand">
      {tersalin ? <Check size={14} className="text-accent" aria-hidden /> : <Share2 size={14} aria-hidden />}
      <span aria-live="polite">{tersalin ? "Link disalin" : "Bagikan"}</span>
    </button>
  );
}
