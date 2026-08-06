"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";

interface PendingTest {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  question_limit: number;
  difficulty: string;
  is_scheduled: boolean;
  start_time: string | null;
  end_time: string | null;
  status: string;
  student_status?: "assigned" | "started" | "completed";
}

interface PendingTestsResponse {
  success: boolean;
  data: {
    tests: PendingTest[];
  };
}

export function usePendingTests() {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const { data, error, isLoading } = useSWR(
    token ? API_ROUTES.PREDEFINED_TESTS.PENDING : null,
    fetcher,
    swrOptions
  );

  return {
    tests: (data as PendingTestsResponse)?.data?.tests || [],
    isLoading,
    error: error?.message || "",
  };
}
