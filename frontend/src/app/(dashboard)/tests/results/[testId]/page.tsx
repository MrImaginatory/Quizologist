"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { testService } from "@/lib/testService";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import styles from "./Results.module.css";
import { capitalize } from "@/utils/helpers";

export default function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testId) return;

    const fetchResult = async () => {
      try {
        const response = await testService.getResult(testId);
        if (response.success && response.data) {
          setResult(response.data);
        } else {
          setError(response.message || "Failed to load test results.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [testId]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2 style={{ color: "var(--color-danger, #EF4444)", marginBottom: "1rem" }}>Oops!</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>{error || "Test results not found."}</p>
          <Link href="/tests" className={styles.backBtn}>Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Test Results</h1>
        <Link href="/tests" className={styles.backBtn}>
          Back to Tests
        </Link>
      </header>

      <div className={styles.scorecard}>
        <div className={styles.scoreCircle}>
          <div className={styles.scoreValue}>{Math.round(result.score)}%</div>
          <div className={styles.scoreLabel}>Final Score</div>
        </div>
        
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Questions</span>
            <span className={styles.statValue}>{result.totalQuestions}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Attempted</span>
            <span className={styles.statValue}>{result.attempted}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Skipped</span>
            <span className={`${styles.statValue} ${styles.skipped}`}>{result.skipped}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Correct</span>
            <span className={`${styles.statValue} ${styles.correct}`}>{result.correct}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Incorrect</span>
            <span className={`${styles.statValue} ${styles.incorrect}`}>{result.incorrect}</span>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Question Breakdown</h2>
      
      <div className={styles.questionsList}>
        {result.questions.map((q: any, idx: number) => {
          let statusClass = styles.incorrect;
          let statusText = "Incorrect";
          
          if (q.isCorrect) {
            statusClass = styles.correct;
            statusText = "Correct";
          } else if (!q.selectedAnswer) {
            statusClass = styles.skipped;
            statusText = "Skipped";
          }

          return (
            <div key={idx} className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span className={styles.qNumber}>Question {idx + 1}</span>
                <span className={`${styles.qStatus} ${statusClass}`}>
                  {statusText}
                </span>
              </div>
              
              <h3 className={styles.questionText}>{q.question}</h3>
              
              <div className={styles.optionsList}>
                {q.choices.map((choice: string, cIdx: number) => {
                  const isSelected = q.selectedAnswer === choice;
                  const isActualCorrect = q.correctAnswer === choice;
                  
                  let optionClass = "";
                  if (isActualCorrect) optionClass = styles.correct;
                  else if (isSelected && !isActualCorrect) optionClass = styles.incorrect;

                  return (
                    <div key={cIdx} className={`${styles.option} ${optionClass}`}>
                      <div className={styles.optionContent}>
                        {choice}
                      </div>
                      
                      {isActualCorrect && (
                        <div className={`${styles.icon} ${styles.correct}`} title="Correct Answer">
                          ✓
                        </div>
                      )}
                      {isSelected && !isActualCorrect && (
                        <div className={`${styles.icon} ${styles.incorrect}`} title="Your Answer">
                          ✗
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className={styles.explanation}>
                  <div className={styles.explanationTitle}>Explanation</div>
                  <div className={styles.explanationText}>{q.explanation}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
