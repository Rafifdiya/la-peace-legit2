import { Check } from "lucide-react";

/** 4 level kontributor, dihitung dari jumlah kontribusi yang disetujui admin. */
const LEVEL = [
  { min: 0, nama: "Pencicip" },
  { min: 5, nama: "Penjelajah" },
  { min: 10, nama: "Penjaga Resep" },
  { min: 20, nama: "Penjaga Warisan" },
];

/** Stepper level: titik - garis - titik. Level lewat = centang, level sekarang = bercincin. */
export function LevelKontributor({ jumlah, diriSendiri, admin }: { jumlah: number; diriSendiri: boolean; admin?: boolean }) {
  // Admin otomatis level tertinggi
  const kini = admin ? LEVEL.length - 1 : LEVEL.findLastIndex((l) => jumlah >= l.min);
  const berikut = LEVEL[kini + 1];
  // Isi garis menuju level berikutnya sesuai progres (mis. 7 dari 5→10 = 40%)
  const progres = berikut ? (jumlah - LEVEL[kini].min) / (berikut.min - LEVEL[kini].min) : 1;

  return (
    <section className="space-y-2 rounded-xl border border-line bg-surface px-3.5 py-3 [zoom:0.9]" aria-label="Level kontributor">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">
          Level profil: <span className="text-brand">{LEVEL[kini].nama}</span>
        </h2>
        <p className="text-sm text-ink-2">
          {admin
            ? "Admin otomatis level tertinggi"
            : berikut
            ? `${berikut.min - jumlah} kontribusi lagi menuju ${berikut.nama}`
            : diriSendiri ? "Level tertinggi. Terima kasih sudah menjaga warisan jajanan!" : "Level tertinggi"}
        </p>
      </div>

      <ol className="flex items-start px-3 sm:px-8">
        {LEVEL.map((l, i) => {
          const lewat = i < kini;
          const aktif = i === kini;
          return (
            <li key={l.nama} className={`flex items-start ${i < LEVEL.length - 1 ? "flex-1" : ""}`}>
              <div className="flex w-[3.2rem] shrink-0 flex-col items-center gap-0.5 text-center sm:w-16">
                <span
                  className={`flex h-[1.6rem] w-[1.6rem] items-center justify-center rounded-full font-semibold ${
                    lewat
                      ? "bg-brand text-white"
                      : aktif
                        ? "border-2 border-brand bg-surface text-brand"
                        : "bg-line text-white"
                  }`}
                >
                  {lewat ? <Check size={13} strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                <span className={`text-xs leading-tight sm:text-sm ${aktif ? "font-semibold text-ink" : "text-ink-2"}`}>{l.nama}</span>
                <span className="text-xs text-ink-2">{l.min === 0 ? "0" : `${l.min}+`}</span>
              </div>
              {i < LEVEL.length - 1 && (
                <div className="mt-[0.73rem] h-[2px] flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${i < kini ? 100 : i === kini ? progres * 100 : 0}%` }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
