"use client";

export function useAppConfig() {
  return {
    appName: process.env.NEXT_PUBLIC_APP_NAME || "Quiz App",
    appLogo: process.env.NEXT_PUBLIC_APP_LOGO || "",
    // MED-02: relative URLs — /api/* is proxied to the backend by next.config.ts
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "",
  };
}
