"use client";

import React from "react";
import styles from "./EnrollmentCard.module.css";
import { Enrollment } from "@/lib/studentService";
import { capitalize } from "@/utils/helpers";

interface EnrollmentCardProps {
  enrollment: Enrollment;
  onUnenroll: (id: string) => void;
}

export default function EnrollmentCard({ enrollment, onUnenroll }: EnrollmentCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>
            <svg className={styles.detailIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {enrollment.faculty?.name ? capitalize(enrollment.faculty.name) : "Unknown Faculty"}
          </h3>
          <span className={`${styles.badge} ${styles.badgePrimary}`}>Faculty</span>
        </div>
      </div>

      <div className={styles.details}>
        {enrollment.subject ? (
          <div className={styles.detailRow}>
            <svg className={styles.detailIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <strong>Subject:</strong> {capitalize(enrollment.subject.name)}
          </div>
        ) : (
          <div className={styles.detailRow}>
            <span className={styles.badge}>All Subjects</span>
          </div>
        )}

        {enrollment.topic ? (
          <div className={styles.detailRow}>
            <svg className={styles.detailIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <strong>Topic:</strong> {capitalize(enrollment.topic.name)}
          </div>
        ) : enrollment.subject ? (
          <div className={styles.detailRow}>
            <span className={styles.badge}>All Topics</span>
          </div>
        ) : null}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.unenrollBtn}
          onClick={() => {
            if (confirm("Are you sure you want to unenroll from this?")) {
              onUnenroll(enrollment.id);
            }
          }}
        >
          Unenroll
        </button>
      </div>
    </div>
  );
}
