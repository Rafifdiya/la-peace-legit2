"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EVENT_PREMIUM } from "@/components/TanpaIklanPremium";
import { aktifkanPremium, batalkanPremium } from "./actions";

export function PremiumButton({ aktif }: { aktif: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const router = useRouter();

  function klik() {
    setError(undefined);
    start(async () => {
      const res = await (aktif ? batalkanPremium() : aktifkanPremium());
      if (res?.error) return setError(res.error);
      window.dispatchEvent(new Event(EVENT_PREMIUM));
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <button
        onClick={klik}
        disabled={pending}
        className={
          aktif
            ? "w-full rounded-full border border-line py-2.5 hover:border-danger hover:text-danger disabled:opacity-60"
            : "w-full rounded-full bg-brand py-2.5 font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
        }
      >
        {pending ? "Memproses..." : aktif ? "Batalkan Premium (demo)" : "Coba Premium 30 hari (demo)"}
      </button>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}
