"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LoginButton } from "./LoginButton";

type Status = { masuk: boolean; admin: boolean } | null;

/** Bagian navbar yang bergantung login: tombol Masuk, atau link Profil/Admin + Keluar. */
export function AuthNav() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    const supabase = createClient();

    async function muat(userId: string | undefined) {
      if (!userId) return setStatus({ masuk: false, admin: false });
      const { data } = await supabase.from("profiles").select("role").eq("id", userId).single();
      setStatus({ masuk: true, admin: data?.role === "admin" });
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      muat(session?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function keluar() {
    await createClient().auth.signOut();
    router.refresh();
  }

  // Selama cek sesi, sisakan ruang kosong agar navbar tidak bergeser.
  if (!status) return <span className="ml-auto w-14 sm:ml-0" aria-hidden />;

  if (!status.masuk) {
    return <LoginButton className="ml-auto text-sm hover:text-brand sm:ml-0">Masuk</LoginButton>;
  }

  return (
    <div className="ml-auto flex items-center gap-4 text-sm sm:ml-0">
      {status.admin && (
        <Link href="/admin" className="hover:text-brand">
          Admin
        </Link>
      )}
      <button type="button" onClick={keluar} className="hover:text-brand">
        Keluar
      </button>
      <Link href="/profil/saya" aria-label="Profil saya" className="hidden rounded-full bg-subtle p-2 hover:text-brand md:block">
        <UserRound size={18} />
      </Link>
    </div>
  );
}
