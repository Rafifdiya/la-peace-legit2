"use client";

import { openLogin } from "./LoginDialog";

/** Tombol yang membuka overlay Masuk. Dipakai untuk aksi yang butuh login. */
export function LoginButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={openLogin} className={className}>
      {children}
    </button>
  );
}
