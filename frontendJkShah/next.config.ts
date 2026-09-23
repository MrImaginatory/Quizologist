import type { NextConfig } from "next";

// MED-02: the browser only ever talks to this Next origin. /api/* is proxied
// server-side to the backend, so auth cookies are always first-party
// (SameSite=Strict works in dev, on the tunnel, and on a real domain).
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['pin-waterproof-driven-municipality.trycloudflare.com'],

  // Enable response compression
  compress: true,

  // MED-02: same-origin API proxy — cookies never cross an origin boundary.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },

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
