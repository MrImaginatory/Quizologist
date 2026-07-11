"use client";

import { getUser } from "@/lib/auth";
import KpiCards from "@/components/dashboard/KpiCards";
import StudentAnalytics from "@/components/dashboard/StudentAnalytics";
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
        <KpiCards />

        {user?.role === "student" && (
          <div className={styles.analyticsSection}>
            <h2 className={styles.sectionTitle}>Performance Analytics</h2>
            <StudentAnalytics />
          </div>
        )}
      </div>
    </div>
  );
}
