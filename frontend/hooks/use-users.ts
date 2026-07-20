"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { usersApi, User } from "@/lib/api";

interface UseUsersOptions {
  role?: string;
  page?: number;
  limit?: number;
  disabled?: boolean;
}

interface UseUsersReturn {
  users: User[];
  total: number;
  isLoading: boolean;
  error: string;
  totalPages: number;
  refetch: () => void;
}

export function useUsers({ role, page = 1, limit = 10, disabled = false }: UseUsersOptions = {}): UseUsersReturn {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(!disabled);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    if (disabled) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      let response;
      if (role) {
        response = await usersApi.getByRole(role, page, limit, token || undefined);
      } else {
        response = await usersApi.getAll(page, limit, token || undefined);
      }
      setUsers(response.data.users);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, [role, page, limit, token, disabled]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, total, isLoading, error, totalPages, refetch: fetchUsers };
}
