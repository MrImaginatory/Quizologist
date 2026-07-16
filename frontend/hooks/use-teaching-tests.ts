"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { teachersApi, TeachingTest } from "@/lib/api";

interface UseTeachingTestsOptions {
  page?: number;
  limit?: number;
  status?: string;
  course_id?: string;
  subject_id?: string;
  student_id?: string;
}

interface UseTeachingTestsResult {
  tests: TeachingTest[];
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
  const [tests, setTests] = useState<TeachingTest[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTests = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await teachersApi.getTeachingTests(
        { page, limit, status, course_id, subject_id, student_id },
        token || undefined
      );
      setTests(response.data.tests);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tests");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, status, course_id, subject_id, student_id, token]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  return { tests, total, totalPages, isLoading, error, refetch: fetchTests };
}
