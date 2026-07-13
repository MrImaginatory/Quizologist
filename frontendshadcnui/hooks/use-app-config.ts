"use client";

export function useAppConfig() {
  return {
    appName: process.env.NEXT_PUBLIC_APP_NAME || "Quiz App",
    appLogo: process.env.NEXT_PUBLIC_APP_LOGO || "/Quizologist.svg",
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000",
  };
}
