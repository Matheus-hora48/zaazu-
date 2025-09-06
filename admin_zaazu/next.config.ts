import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["img.youtube.com", "firebasestorage.googleapis.com"],
  },
  async rewrites() {
    return [
      {
        source: '/flutter_service_worker.js',
        destination: '/flutter_service_worker.js',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/flutter_service_worker.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
