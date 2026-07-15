"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  dashboardApi,
  DashboardStatsResponse,
  TopicPerformance,
  SubjectPerformance,
  PerformanceTrend,
  TopicPerformanceResponse,
  SubjectPerformanceResponse,
  PerformanceTrendsResponse,
  StrengthsWeaknessesResponse,
} from "@/lib/api";

interface StudentDashboardData {
  stats: DashboardStatsResponse["data"] | null;
  topicPerformance: TopicPerformance[];
  subjectPerformance: SubjectPerformance[];
  performanceTrends: {
    last15Days: PerformanceTrend[];
    last30Days: PerformanceTrend[];
    last60Days: PerformanceTrend[];
  };
  overallAccuracy: number;
  totalTopicsAttempted: number;
  isLoading: boolean;
  error: string;
}

export function useStudentDashboard(): StudentDashboardData {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStatsResponse["data"] | null>(null);
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformance[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState({
    last15Days: [] as PerformanceTrend[],
    last30Days: [] as PerformanceTrend[],
    last60Days: [] as PerformanceTrend[],
  });
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [totalTopicsAttempted, setTotalTopicsAttempted] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const authHeaders = { token: token || undefined };

        const [statsRes, topicRes, subjectRes, trendsRes, swRes] = await Promise.allSettled([
          dashboardApi.getStats(token || undefined),
          dashboardApi.getStudentTopicPerformance(token || undefined),
          dashboardApi.getStudentSubjectPerformance(token || undefined),
          dashboardApi.getStudentPerformanceTrends(token || undefined),
          dashboardApi.getStudentStrengthsWeaknesses(token || undefined),
        ]);

        if (statsRes.status === "fulfilled") {
          setStats(statsRes.value.data);
        }

        if (topicRes.status === "fulfilled") {
          const data = topicRes.value as TopicPerformanceResponse;
          setTopicPerformance(data.data.topics);
        }

        if (subjectRes.status === "fulfilled") {
          const data = subjectRes.value as SubjectPerformanceResponse;
          setSubjectPerformance(data.data.subjects);
        }

        if (trendsRes.status === "fulfilled") {
          const data = trendsRes.value as PerformanceTrendsResponse;
          setPerformanceTrends(data.data);
        }

        if (swRes.status === "fulfilled") {
          const data = swRes.value as StrengthsWeaknessesResponse;
          setOverallAccuracy(data.data.overallAccuracy);
          setTotalTopicsAttempted(data.data.totalTopicsAttempted);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  return {
    stats,
    topicPerformance,
    subjectPerformance,
    performanceTrends,
    overallAccuracy,
    totalTopicsAttempted,
    isLoading,
    error,
  };
}