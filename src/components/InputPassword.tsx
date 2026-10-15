"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Input password dengan tombol mata untuk tampilkan / sembunyikan. */
export function InputPassword({ className = "", ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [lihat, setLihat] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={lihat ? "text" : "password"} className={`${className} pr-10`} />
      <button
        type="button"
        onClick={() => setLihat(!lihat)}
        aria-label={lihat ? "Sembunyikan password" : "Tampilkan password"}
        aria-pressed={lihat}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-2 hover:text-brand"
      >
        {lihat ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
      </button>
    </div>
  );
}
