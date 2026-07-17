"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { predefinedTestsApi, PredefinedTest } from "@/lib/api";

interface UsePredefinedTestsOptions {
  page?: number;
  limit?: number;
  status?: string;
  course_id?: string;
}

export function usePredefinedTests({
  page = 1,
  limit = 10,
  status,
  course_id,
}: UsePredefinedTestsOptions = {}) {
  const { token } = useAuth();
  const [tests, setTests] = useState<PredefinedTest[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await predefinedTestsApi.getAll(
          { page, limit, status, course_id },
          token || undefined
        );
        setTests(response.data.tests);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch predefined tests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, [page, limit, status, course_id, token]);

  return { tests, total, totalPages, isLoading, error };
}
