import useSWR from "swr";
import { dashboardApi } from "@/lib/api/dashboard";
import { useAuth } from "@/contexts/auth-context";

export function useStudentDetails(studentId: string | null) {
  const { token, user } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    studentId && token && (user?.role === "admin" || user?.role === "teacher")
      ? ["student-full-details", studentId, token]
      : null,
    async ([, id, authToken]: [string, string, string]) => {
      const response = await dashboardApi.getStudentFullDetails(id, authToken);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch student details");
      }
      return response.data;
    }
  );

  return {
    studentData: data,
    isLoading,
    error,
    refetch: mutate,
  };
}
