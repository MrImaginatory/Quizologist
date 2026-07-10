"use client";

import { getUser } from "@/lib/auth";
import styles from "./page.module.css";

export default function DashboardPage() {
  const user = getUser();

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {user?.fname || "User"}</h1>
          <p className={styles.subtitle}>Here&apos;s what&apos;s happening with your platform today.</p>
        </div>
      </header>

      <div className={styles.content}>
        {/* Placeholder for dashboard content */}
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h2 className={styles.placeholderTitle}>Dashboard Content</h2>
          <p className={styles.placeholderText}>
            Dashboard widgets and statistics will appear here. This is where you&apos;ll see
            an overview of your platform&apos;s activity.
          </p>
        </div>
      </div>
    </div>
  );
}
