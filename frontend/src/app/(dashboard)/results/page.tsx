"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { testService } from "@/lib/testService";
import DataTable from "@/components/common/DataTable/DataTable";
import Pagination from "@/components/common/Pagination/Pagination";
import styles from "./page.module.css";
import { formatDate, capitalize } from "@/utils/helpers";

export default function ResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    // Only student results logic is shown here
    setUser(currentUser);
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await testService.getStudentResultSummary(user.id, page, limit);
        if (response.success && response.data) {
          setResults(response.data.results || []);
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1);
          }
        } else {
          setError(response.message || "Failed to fetch results.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user, page]);

  const getAccuracyBadgeClass = (accuracy: number) => {
    if (accuracy >= 80) return styles.badgeSuccess;
    if (accuracy >= 50) return styles.badgeWarning;
    return styles.badgeDanger;
  };

  if (!user) return null; // Wait for user to be loaded

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>My Results</h1>
          <p className={styles.subtitle}>View your past test performance and details.</p>
        </div>
      </header>

      {error && (
        <div style={{ color: "var(--color-error)", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <DataTable
        columns={["Date", "Scope", "Score", "Accuracy", "Action"]}
        loading={loading}
        isEmpty={!loading && results.length === 0}
        emptyMessage="No test results found."
      >
        {results.map((result) => (
          <tr key={result.id}>
            <td>
              <div className={styles.scopeCell}>
                <span className={styles.scopeValue}>
                  {result.startedAt ? formatDate(result.startedAt) : "N/A"}
                </span>
                <span className={styles.scopeLabel}>
                  {result.durationMinutes} minutes
                </span>
              </div>
            </td>
            <td>
              <div className={styles.scopeCell}>
                {result.faculties && result.faculties.length > 0 && (
                  <span className={styles.scopeLabel}>
                    Faculties: <span className={styles.scopeValue} title={result.faculties.map(capitalize).join(", ")}>
                      {result.faculties.slice(0, 2).map(capitalize).join(", ")}
                      {result.faculties.length > 2 && (
                        <span className={styles.moreBadge}> +{result.faculties.length - 2}</span>
                      )}
                    </span>
                  </span>
                )}
                {result.subjects && result.subjects.length > 0 && (
                  <span className={styles.scopeLabel}>
                    Subjects: <span className={styles.scopeValue} title={result.subjects.map(capitalize).join(", ")}>
                      {result.subjects.slice(0, 2).map(capitalize).join(", ")}
                      {result.subjects.length > 2 && (
                        <span className={styles.moreBadge}> +{result.subjects.length - 2}</span>
                      )}
                    </span>
                  </span>
                )}
              </div>
            </td>
            <td>
              <div className={styles.scopeCell}>
                <span className={styles.scopeValue}>{result.score.toFixed(2)}</span>
                <span className={styles.scopeLabel}>
                  {result.correct} / {result.attempted} correct
                </span>
              </div>
            </td>
            <td>
              <span className={`${styles.badge} ${getAccuracyBadgeClass(result.accuracy)}`}>
                {result.accuracy}%
              </span>
            </td>
            <td>
              <Link href={`/tests/results/${result.testId}`} className={styles.viewButton}>
                View
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>

      {totalPages > 1 && (
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      )}
    </div>
  );
}
