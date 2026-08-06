"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { TeachingStudentsResponse } from "@/lib/api";

interface UseTeachingStudentsOptions {
  page?: number;
  limit?: number;
  course_id?: string;
  subject_id?: string;
}

interface UseTeachingStudentsResult {
  students: any[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useTeachingStudents({
  page = 1,
  limit = 10,
  course_id,
  subject_id,
}: UseTeachingStudentsOptions = {}): UseTeachingStudentsResult {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const searchParams = new URLSearchParams();
  if (page) searchParams.set("page", page.toString());
  if (limit) searchParams.set("limit", limit.toString());
  if (course_id) searchParams.set("course_id", course_id);
  if (subject_id) searchParams.set("subject_id", subject_id);
  
  const url = `${API_ROUTES.TEACHERS.TEACHING_STUDENTS}?${searchParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<TeachingStudentsResponse>(
    token ? url : null,
    fetcher,
    swrOptions
  );

  return {
    students: data?.data?.students || [],
    total: data?.data?.pagination?.total || 0,
    totalPages: data?.data?.pagination?.totalPages || 0,
    isLoading,
    error: error?.message || "",
    refetch: () => mutate(),
  };
}
