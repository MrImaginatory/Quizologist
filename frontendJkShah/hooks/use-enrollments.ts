"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { EnrollmentsResponse } from "@/lib/api";

export function useEnrollments() {
  const { token } = useAuth();
  const fetcher = createFetcher(token);

  const url = `${API_ROUTES.ENROLLMENTS.BASE}?page=1&limit=100`;

  const { data, error, isLoading, mutate } = useSWR<EnrollmentsResponse>(
    token ? url : null,
    fetcher,
    swrOptions
  );

  return {
    enrollments: data?.data?.enrollments || [],
    total: data?.data?.pagination?.total || 0,
    isLoading,
    error: error?.message || "",
    refetch: () => mutate(),
  };
}
