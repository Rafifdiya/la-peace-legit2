"use server";

import { updateTag } from "next/cache";

/** Segarkan cache halaman jajanan & katalog setelah vote / edit dari browser. */
export async function segarkanJajanan() {
  updateTag("jajanan");
}
