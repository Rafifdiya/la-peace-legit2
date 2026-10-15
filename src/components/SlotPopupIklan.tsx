import { getIklanAktif } from "@/lib/iklan";
import { PopupIklan } from "./PopupIklan";

/** Ambil iklan aktif (cache) untuk pop-up harian di layout. */
export async function SlotPopupIklan() {
  const iklan = await getIklanAktif();
  return iklan.length > 0 ? <PopupIklan iklan={iklan} /> : null;
}
