"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { TeachingTestsResponse } from "@/lib/api";

interface UseTeachingTestsOptions {
  page?: number;
  limit?: number;
  status?: string;
  course_id?: string;
  subject_id?: string;
  student_id?: string;
}

interface UseTeachingTestsResult {
  tests: any[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useTeachingTests({
  page = 1,
  limit = 10,
  status,
  course_id,
  subject_id,
  student_id,
}: UseTeachingTestsOptions = {}): UseTeachingTestsResult {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const searchParams = new URLSearchParams();
  if (page) searchParams.set("page", page.toString());
  if (limit) searchParams.set("limit", limit.toString());
  if (status) searchParams.set("status", status);
  if (course_id) searchParams.set("course_id", course_id);
  if (subject_id) searchParams.set("subject_id", subject_id);
  if (student_id) searchParams.set("student_id", student_id);
  
  const url = `${API_ROUTES.TEACHERS.TEACHING_TESTS}?${searchParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<TeachingTestsResponse>(
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
