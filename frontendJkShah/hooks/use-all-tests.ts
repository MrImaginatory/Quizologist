"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { PredefinedTestResponse } from "@/lib/api";

interface UseAllTestsOptions {
  page?: number;
  limit?: number;
  status?: string;
  subjectId?: string;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
  disabled?: boolean;
}

interface UseAllTestsResult {
  tests: any[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useAllTests({
  page = 1,
  limit = 10,
  status,
  subjectId,
  studentId,
  dateFrom,
  dateTo,
  disabled = false,
}: UseAllTestsOptions = {}): UseAllTestsResult {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const searchParams = new URLSearchParams();
  if (page) searchParams.set("page", page.toString());
  if (limit) searchParams.set("limit", limit.toString());
  if (status) searchParams.set("status", status);
  if (subjectId) searchParams.set("subjectId", subjectId);
  if (studentId) searchParams.set("studentId", studentId);
  if (dateFrom) searchParams.set("dateFrom", dateFrom);
  if (dateTo) searchParams.set("dateTo", dateTo);
  
  const url = `${API_ROUTES.TESTS.ALL}?${searchParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<PredefinedTestResponse>(
    token && !disabled ? url : null,
    fetcher,
    swrOptions
  );

  return {
    tests: data?.data?.tests || [],
    total: data?.data?.pagination?.total || 0,
    totalPages: data?.data?.pagination?.totalPages || 0,
    isLoading: disabled ? false : isLoading,
    error: error?.message || "",
    refetch: () => mutate(),
  };
}
