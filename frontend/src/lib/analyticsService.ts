const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("quizologist_token");
  }
  return null;
}

async function fetchAnalytics(endpoint: string): Promise<any> {
  const token = getToken();
  const response = await fetch(`${BACKEND_URL}/api/dashboard${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.json();
}

export const analyticsService = {
  getTopicPerformance: () => fetchAnalytics("/student/topic-performance"),
  getSubjectPerformance: () => fetchAnalytics("/student/subject-performance"),
  getDifficultyBreakdown: () => fetchAnalytics("/student/difficulty-breakdown"),
  getTimeAnalysis: () => fetchAnalytics("/student/time-analysis"),
  getPerformanceTrends: () => fetchAnalytics("/student/performance-trends"),
  getStrengthsWeaknesses: () => fetchAnalytics("/student/strengths-weaknesses"),
};
