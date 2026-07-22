"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { SubjectsResponse } from "@/lib/api";

interface UseSubjectsOptions {
  page?: number;
  limit?: number;
  courseId?: string;
}

export function useSubjects({ page = 1, limit = 10, courseId }: UseSubjectsOptions = {}) {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const url = courseId
    ? `${API_ROUTES.SUBJECTS.BY_COURSE(courseId)}?page=${page}&limit=${limit}`
    : `${API_ROUTES.SUBJECTS.BASE}?page=${page}&limit=${limit}`;
  
  const { data, error, isLoading, mutate } = useSWR<SubjectsResponse>(
    token ? url : null,
    fetcher,
    swrOptions
  );

  return {
    subjects: data?.data?.subjects || [],
    total: data?.data?.pagination?.total || 0,
    totalPages: data?.data?.pagination?.totalPages || 0,
    isLoading,
    error: error?.message || "",
    refetch: () => mutate(),
  };
}
