"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { coursesApi, Course } from "@/lib/api";

interface UseCoursesOptions {
  page?: number;
  limit?: number;
}

export function useCourses({ page = 1, limit = 10 }: UseCoursesOptions = {}) {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await coursesApi.getAll(page, limit, token || undefined);
        setCourses(response.data.courses);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [page, limit, token]);

  return { courses, total, totalPages, isLoading, error };
}
