"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { TestHistoryResponse } from "@/lib/api";

interface UseTestHistoryOptions {
  page?: number;
  limit?: number;
}

export function useTestHistory({ page = 1, limit = 10 }: UseTestHistoryOptions = {}) {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const url = `${API_ROUTES.TESTS.HISTORY}?page=${page}&limit=${limit}`;
  
  const { data, error, isLoading, mutate } = useSWR<TestHistoryResponse>(
    token ? url : null,
    fetcher,
    swrOptions
  );

  return {
    tests: data?.data?.tests || [],
    total: data?.data?.pagination?.total || 0,
    totalPages: data?.data?.pagination?.totalPages || 0,
    isLoading,
    error: error?.message || "",
    refetch: () => mutate(),
  };
}
