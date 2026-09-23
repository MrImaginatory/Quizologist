import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['pin-waterproof-driven-municipality.trycloudflare.com'],

  // Enable response compression
  compress: true,

  // Optimize image delivery
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Enable React strict mode for better development warnings
  reactStrictMode: true,

  async headers() {
    return [
      {
        // HIGH-03: never expose join tokens (or any URL) via Referer headers
        source: "/(.*)",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default nextConfig;
