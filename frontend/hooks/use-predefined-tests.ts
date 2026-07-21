"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { PredefinedTestResponse } from "@/lib/api";

interface UsePredefinedTestsOptions {
  page?: number;
  limit?: number;
  status?: string;
  course_id?: string;
}

export function usePredefinedTests({
  page = 1,
  limit = 10,
  status,
  course_id,
}: UsePredefinedTestsOptions = {}) {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const searchParams = new URLSearchParams();
  if (page) searchParams.set("page", page.toString());
  if (limit) searchParams.set("limit", limit.toString());
  if (status) searchParams.set("status", status);
  if (course_id) searchParams.set("course_id", course_id);
  
  const url = `${API_ROUTES.PREDEFINED_TESTS.BASE}?${searchParams.toString()}`;
  
  const { data, error, isLoading } = useSWR<PredefinedTestResponse>(
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
  };
}
