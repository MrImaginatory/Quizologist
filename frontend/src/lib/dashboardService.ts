import { getToken } from "./auth";

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: any;
}

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}/api/dashboard/stats`, {
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw {
      success: false,
      message: data.message || "An error occurred",
      status: response.status,
    };
  }
  return data;
};
