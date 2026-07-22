"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { TopicsResponse } from "@/lib/api";

interface UseTopicsOptions {
  page?: number;
  limit?: number;
  subjectId?: string;
}

export function useTopics({ page = 1, limit = 10, subjectId }: UseTopicsOptions = {}) {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const url = subjectId
    ? `${API_ROUTES.TOPICS.BY_SUBJECT(subjectId)}?page=${page}&limit=${limit}`
    : `${API_ROUTES.TOPICS.BASE}?page=${page}&limit=${limit}`;
  
  const { data, error, isLoading, mutate } = useSWR<TopicsResponse>(
    token ? url : null,
    fetcher,
    swrOptions
  );

  return {
    topics: data?.data?.topics || [],
    total: data?.data?.pagination?.total || 0,
    totalPages: data?.data?.pagination?.totalPages || 0,
    isLoading,
    error: error?.message || "",
    refetch: () => mutate(),
  };
}
