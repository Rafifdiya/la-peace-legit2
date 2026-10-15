import { getIklanAktif } from "@/lib/iklan";
import { SlideIklan } from "./SlideIklan";

const kotak = "mt-auto";

/** Slot sponsor di bawah sidebar: maks. 6 iklan aktif bergantian, atau placeholder bila belum ada. */
export async function SlotIklan() {
  const iklan = await getIklanAktif();
  if (iklan.length === 0) return <PlaceholderIklan />;
  return (
    <aside aria-label="Sponsor" className={kotak}>
      <SlideIklan iklan={iklan} />
    </aside>
  );
}

export function PlaceholderIklan() {
  return (
    <aside aria-label="Sponsor" className={`${kotak} space-y-2 border-2 border-dashed border-line bg-page p-4 text-center`}>
      <div className="flex aspect-[4/3] items-center justify-center bg-subtle font-hand text-2xl text-brand/70">
        Ruang iklan
      </div>
      <p className="text-sm text-ink-2">Brand bahan kue lokal? Pasang di sini.</p>
    </aside>
  );
}
