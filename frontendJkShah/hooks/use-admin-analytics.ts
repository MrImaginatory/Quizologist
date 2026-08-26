"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";

interface AnalyticsFilters {
  location_id?: string;
  date_from?: string;
  date_to?: string;
  subject_id?: string;
  course_id?: string;
  limit?: number;
  performance?: "top" | "low";
}

interface AdminAnalyticsData {
  ratioData: any | null;
  topStudents: any | null;
  leastQuestions: any | null;
  subjectsAttention: any | null;
  locationPerformance: any | null;
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

function buildUrl(base: string, params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const query = searchParams.toString();
  return `${base}${query ? `?${query}` : ""}`;
}

export function useAdminAnalytics(filters: AnalyticsFilters = {}): AdminAnalyticsData {
  const { token, logout } = useAuth();
  const fetcher = createFetcher(token);
  
  const ratioUrl = buildUrl(API_ROUTES.DASHBOARD.ANALYTICS_TEACHER_STUDENT_RATIO, {
    location_id: filters.location_id,
  });
  
  const topStudentsUrl = buildUrl(API_ROUTES.DASHBOARD.ANALYTICS_TOP_STUDENTS, {
    location_id: filters.location_id,
    date_from: filters.date_from,
    date_to: filters.date_to,
    limit: filters.limit || 10,
    performance: filters.performance || "top",
  });
  
  const leastQuestionsUrl = buildUrl(API_ROUTES.DASHBOARD.ANALYTICS_LEAST_QUESTIONS, {
    course_id: filters.course_id,
    subject_id: filters.subject_id,
  });
  
  const subjectsUrl = buildUrl(API_ROUTES.DASHBOARD.ANALYTICS_SUBJECTS_ATTENTION, {
    date_from: filters.date_from,
    date_to: filters.date_to,
  });
  
  const locationPerformanceUrl = filters.location_id
    ? buildUrl(API_ROUTES.DASHBOARD.LOCATION_PERFORMANCE(filters.location_id), {})
    : null;

  const { data: ratioRes, error: ratioErr } = useSWR(
    token ? ratioUrl : null,
    fetcher,
    swrOptions
  );
  
  const { data: topStudentsRes, error: topStudentsErr } = useSWR(
    token ? topStudentsUrl : null,
    fetcher,
    swrOptions
  );
  
  const { data: leastQuestionsRes, error: leastQuestionsErr } = useSWR(
    token ? leastQuestionsUrl : null,
    fetcher,
    swrOptions
  );
  
  const { data: subjectsRes, error: subjectsErr, mutate } = useSWR(
    token ? subjectsUrl : null,
    fetcher,
    swrOptions
  );

  const { data: locationPerformanceRes, error: locationPerformanceErr } = useSWR(
    token && filters.location_id ? locationPerformanceUrl : null,
    fetcher,
    swrOptions
  );

  // Check for token errors and logout
  const errors = [ratioErr, topStudentsErr, leastQuestionsErr, subjectsErr, locationPerformanceErr].filter(Boolean);
  for (const err of errors) {
    const message = err.message || "";
    if (message.toLowerCase().includes("invalid") && message.toLowerCase().includes("token")) {
      logout();
      return {
        ratioData: null,
        topStudents: null,
        leastQuestions: null,
        subjectsAttention: null,
        locationPerformance: null,
        isLoading: false,
        error: "",
        refetch: () => {},
      };
    }
  }

  const isLoading = Boolean(!ratioRes && !topStudentsRes && !leastQuestionsRes && !subjectsRes && (!locationPerformanceRes && filters.location_id) && !ratioErr);
  const error = errors.length > 0 ? errors[0].message : "";

  return {
    ratioData: ratioRes?.data || null,
    topStudents: topStudentsRes?.data || null,
    leastQuestions: leastQuestionsRes?.data || null,
    subjectsAttention: subjectsRes?.data || null,
    locationPerformance: locationPerformanceRes?.data || null,
    isLoading,
    error,
    refetch: () => mutate(),
  };
}
