"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { CoursesResponse } from "@/lib/api";

interface UseCoursesOptions {
  page?: number;
  limit?: number;
}

export function useCourses({ page = 1, limit = 10 }: UseCoursesOptions = {}) {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const url = `${API_ROUTES.COURSES.BASE}?page=${page}&limit=${limit}`;
  
  const { data, error, isLoading, mutate } = useSWR<CoursesResponse>(
    token ? url : null,
    fetcher,
    swrOptions
  );

  return {
    courses: data?.data?.courses || [],
    total: data?.data?.pagination?.total || 0,
    totalPages: data?.data?.pagination?.totalPages || 0,
    isLoading,
    error: error?.message || "",
    refetch: () => mutate(),
  };
}
