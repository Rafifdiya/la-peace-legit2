"use server";

import { updateTag } from "next/cache";

// Dipanggil setelah profil diubah dari browser: profil publik (cache) ikut diperbarui.
export async function segarkanProfil() {
  updateTag("profil");
}
