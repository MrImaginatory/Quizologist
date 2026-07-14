"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { enrollmentsApi, Enrollment } from "@/lib/api";

export function useEnrollments() {
  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEnrollments = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await enrollmentsApi.getAll(1, 100, token || undefined);
      setEnrollments(response.data.enrollments);
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch enrollments");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return { enrollments, total, isLoading, error, refetch: fetchEnrollments };
}