"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { facultiesApi, Faculty } from "@/lib/api";

interface UseFacultiesOptions {
  page?: number;
  limit?: number;
}

export function useFaculties({ page = 1, limit = 10 }: UseFacultiesOptions = {}) {
  const { token } = useAuth();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFaculties = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await facultiesApi.getAll(page, limit, token || undefined);
        setFaculties(response.data.faculties);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch faculties");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaculties();
  }, [page, limit, token]);

  return { faculties, total, totalPages, isLoading, error };
}
