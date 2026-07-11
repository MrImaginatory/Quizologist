"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import styles from "./KpiCards.module.css";
import { getDashboardStats } from "@/lib/dashboardService";

interface KpiItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const incrementTime = (duration * 1000) / end;
    const step = Math.max(1, Math.floor(end / 100));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime * step);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const defaultIcons = {
  test: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  ),
  question: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  topic: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  student: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  teacher: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  subject: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
};

const mapDataToKpis = (data: any): KpiItem[] => {
  const kpis: KpiItem[] = [];

  const addKpi = (label: string, value: number, icon: any) => {
    kpis.push({
      label,
      value: value || 0,
      color: "#4f46e5",
      bgColor: "#eef2ff",
      icon
    });
  };

  if (data.role === "admin") {
    addKpi("Tests Submitted", data.testsSubmitted, defaultIcons.test);
    addKpi("Total Questions", data.totalQuestions, defaultIcons.question);
    addKpi("Total Topics", data.totalTopics, defaultIcons.topic);
    addKpi("Active Students", data.studentsCount, defaultIcons.student);
    addKpi("Total Subjects", data.totalSubjects, defaultIcons.subject);
    addKpi("Total Teachers", data.totalTeachers, defaultIcons.teacher);
  } else if (data.role === "teacher") {
    addKpi("Tests Submitted", data.testsSubmitted, defaultIcons.test);
    addKpi("Questions Added", data.questionsAdded, defaultIcons.question);
    addKpi("Students in Faculties", data.studentsInFaculties, defaultIcons.student);
    addKpi("Questions in Faculties", data.questionsInFaculties, defaultIcons.topic);
  } else if (data.role === "student") {
    addKpi("Tests Submitted", data.testsSubmitted, defaultIcons.test);
    addKpi("Questions in Enrolled Faculties", data.questionsInEnrolledFaculties, defaultIcons.question);
  }

  return kpis;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  }),
};

export default function KpiCards() {
  const [kpis, setKpis] = useState<KpiItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await getDashboardStats();
        if (response.success && response.data) {
          setKpis(mapDataToKpis(response.data));
        }
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadStats();
  }, []);

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading stats...</div>;
  }

  if (kpis.length === 0) {
    return null;
  }

  return (
    <div className={styles.grid}>
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.label}
          className={styles.card}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className={styles.cardHeader}>
            <div
              className={styles.iconWrapper}
              style={{ backgroundColor: kpi.bgColor, color: kpi.color }}
            >
              {kpi.icon}
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.value} style={{ color: kpi.color }}>
              <AnimatedCounter value={kpi.value} />
            </div>
            <div className={styles.label}>{kpi.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
