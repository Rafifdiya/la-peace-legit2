"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SnackCard } from "@/components/SnackCard";
import type { Page, SnackCardData } from "@/lib/types";

type Props = {
  initial: Page<SnackCardData>;
  /** Query string filter aktif, mis. "q=klepon&provinsi=jawa-barat" */
  query: string;
};

// Halaman 1 sudah dirender server. Halaman berikutnya diambil saat user
// mendekati bawah daftar (IntersectionObserver) atau menekan "Muat lagi".
export function InfiniteList({ initial, query }: Props) {
  const [items, setItems] = useState(initial.items);
  const [nextPage, setNextPage] = useState(initial.nextPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (!nextPage || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/jajanan?page=${nextPage}${query ? `&${query}` : ""}`);
      if (!res.ok) throw new Error();
      const data: Page<SnackCardData> = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setNextPage(data.nextPage);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [nextPage, loading, query]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !nextPage || error) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && loadMore(), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, nextPage, error]);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <SnackCard key={s.slug} snack={s} />
        ))}
      </div>
      <div ref={sentinel} className="flex justify-center py-8">
        {nextPage ? (
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border border-line bg-surface px-5 py-2 text-sm hover:border-brand disabled:opacity-60"
          >
            {loading ? "Memuat..." : error ? "Gagal memuat, coba lagi" : "Muat lagi"}
          </button>
        ) : (
          items.length > 0 && <p className="text-sm text-ink-2">Semua jajanan sudah ditampilkan.</p>
        )}
      </div>
    </>
  );
}
