"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { teachersApi, TeachingStudent } from "@/lib/api";

interface UseTeachingStudentsOptions {
  page?: number;
  limit?: number;
  course_id?: string;
  subject_id?: string;
}

interface UseTeachingStudentsResult {
  students: TeachingStudent[];
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
  const [students, setStudents] = useState<TeachingStudent[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await teachersApi.getTeachingStudents(
        { page, limit, course_id, subject_id },
        token || undefined
      );
      setStudents(response.data.students);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, course_id, subject_id, token]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, total, totalPages, isLoading, error, refetch: fetchStudents };
}
