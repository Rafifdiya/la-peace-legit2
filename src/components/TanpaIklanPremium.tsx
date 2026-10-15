"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { bacaPengaturan } from "@/lib/pengaturan";

export const EVENT_PREMIUM = "jj:premium-berubah";
/** Admin bisa memilih tetap melihat iklan (cek tampilan sponsor), disimpan per browser */
export const KUNCI_LIHAT_IKLAN = "jj:admin-lihat-iklan";

/**
 * Status bebas iklan di browser (halaman statis, jadi dicek di sisi klien).
 * undefined = masih dicek, true = Premium/admin (bebas iklan), false = tampilkan iklan.
 */
export function useBebasIklan() {
  const [premium, setPremium] = useState<boolean>();

  useEffect(() => {
    const supabase = createClient();
    async function cek(userId: string | undefined) {
      if (!userId) return setPremium(false);
      const { data } = await supabase.from("profiles").select("role, premium_sampai").eq("id", userId).maybeSingle();
      if (data?.role === "admin") {
        // Admin otomatis Premium, kecuali memilih "Tampilkan iklan untuk saya"
        let lihat = false;
        try { lihat = localStorage.getItem(KUNCI_LIHAT_IKLAN) === "1"; } catch {}
        return setPremium(!lihat);
      }
      // Premium bisa memilih tetap melihat iklan di /pengaturan
      setPremium(!!data?.premium_sampai && new Date(data.premium_sampai) > new Date() && bacaPengaturan("bebasIklan"));
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      cek(session?.user.id);
    });
    // Dipicu tombol di /premium setelah premium diaktifkan / dibatalkan
    const ulang = () => supabase.auth.getUser().then(({ data }) => cek(data.user?.id));
    window.addEventListener(EVENT_PREMIUM, ulang);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener(EVENT_PREMIUM, ulang);
    };
  }, []);

  return premium;
}

/** Status Premium murni (admin otomatis Premium), tanpa memperhitungkan pengaturan iklan. */
export function usePremium() {
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function cek(userId: string | undefined) {
      if (!userId) return setPremium(false);
      const { data } = await supabase.from("profiles").select("role, premium_sampai").eq("id", userId).maybeSingle();
      setPremium(data?.role === "admin" || (!!data?.premium_sampai && new Date(data.premium_sampai) > new Date()));
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      cek(session?.user.id);
    });
    const ulang = () => supabase.auth.getUser().then(({ data }) => cek(data.user?.id));
    window.addEventListener(EVENT_PREMIUM, ulang);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener(EVENT_PREMIUM, ulang);
    };
  }, []);

  return premium;
}

/** Bungkus slot iklan sidebar: akun Premium melihat tautan "bebas iklan" sebagai gantinya. */
export function TanpaIklanPremium({ children }: { children: React.ReactNode }) {
  const premium = useBebasIklan();
  if (!premium) return <>{children}</>;
  return (
    <Link href="/premium" className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-orange-500/10 p-3 text-sm font-semibold text-brand">
      <Crown size={16} aria-hidden /> Premium: bebas iklan
    </Link>
  );
}
