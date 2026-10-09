import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Hapus header "x-powered-by" (sedikit lebih hemat & aman)
  poweredByHeader: false,
  images: {
    // AVIF paling kecil, WebP sebagai cadangan
    formats: ["image/avif", "image/webp"],
    // Kualitas yang diizinkan: 60 untuk thumbnail, 75 untuk foto utama
    qualities: [60, 75],
    // Ukuran layar dipangkas supaya varian gambar tidak terlalu banyak
    deviceSizes: [360, 640, 828, 1080, 1280],
    imageSizes: [96, 160, 256, 384],
    // Cache gambar hasil optimasi 30 hari
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      // Supabase Storage (diisi nanti saat disambung)
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/**" },
    ],
  },
  experimental: {
    // Hanya impor ikon yang dipakai
    optimizePackageImports: ["lucide-react"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
