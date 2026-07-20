"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { testsApi, TestHistory } from "@/lib/api";

interface UseAllTestsOptions {
  page?: number;
  limit?: number;
  status?: string;
  subjectId?: string;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
  disabled?: boolean;
}

interface UseAllTestsResult {
  tests: TestHistory[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useAllTests({
  page = 1,
  limit = 10,
  status,
  subjectId,
  studentId,
  dateFrom,
  dateTo,
  disabled = false,
}: UseAllTestsOptions = {}): UseAllTestsResult {
  const { token } = useAuth();
  const [tests, setTests] = useState<TestHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(!disabled);
  const [error, setError] = useState("");

  const fetchTests = useCallback(async () => {
    if (disabled) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await testsApi.getAll(
        { page, limit, status, subjectId, studentId, dateFrom, dateTo },
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
  }, [page, limit, status, subjectId, studentId, dateFrom, dateTo, token, disabled]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  return {
    tests,
    total,
    totalPages,
    isLoading,
    error,
    refetch: fetchTests,
  };
}
