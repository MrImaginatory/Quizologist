"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { TeacherEnrollmentResponse } from "@/lib/api";

export interface TeacherCourseAssignment {
  id: string;
  name: string;
  subjects: { id: string; name: string; assignmentId: string }[];
  assignmentIds: string[];
}

interface UseTeacherEnrollmentsResult {
  assignments: TeacherCourseAssignment[];
  rawAssignments: any[];
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useTeacherEnrollments(): UseTeacherEnrollmentsResult {
  const { token, user } = useAuth();
  const fetcher = createFetcher(token);
  
  const url = user && user.role === "teacher" && user.id
    ? `${API_ROUTES.TEACHERS.TEACHER_ENROLLMENT}?teacher_id=${user.id}&limit=100`
    : null;
  
  const { data, error, isLoading, mutate } = useSWR<TeacherEnrollmentResponse>(
    url,
    fetcher,
    swrOptions
  );

  const raw = data?.data?.assignments || [];
  
  const groupedByCourse: Record<string, TeacherCourseAssignment> = {};
  for (const item of raw) {
    const courseId = item.course.id;
    if (!groupedByCourse[courseId]) {
      groupedByCourse[courseId] = {
        id: courseId,
        name: item.course.name,
        subjects: [],
        assignmentIds: [],
      };
    }
    groupedByCourse[courseId].assignmentIds.push(item.id);
    if (item.subject) {
      const subjectExists = groupedByCourse[courseId].subjects.some(
        (s) => s.id === item.subject!.id
      );
      if (!subjectExists) {
        groupedByCourse[courseId].subjects.push({
          id: item.subject.id,
          name: item.subject.name,
          assignmentId: item.id,
        });
      }
    }
  }

  return {
    assignments: Object.values(groupedByCourse),
    rawAssignments: raw,
    isLoading,
    error: error?.message || "",
    refetch: () => mutate(),
  };
}
