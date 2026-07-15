"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { subjectsApi, Subject } from "@/lib/api";

interface UseSubjectsOptions {
  page?: number;
  limit?: number;
  courseId?: string;
}

export function useSubjects({ page = 1, limit = 10, courseId }: UseSubjectsOptions = {}) {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = courseId
          ? await subjectsApi.getByCourse(courseId, page, limit, token || undefined)
          : await subjectsApi.getAll(page, limit, token || undefined);
        setSubjects(response.data.subjects);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch subjects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, [page, limit, courseId, token]);

  return { subjects, total, totalPages, isLoading, error };
}
