"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { testService } from "@/lib/testService";
import DataTable from "@/components/common/DataTable/DataTable";
import Pagination from "@/components/common/Pagination/Pagination";
import StartTestModal from "./StartTestModal";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function MyTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const user = getUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "student") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const loadTests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await testService.getHistory(page, 10);
      if (res.success && res.data) {
        setTests(res.data.tests || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
        }
      } else {
        setError(res.message || "Failed to load tests");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, [page]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Completed</span>;
      case "in_progress":
        return <span className={`${styles.statusBadge} ${styles.statusInProgress}`}>In Progress</span>;
      case "pending":
        return <span className={`${styles.statusBadge} ${styles.statusPending}`}>Pending</span>;
      case "abandoned":
      default:
        return <span className={`${styles.statusBadge} ${styles.statusAbandoned}`}>{status || "Abandoned"}</span>;
    }
  };

  const getScoreStyle = (score: number) => {
    if (score >= 80) return styles.scoreHigh;
    if (score >= 50) return styles.scoreMedium;
    return styles.scoreLow;
  };

  const handleStartSuccess = (testData: any) => {
    setShowModal(false);
    
    // Store test data (including questions) in localStorage so it survives refresh
    localStorage.setItem(`test_session_${testData.test_id}`, JSON.stringify(testData));
    
    // Redirect to the live test page
    router.push(`/live-test/${testData.test_id}`);
  };

  if (!user || user.role !== "student") return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>My Tests</h1>
          <p className={styles.subtitle}>View your test history and start new tests</p>
        </div>
        <button className={styles.startBtn} onClick={() => setShowModal(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Start a New Test
        </button>
      </header>

      {error && <div style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>{error}</div>}

      <DataTable
        columns={["Date", "Status", "Questions", "Correct", "Score", "Action"]}
        loading={loading}
        isEmpty={tests.length === 0}
        emptyMessage="You haven't taken any tests yet."
      >
        {tests.map((test) => (
          <tr key={test.id}>
            <td>{new Date(test.started_at || test.created_at || test.startedAt || test.createdAt).toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</td>
            <td>{getStatusBadge(test.status)}</td>
            <td>{test.totalQuestions}</td>
            <td>{test.correct ?? "-"}</td>
            <td>
              {test.score !== undefined && test.score !== null ? (
                <span className={`${styles.score} ${getScoreStyle(Number(test.score))}`}>
                  {Number(test.score).toFixed(1)}%
                </span>
              ) : (
                "-"
              )}
            </td>
            <td>
              {test.status === "in_progress" && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => router.push(`/live-test/${test.test_id}`)}
                    style={{ 
                      padding: '0.25rem 0.5rem', 
                      backgroundColor: 'var(--color-primary)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Resume
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to abandon this test? This action cannot be undone.")) {
                        try {
                          await testService.abandonTest(test.id);
                          loadTests();
                        } catch (err) {
                          alert("Failed to abandon test.");
                        }
                      }
                    }}
                    style={{ 
                      padding: '0.25rem 0.5rem', 
                      backgroundColor: 'transparent', 
                      color: 'var(--color-danger)', 
                      border: '1px solid var(--color-danger)', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Abandon
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </DataTable>

      {!loading && tests.length > 0 && totalPages > 1 && (
        <div style={{ marginTop: "2rem" }}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {showModal && (
        <StartTestModal
          onClose={() => setShowModal(false)}
          onSuccess={handleStartSuccess}
        />
      )}
    </div>
  );
}
