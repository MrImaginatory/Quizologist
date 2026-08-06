"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { UsersResponse } from "@/lib/api";

interface UseUsersOptions {
  role?: string;
  page?: number;
  limit?: number;
  disabled?: boolean;
}

interface UseUsersReturn {
  users: any[];
  total: number;
  isLoading: boolean;
  error: string;
  totalPages: number;
  refetch: () => void;
}

export function useUsers({ role, page = 1, limit = 10, disabled = false }: UseUsersOptions = {}): UseUsersReturn {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const url = role
    ? `${API_ROUTES.USERS.BY_ROLE(role)}?page=${page}&limit=${limit}`
    : `${API_ROUTES.USERS.BASE}?page=${page}&limit=${limit}`;
  
  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
    token && !disabled ? url : null,
    fetcher,
    swrOptions
  );

  return {
    users: data?.data?.users || [],
    total: data?.data?.pagination?.total || 0,
    isLoading: disabled ? false : isLoading,
    error: error?.message || "",
    totalPages: data?.data?.pagination?.totalPages || 0,
    refetch: () => mutate(),
  };
}
