"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { locationsApi, Location } from "@/lib/api";

interface UseLocationsOptions {
  page?: number;
  limit?: number;
}

interface UseLocationsResult {
  locations: Location[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useLocations({ page = 1, limit = 10 }: UseLocationsOptions = {}): UseLocationsResult {
  const { token } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await locationsApi.getAll(page, limit, token || undefined);
      setLocations(response.data.locations);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch locations");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, token]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return {
    locations,
    total,
    totalPages,
    isLoading,
    error,
    refetch: fetchLocations,
  };
}
