import type { NextRequest } from "next/server";
import { getSnackPage, type SnackFilter } from "@/lib/data";

// GET /api/jajanan?page=2&q=&provinsi=&kategori=&urut=
// Dipakai infinite scroll katalog untuk mengambil halaman berikutnya.
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const page = Math.max(1, Number(p.get("page")) || 1);
  const filter: SnackFilter = {
    q: p.get("q") ?? undefined,
    provinsi: p.get("provinsi") ?? undefined,
    kategori: p.get("kategori") ?? undefined,
    urut: (p.get("urut") as SnackFilter["urut"]) ?? undefined,
  };
  return Response.json(await getSnackPage(filter, page));
}
