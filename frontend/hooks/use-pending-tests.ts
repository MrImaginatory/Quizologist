"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { predefinedTestsApi } from "@/lib/api";

interface PendingTest {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  question_limit: number;
  difficulty: string;
  is_scheduled: boolean;
  start_time: string | null;
  end_time: string | null;
  status: string;
  student_status?: "assigned" | "started" | "completed";
}

interface PendingTestsResponse {
  success: boolean;
  data: {
    tests: PendingTest[];
  };
}

export function usePendingTests() {
  const { token } = useAuth();
  const [tests, setTests] = useState<PendingTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPendingTests = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await predefinedTestsApi.getPending(token || undefined) as PendingTestsResponse;
        setTests(response.data?.tests || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch pending tests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingTests();
  }, [token]);

  return { tests, isLoading, error };
}
