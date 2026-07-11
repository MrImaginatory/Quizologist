"use client";

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
} from "chart.js";
import { Bar, Radar, Doughnut, Line } from "react-chartjs-2";
import { analyticsService } from "@/lib/analyticsService";
import { capitalize } from "@/utils/helpers";
import styles from "./StudentAnalytics.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement
);

const COLORS = {
  primary: "#6366F1",
  primaryLight: "#EEF2FF",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        font: { family: "'Inter', sans-serif", size: 12 },
        color: COLORS.gray700,
      },
    },
    tooltip: {
      backgroundColor: COLORS.gray900,
      titleFont: { family: "'Inter', sans-serif" },
      bodyFont: { family: "'Inter', sans-serif" },
      cornerRadius: 8,
      padding: 12,
    },
  },
};

export default function StudentAnalytics() {
  const [topicData, setTopicData] = useState<any>(null);
  const [subjectData, setSubjectData] = useState<any>(null);
  const [difficultyData, setDifficultyData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "topics" | "subjects" | "trends">("overview");

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [topics, subjects, difficulty, trends] = await Promise.all([
          analyticsService.getTopicPerformance(),
          analyticsService.getSubjectPerformance(),
          analyticsService.getDifficultyBreakdown(),
          analyticsService.getPerformanceTrends(),
        ]);
        setTopicData(topics.data);
        setSubjectData(subjects.data);
        setDifficultyData(difficulty.data);
        setTrendData(trends.data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const hasData = (topicData?.topics?.length > 0) || (subjectData?.subjects?.length > 0);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className={styles.noDataContainer}>
        <div className={styles.noDataIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3v18h18" />
            <path d="M7 16l4-8 4 4 4-8" />
          </svg>
        </div>
        <h3 className={styles.noDataTitle}>No Analytics Data Yet</h3>
        <p className={styles.noDataText}>Complete at least 3 tests to see your performance analytics and insights.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {(["overview", "topics", "subjects", "trends"] as const).map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <OverviewPanel topicData={topicData} difficultyData={difficultyData} />
      )}
      {activeTab === "topics" && <TopicsPanel topicData={topicData} />}
      {activeTab === "subjects" && <SubjectsPanel subjectData={subjectData} />}
      {activeTab === "trends" && <TrendsPanel trendData={trendData} />}
    </div>
  );
}

function OverviewPanel({ topicData, difficultyData }: any) {
  const strong = topicData?.topics?.filter((t: any) => t.status === "strong") || [];
  const weak = topicData?.topics?.filter((t: any) => t.status === "weak") || [];

  const radarData = {
    labels: topicData?.topics?.slice(0, 8).map((t: any) => capitalize(t.topicName || "").substring(0, 15)) || [],
    datasets: [
      {
        label: "Accuracy %",
        data: topicData?.topics?.slice(0, 8).map((t: any) => t.accuracy) || [],
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: COLORS.primary,
        borderWidth: 2,
        pointBackgroundColor: COLORS.primary,
      },
    ],
  };

  const doughnutData = {
    labels: difficultyData?.difficulties?.map((d: any) => capitalize(d.level || "")) || [],
    datasets: [
      {
        data: difficultyData?.difficulties?.map((d: any) => d.totalAttempts) || [],
        backgroundColor: [COLORS.success, COLORS.primary, COLORS.warning, COLORS.error, "#8B5CF6"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className={styles.grid}>
      {topicData?.topics?.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Topic Accuracy</h3>
          <div className={styles.chartContainer}>
            <Radar
              data={radarData}
              options={{
                ...chartOptions,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { stepSize: 20, font: { size: 10 } },
                    grid: { color: COLORS.gray200 },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {difficultyData?.difficulties?.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Difficulty Breakdown</h3>
          <div className={styles.chartContainer}>
            <Doughnut
              data={doughnutData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: { position: "bottom", labels: { font: { size: 11 }, padding: 12 } },
                },
              }}
            />
          </div>
        </div>
      )}

      {strong.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Strong Topics</h3>
          <div className={styles.topicList}>
            {strong.map((t: any) => (
              <div key={t.topicId} className={styles.topicItem}>
                <span className={styles.topicName}>{capitalize(t.topicName || "")}</span>
                <span className={`${styles.accuracy} ${styles.strong}`}>{t.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {weak.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Weak Topics</h3>
          <div className={styles.topicList}>
            {weak.map((t: any) => (
              <div key={t.topicId} className={styles.topicItem}>
                <span className={styles.topicName}>{capitalize(t.topicName || "")}</span>
                <span className={`${styles.accuracy} ${styles.weak}`}>{t.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TopicsPanel({ topicData }: any) {
  const topics = topicData?.topics || [];
  if (topics.length === 0) return <div className={styles.noDataSmall}>No topic data available.</div>;

  const barData = {
    labels: topics.map((t: any) => capitalize(t.topicName || "").substring(0, 20)),
    datasets: [
      {
        label: "Accuracy %",
        data: topics.map((t: any) => t.accuracy),
        backgroundColor: topics.map((t: any) =>
          t.status === "strong" ? COLORS.success : t.status === "weak" ? COLORS.error : COLORS.warning
        ),
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  return (
    <div className={styles.fullWidth}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Topic Performance (All Time)</h3>
        <div className={styles.chartContainerTall}>
          <Bar
            data={barData}
            options={{
              ...chartOptions,
              indexAxis: "y" as const,
              scales: {
                x: { beginAtZero: true, max: 100, grid: { color: COLORS.gray100 } },
                y: { grid: { display: false } },
              },
            }}
          />
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Topic Details</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Topic</th>
                <th>Subject</th>
                <th>Attempts</th>
                <th>Accuracy</th>
                <th>Avg Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t: any) => (
                <tr key={t.topicId}>
                  <td>{capitalize(t.topicName || "")}</td>
                  <td className={styles.secondaryText}>{capitalize(t.subjectName || "")}</td>
                  <td>{t.totalAttempts}</td>
                  <td>{t.accuracy}%</td>
                  <td>{t.avgTimePerQuestion}s</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[t.status]}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SubjectsPanel({ subjectData }: any) {
  const subjects = subjectData?.subjects || [];
  if (subjects.length === 0) return <div className={styles.noDataSmall}>No subject data available.</div>;

  const barData = {
    labels: subjects.map((s: any) => capitalize(s.subjectName || "")),
    datasets: [
      {
        label: "Accuracy %",
        data: subjects.map((s: any) => s.accuracy),
        backgroundColor: subjects.map((s: any) =>
          s.status === "strong" ? COLORS.success : s.status === "weak" ? COLORS.error : COLORS.warning
        ),
        borderRadius: 4,
        barThickness: 28,
      },
    ],
  };

  return (
    <div className={styles.fullWidth}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Subject Performance</h3>
        <div className={styles.chartContainerMedium}>
          <Bar
            data={barData}
            options={{
              ...chartOptions,
              scales: {
                y: { beginAtZero: true, max: 100, grid: { color: COLORS.gray100 } },
                x: { grid: { display: false } },
              },
            }}
          />
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Subject Details</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Attempts</th>
                <th>Accuracy</th>
                <th>Avg Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s: any) => (
                <tr key={s.subjectId}>
                  <td>{capitalize(s.subjectName || "")}</td>
                  <td>{s.totalAttempts}</td>
                  <td>{s.accuracy}%</td>
                  <td>{s.avgTimePerQuestion}s</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TrendsPanel({ trendData }: any) {
  const trend15 = trendData?.last15Days || [];
  const trend30 = trendData?.last30Days || [];
  const trend60 = trendData?.last60Days || [];

  const hasAnyTrend = trend15.length > 0 || trend30.length > 0 || trend60.length > 0;
  if (!hasAnyTrend) return <div className={styles.noDataSmall}>No test history available for trends.</div>;

  const makeLineData = (data: any[], label: string) => ({
    labels: data.map((d: any) => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label,
        data: data.map((d: any) => d.score),
        borderColor: COLORS.primary,
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  });

  return (
    <div className={styles.fullWidth}>
      {[
        { data: trend15, label: "Last 15 Days", key: "15" },
        { data: trend30, label: "Last 30 Days", key: "30" },
        { data: trend60, label: "Last 60 Days", key: "60" },
      ].map(({ data, label, key }) => (
        <div className={styles.card} key={key}>
          <h3 className={styles.cardTitle}>{label}</h3>
          <div className={styles.chartContainerMedium}>
            {data.length > 0 ? (
              <Line
                data={makeLineData(data, label)}
                options={{
                  ...chartOptions,
                  scales: {
                    y: { beginAtZero: true, max: 100, grid: { color: COLORS.gray100 } },
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
                  },
                }}
              />
            ) : (
              <p className={styles.emptyText}>No tests taken in this period</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
