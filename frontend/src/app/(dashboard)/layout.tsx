"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { isAuthenticated } from "@/lib/auth";
import Sidebar from "@/components/sidebar/Sidebar";
import MobileNav from "@/components/dashboard/MobileNav";
import styles from "./layout.module.css";

const SIDEBAR_STATE_KEY = "quizologist-sidebar-collapsed";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/signin");
      return;
    }
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (saved === "true") {
      setIsCollapsed(true);
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    setMounted(true);

    return () => window.removeEventListener("resize", checkMobile);
  }, [router]);

  const handleToggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STATE_KEY, String(next));
      return next;
    });
  };

  if (!mounted) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* Desktop Sidebar */}
      <AnimatePresence>
        {!isMobile && (
          <Sidebar isCollapsed={isCollapsed} onToggle={handleToggle} />
        )}
      </AnimatePresence>

      <motion.main
        className={styles.main}
        animate={{
          marginLeft: isMobile ? 0 : isCollapsed ? 72 : 260,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.main>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
