"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";

interface StudentDashboardData {
  stats: any | null;
  topicPerformance: any[];
  subjectPerformance: any[];
  performanceTrends: {
    last15Days: any[];
    last30Days: any[];
    last60Days: any[];
  };
  overallAccuracy: number;
  totalTopicsAttempted: number;
  isLoading: boolean;
  error: string;
}

export function useStudentDashboard(): StudentDashboardData {
  const { token, logout } = useAuth();
  const fetcher = createFetcher(token);
  
  const { data: statsRes, error: statsErr } = useSWR(
    token ? API_ROUTES.DASHBOARD.STATS : null,
    fetcher,
    swrOptions
  );
  
  const { data: topicRes, error: topicErr } = useSWR(
    token ? API_ROUTES.DASHBOARD.STUDENT_TOPIC_PERFORMANCE : null,
    fetcher,
    swrOptions
  );
  
  const { data: subjectRes, error: subjectErr } = useSWR(
    token ? API_ROUTES.DASHBOARD.STUDENT_SUBJECT_PERFORMANCE : null,
    fetcher,
    swrOptions
  );
  
  const { data: trendsRes, error: trendsErr } = useSWR(
    token ? API_ROUTES.DASHBOARD.STUDENT_PERFORMANCE_TRENDS : null,
    fetcher,
    swrOptions
  );
  
  const { data: swRes, error: swErr } = useSWR(
    token ? API_ROUTES.DASHBOARD.STUDENT_STRENGTHS_WEAKNESSES : null,
    fetcher,
    swrOptions
  );

  // Check for token errors and logout
  const errors = [statsErr, topicErr, subjectErr, trendsErr, swErr].filter(Boolean);
  for (const err of errors) {
    const message = err.message || "";
    if (message.toLowerCase().includes("invalid") && message.toLowerCase().includes("token")) {
      logout();
      return {
        stats: null,
        topicPerformance: [],
        subjectPerformance: [],
        performanceTrends: { last15Days: [], last30Days: [], last60Days: [] },
        overallAccuracy: 0,
        totalTopicsAttempted: 0,
        isLoading: false,
        error: "",
      };
    }
  }

  const isLoading = !statsRes && !topicRes && !subjectRes && !trendsRes && !swRes && !statsErr;
  const error = errors.length > 0 ? errors[0].message : "";

  return {
    stats: statsRes?.data || null,
    topicPerformance: topicRes?.data?.topics || [],
    subjectPerformance: subjectRes?.data?.subjects || [],
    performanceTrends: trendsRes?.data || { last15Days: [], last30Days: [], last60Days: [] },
    overallAccuracy: swRes?.data?.overallAccuracy || 0,
    totalTopicsAttempted: swRes?.data?.totalTopicsAttempted || 0,
    isLoading,
    error,
  };
}
