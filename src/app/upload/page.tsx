import type { Metadata } from "next";
import { getCategories, getProvinces } from "@/lib/data";
import { UploadForm } from "./UploadForm";

export const metadata: Metadata = { title: "Kontribusi" };

// Form kontribusi 7 langkah (docs/03 Flow B). Data referensi dari server, sisanya di browser.
export default async function UploadPage() {
  const [provinsi, kategori] = await Promise.all([getProvinces(), getCategories()]);
  return <UploadForm provinsi={provinsi} kategori={kategori} />;
}
