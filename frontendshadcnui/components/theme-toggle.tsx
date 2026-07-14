"use client";

import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();

  // Hide on test page since there's a theme toggle in the header
  if (pathname.startsWith("/take-test")) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border border-border hover:bg-accent hover:text-accent-foreground"
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={resolvedTheme}
          initial={{ scale: 0, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 90, opacity: 0 }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
          className="flex items-center justify-center"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="size-5 text-foreground" />
          ) : (
            <Moon className="size-5 text-foreground" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}
