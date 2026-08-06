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
};

export default nextConfig;
