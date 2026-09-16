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
  search?: string;
}

export function useSubjects({ page = 1, limit = 10, courseId, search }: UseSubjectsOptions = {}) {
  const { isAuthenticated } = useAuth();
  const fetcher = createFetcher();
  
  let url = courseId
    ? `${API_ROUTES.SUBJECTS.BY_COURSE(courseId)}?page=${page}&limit=${limit}`
    : `${API_ROUTES.SUBJECTS.BASE}?page=${page}&limit=${limit}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  const { data, error, isLoading, mutate } = useSWR<SubjectsResponse>(
    isAuthenticated ? url : null,
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
