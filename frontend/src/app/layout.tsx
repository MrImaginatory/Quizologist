"use client";

import { useState } from "react";
import "./globals.css";
import ThemeToggle from "@/components/auth/ThemeToggle";
import SplashScreen from "@/components/splash/SplashScreen";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [splashComplete, setSplashComplete] = useState(false);

  const themeScript = `
    try {
      var saved = localStorage.getItem("quizologist-theme");
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
      } else if (!saved) {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {}
  `;

  if (!splashComplete) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body>
          <SplashScreen onComplete={() => setSplashComplete(true)} />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
