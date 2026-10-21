"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

const KUNCI = "jj:sidebar-tutup";

/** Simpan & terapkan status sidebar (atribut data-sidebar di <html>, dibaca CSS). */
function atur(tutup: boolean) {
  if (tutup) document.documentElement.dataset.sidebar = "tutup";
  else delete document.documentElement.dataset.sidebar;
  try {
    if (tutup) localStorage.setItem(KUNCI, "1");
    else localStorage.removeItem(KUNCI);
  } catch {}
}

/** Dipasang di <body> sebelum sidebar: terapkan status tersimpan sebelum tampil (tanpa kedip). */
export const SKRIP_SIDEBAR = `try{if(localStorage.getItem("${KUNCI}")==="1")document.documentElement.dataset.sidebar="tutup"}catch(e){}`;

/** Tombol tutup di dalam sidebar */
export function TutupSidebar() {
  return (
    <button type="button" onClick={() => atur(true)} aria-label="Tutup sidebar" title="Tutup sidebar" className="rounded-md p-2 text-ink-2 hover:bg-subtle hover:text-ink">
      <PanelLeftClose size={26} aria-hidden />
    </button>
  );
}

/** Tombol buka di navbar, hanya tampil saat sidebar tertutup (lihat .buka-sidebar di globals.css) */
export function BukaSidebar() {
  return (
    <button type="button" onClick={() => atur(false)} aria-label="Buka sidebar" title="Buka sidebar" className="buka-sidebar items-center rounded-md p-2 text-ink-2 hover:bg-subtle hover:text-ink">
      <PanelLeftOpen size={24} aria-hidden />
    </button>
  );
}
