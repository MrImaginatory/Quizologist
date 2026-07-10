"use client";

import { useState } from "react";
import styles from "./Faculty.module.css";
import FacultyTab from "@/components/dashboard/faculty/FacultyTab";
import SubjectTab from "@/components/dashboard/faculty/SubjectTab";
import TopicTab from "@/components/dashboard/faculty/TopicTab";

type TabType = "faculty" | "subject" | "topic";

export default function FacultyPage() {
  const [activeTab, setActiveTab] = useState<TabType>("faculty");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Content Management</h1>
        <p>Manage faculties, subjects, and topics across the organization.</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "faculty" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("faculty")}
        >
          Faculties
        </button>
        <button
          className={`${styles.tab} ${activeTab === "subject" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("subject")}
        >
          Subjects
        </button>
        <button
          className={`${styles.tab} ${activeTab === "topic" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("topic")}
        >
          Topics
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "faculty" && <FacultyTab />}
        {activeTab === "subject" && <SubjectTab />}
        {activeTab === "topic" && <TopicTab />}
      </div>
    </div>
  );
}
