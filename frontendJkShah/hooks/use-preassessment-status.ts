import useSWR from "swr";
import { preAssessmentApi } from "@/lib/api/tests";
import { useAuth } from "@/contexts/auth-context";
import { PreAssessmentStatus } from "@/lib/api/types";

export function usePreAssessmentStatus() {
  const { user, token } = useAuth();
  
  // Only fetch for students
  const shouldFetch = user?.role === "student" && !!token;

  const { data, error, isLoading, mutate } = useSWR<PreAssessmentStatus>(
    shouldFetch ? "preassessment-status" : null,
    async () => {
      const response = await preAssessmentApi.getStatus(token!);
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    {
      revalidateOnFocus: false, // Don't constantly ping, rely on manual mutate
    }
  );

  return {
    status: data,
    isLoading: isLoading || (shouldFetch && !data && !error),
    error,
    refetch: mutate,
  };
}
