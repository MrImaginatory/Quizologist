"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";

export function useActiveFilters() {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const url = API_ROUTES.QUESTIONS.ACTIVE_FILTERS;
  
  const { data, error, isLoading } = useSWR<{ courseIds: string[]; subjectIds: string[]; topicIds: string[] }>(
    token ? url : null,
    fetcher,
    swrOptions
  );

  return {
    activeFilters: data || { courseIds: [], subjectIds: [], topicIds: [] },
    isLoading,
    error: error?.message || "",
  };
}
