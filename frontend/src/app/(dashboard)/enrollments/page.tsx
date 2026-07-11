"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { studentService, Enrollment } from "@/lib/studentService";
import EnrollmentCard from "@/components/enrollments/EnrollmentCard";
import EnrollmentForm from "@/components/enrollments/EnrollmentForm";
import Pagination from "@/components/common/Pagination/Pagination";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function MyEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const user = getUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "student") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await studentService.getMyEnrollments(page, 12);
      if (res.success && res.data) {
        setEnrollments(res.data.enrollments || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
        }
      } else {
        setError(res.message || "Failed to load enrollments");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, [page]);

  const handleUnenroll = async (id: string) => {
    try {
      const res = await studentService.unenroll(id);
      if (res.success) {
        // Reload current page
        loadEnrollments();
      } else {
        alert(res.message || "Failed to unenroll");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const handleEnrollSuccess = () => {
    setShowForm(false);
    setPage(1);
    loadEnrollments();
  };

  if (!user || user.role !== "student") return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>My Enrollments</h1>
          <p className={styles.subtitle}>Manage your course enrollments</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New
        </button>
      </header>

      {error && <div style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>{error}</div>}

      <div className={styles.grid}>
        {loading ? (
          <div className={styles.loading}>
            <LoadingSpinner />
          </div>
        ) : enrollments.length === 0 ? (
          <div className={styles.empty}>
            <p>You are not enrolled in any courses yet.</p>
            <p style={{ marginTop: "0.5rem" }}>Click "Add New" to get started.</p>
          </div>
        ) : (
          enrollments.map((enrollment) => (
            <EnrollmentCard
              key={enrollment.id}
              enrollment={enrollment}
              onUnenroll={handleUnenroll}
            />
          ))
        )}
      </div>

      {!loading && enrollments.length > 0 && totalPages > 1 && (
        <div style={{ marginTop: "2rem" }}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {showForm && (
        <EnrollmentForm
          onClose={() => setShowForm(false)}
          onSuccess={handleEnrollSuccess}
          onEnroll={studentService.enroll.bind(studentService)}
        />
      )}
    </div>
  );
}
