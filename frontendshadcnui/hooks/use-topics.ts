"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { topicsApi, Topic } from "@/lib/api";

interface UseTopicsOptions {
  page?: number;
  limit?: number;
}

export function useTopics({ page = 1, limit = 10 }: UseTopicsOptions = {}) {
  const { token } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await topicsApi.getAll(page, limit, token || undefined);
        setTopics(response.data.topics);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch topics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [page, limit, token]);

  return { topics, total, totalPages, isLoading, error };
}
