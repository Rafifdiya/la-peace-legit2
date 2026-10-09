// Kompres foto di browser SEBELUM upload ke Supabase Storage.
// Foto HP 4-8 MB jadi ~200-300 KB: upload cepat, storage hemat, halaman ringan.
import { isLowEndDevice } from "./device";

export type CompressResult = { file: File; sebelumKB: number; sesudahKB: number };

const MAX_INPUT_MB = 15;

export async function compressImage(file: File): Promise<CompressResult> {
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar.");
  if (file.size > MAX_INPUT_MB * 1024 * 1024) throw new Error(`Ukuran foto maksimal ${MAX_INPUT_MB} MB.`);

  // Library baru dimuat saat dibutuhkan (tidak membebani halaman lain)
  const { default: imageCompression } = await import("browser-image-compression");
  const lowEnd = isLowEndDevice();

  const hasil = await imageCompression(file, {
    maxSizeMB: 0.3,
    // HP RAM kecil: resolusi lebih kecil supaya proses tidak kehabisan memori
    maxWidthOrHeight: lowEnd ? 1080 : 1280,
    initialQuality: 0.8,
    fileType: "image/webp",
    // Proses di Web Worker agar UI tidak macet
    useWebWorker: true,
  });

  const nama = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return {
    file: new File([hasil], nama, { type: "image/webp" }),
    sebelumKB: Math.round(file.size / 1024),
    sesudahKB: Math.round(hasil.size / 1024),
  };
}
