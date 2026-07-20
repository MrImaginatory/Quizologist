"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { dashboardApi } from "@/lib/api";
import type {
  TeacherStudentRatioResponse,
  TopStudentsByLocationResponse,
  LeastQuestionsResponse,
  SubjectsAttentionResponse,
} from "@/lib/api";

interface AnalyticsFilters {
  location_id?: string;
  date_from?: string;
  date_to?: string;
  subject_id?: string;
  course_id?: string;
  limit?: number;
}

interface AdminAnalyticsData {
  ratioData: TeacherStudentRatioResponse["data"] | null;
  topStudents: TopStudentsByLocationResponse["data"] | null;
  leastQuestions: LeastQuestionsResponse["data"] | null;
  subjectsAttention: SubjectsAttentionResponse["data"] | null;
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useAdminAnalytics(filters: AnalyticsFilters = {}): AdminAnalyticsData {
  const { token, logout } = useAuth();
  const [ratioData, setRatioData] = useState<TeacherStudentRatioResponse["data"] | null>(null);
  const [topStudents, setTopStudents] = useState<TopStudentsByLocationResponse["data"] | null>(null);
  const [leastQuestions, setLeastQuestions] = useState<LeastQuestionsResponse["data"] | null>(null);
  const [subjectsAttention, setSubjectsAttention] = useState<SubjectsAttentionResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [ratioRes, topStudentsRes, leastQuestionsRes, subjectsRes] = await Promise.allSettled([
        dashboardApi.getTeacherStudentRatio({ location_id: filters.location_id }, token || undefined),
        dashboardApi.getTopStudentsByLocation({
          location_id: filters.location_id,
          date_from: filters.date_from,
          date_to: filters.date_to,
          limit: filters.limit || 10,
        }, token || undefined),
        dashboardApi.getLeastQuestions({
          course_id: filters.course_id,
          subject_id: filters.subject_id,
        }, token || undefined),
        dashboardApi.getSubjectsNeedingAttention({
          date_from: filters.date_from,
          date_to: filters.date_to,
        }, token || undefined),
      ]);

      // Check for token errors
      const rejectedResults = [ratioRes, topStudentsRes, leastQuestionsRes, subjectsRes].filter(
        (r): r is PromiseRejectedResult => r.status === "rejected"
      );

      for (const rejected of rejectedResults) {
        const message = rejected.reason instanceof Error ? rejected.reason.message : String(rejected.reason);
        if (message.toLowerCase().includes("invalid") && message.toLowerCase().includes("token")) {
          logout();
          return;
        }
      }

      if (ratioRes.status === "fulfilled") {
        setRatioData(ratioRes.value.data);
      }

      if (topStudentsRes.status === "fulfilled") {
        setTopStudents(topStudentsRes.value.data);
      }

      if (leastQuestionsRes.status === "fulfilled") {
        setLeastQuestions(leastQuestionsRes.value.data);
      }

      if (subjectsRes.status === "fulfilled") {
        setSubjectsAttention(subjectsRes.value.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch analytics data";
      if (message.toLowerCase().includes("invalid") && message.toLowerCase().includes("token")) {
        logout();
        return;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token, logout, filters.location_id, filters.date_from, filters.date_to, filters.subject_id, filters.course_id, filters.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ratioData,
    topStudents,
    leastQuestions,
    subjectsAttention,
    isLoading,
    error,
    refetch: fetchData,
  };
}
