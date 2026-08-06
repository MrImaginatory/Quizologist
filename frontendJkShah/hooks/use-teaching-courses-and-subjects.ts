"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { TeachingCoursesAndSubjectsResponse } from "@/lib/api";

interface TeachingCourse {
  id: string;
  name: string;
}

interface TeachingSubject {
  id: string;
  name: string;
  course_id: string;
}

export function useTeachingCoursesAndSubjects() {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const { data, error, isLoading } = useSWR<TeachingCoursesAndSubjectsResponse>(
    token ? API_ROUTES.TEACHERS.TEACHING_COURSES_AND_SUBJECTS : null,
    fetcher,
    swrOptions
  );

  return {
    courses: data?.data?.courses || [],
    subjects: data?.data?.subjects || [],
    isLoading,
    error: error?.message || "",
  };
}
