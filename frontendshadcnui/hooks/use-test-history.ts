"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { testsApi, TestHistory } from "@/lib/api";

interface UseTestHistoryOptions {
  page?: number;
  limit?: number;
}

export function useTestHistory({ page = 1, limit = 10 }: UseTestHistoryOptions = {}) {
  const { token } = useAuth();
  const [tests, setTests] = useState<TestHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTests = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await testsApi.getHistory(page, limit, token || undefined);
      setTests(response.data.tests);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch test history");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, token]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  return { tests, total, totalPages, isLoading, error, refetch: fetchTests };
}