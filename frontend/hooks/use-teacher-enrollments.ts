"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { teachersApi, TeacherEnrollmentItem } from "@/lib/api";

export interface TeacherCourseAssignment {
  id: string;
  name: string;
  subjects: { id: string; name: string; assignmentId: string }[];
  assignmentIds: string[];
}

interface UseTeacherEnrollmentsResult {
  assignments: TeacherCourseAssignment[];
  rawAssignments: TeacherEnrollmentItem[];
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useTeacherEnrollments(): UseTeacherEnrollmentsResult {
  const { token, user } = useAuth();
  const [assignments, setAssignments] = useState<TeacherCourseAssignment[]>([]);
  const [rawAssignments, setRawAssignments] = useState<TeacherEnrollmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssignments = useCallback(async () => {
    if (!user || user.role !== "teacher" || !user.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await teachersApi.getTeacherEnrollments(
        { teacher_id: user.id, limit: 100 },
        token || undefined
      );

      const raw = response.data.assignments || [];
      setRawAssignments(raw);

      const groupedByCourse = raw.reduce<Record<string, TeacherCourseAssignment>>((acc, item) => {
        const courseId = item.course.id;
        if (!acc[courseId]) {
          acc[courseId] = {
            id: courseId,
            name: item.course.name,
            subjects: [],
            assignmentIds: [],
          };
        }
        acc[courseId].assignmentIds.push(item.id);
        if (item.subject) {
          const subjectExists = acc[courseId].subjects.some((s) => s.id === item.subject!.id);
          if (!subjectExists) {
            acc[courseId].subjects.push({
              id: item.subject.id,
              name: item.subject.name,
              assignmentId: item.id,
            });
          }
        }
        return acc;
      }, {});

      setAssignments(Object.values(groupedByCourse));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch assignments");
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return { assignments, rawAssignments, isLoading, error, refetch: fetchAssignments };
}
