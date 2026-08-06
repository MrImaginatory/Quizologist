"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { LocationsResponse } from "@/lib/api";

interface UseLocationsOptions {
  page?: number;
  limit?: number;
  fetchAll?: boolean;
}

interface UseLocationsResult {
  locations: any[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useLocations({ page = 1, limit = 10, fetchAll = false }: UseLocationsOptions = {}): UseLocationsResult {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const effectiveLimit = fetchAll ? 100 : limit;
  const url = `${API_ROUTES.LOCATIONS.BASE}?page=${page}&limit=${effectiveLimit}`;
  
  const { data, error, isLoading, mutate } = useSWR<LocationsResponse>(
    token ? url : null,
    fetcher,
    swrOptions
  );

  return {
    locations: data?.data?.locations || [],
    total: data?.data?.pagination?.total || 0,
    totalPages: data?.data?.pagination?.totalPages || 0,
    isLoading,
    error: error?.message || "",
    refetch: () => mutate(),
  };
}
