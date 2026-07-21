import { API_ROUTES } from "../api-routes";
import { apiRequest } from "./client";
import {
  DashboardStatsResponse,
  TeacherStudentRatioResponse,
  TopStudentsByLocationResponse,
  LeastQuestionsResponse,
  SubjectsAttentionResponse,
} from "./types";

export const dashboardApi = {
  getStats: (token?: string) =>
    apiRequest<DashboardStatsResponse>(API_ROUTES.DASHBOARD.STATS, { token }),
  getStudentAnalytics: (studentId: string, token?: string) =>
    apiRequest(API_ROUTES.DASHBOARD.STUDENT_ANALYTICS(studentId), { token }),
  getTeacherAnalytics: (teacherId: string, token?: string) =>
    apiRequest(API_ROUTES.DASHBOARD.TEACHER_ANALYTICS(teacherId), { token }),
  getStudentTopicPerformance: (token?: string) =>
    apiRequest(API_ROUTES.DASHBOARD.STUDENT_TOPIC_PERFORMANCE, { token }),
  getStudentSubjectPerformance: (token?: string) =>
    apiRequest(API_ROUTES.DASHBOARD.STUDENT_SUBJECT_PERFORMANCE, { token }),
  getStudentDifficultyBreakdown: (token?: string) =>
    apiRequest(API_ROUTES.DASHBOARD.STUDENT_DIFFICULTY_BREAKDOWN, { token }),
  getStudentTimeAnalysis: (token?: string) =>
    apiRequest(API_ROUTES.DASHBOARD.STUDENT_TIME_ANALYSIS, { token }),
  getStudentPerformanceTrends: (token?: string) =>
    apiRequest(API_ROUTES.DASHBOARD.STUDENT_PERFORMANCE_TRENDS, { token }),
  getStudentStrengthsWeaknesses: (token?: string) =>
    apiRequest(API_ROUTES.DASHBOARD.STUDENT_STRENGTHS_WEAKNESSES, { token }),

  // Admin Analytics
  getTeacherStudentRatio: (params: { location_id?: string }, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params.location_id) searchParams.set("location_id", params.location_id);
    const query = searchParams.toString();
    return apiRequest<TeacherStudentRatioResponse>(`${API_ROUTES.DASHBOARD.ANALYTICS_TEACHER_STUDENT_RATIO}${query ? `?${query}` : ""}`, { token });
  },
  getTopStudentsByLocation: (params: { location_id?: string; date_from?: string; date_to?: string; limit?: number }, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params.location_id) searchParams.set("location_id", params.location_id);
    if (params.date_from) searchParams.set("date_from", params.date_from);
    if (params.date_to) searchParams.set("date_to", params.date_to);
    if (params.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return apiRequest<TopStudentsByLocationResponse>(`${API_ROUTES.DASHBOARD.ANALYTICS_TOP_STUDENTS}${query ? `?${query}` : ""}`, { token });
  },
  getLeastQuestions: (params: { course_id?: string; subject_id?: string }, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params.course_id) searchParams.set("course_id", params.course_id);
    if (params.subject_id) searchParams.set("subject_id", params.subject_id);
    const query = searchParams.toString();
    return apiRequest<LeastQuestionsResponse>(`${API_ROUTES.DASHBOARD.ANALYTICS_LEAST_QUESTIONS}${query ? `?${query}` : ""}`, { token });
  },
  getSubjectsNeedingAttention: (params: { date_from?: string; date_to?: string }, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params.date_from) searchParams.set("date_from", params.date_from);
    if (params.date_to) searchParams.set("date_to", params.date_to);
    const query = searchParams.toString();
    return apiRequest<SubjectsAttentionResponse>(`${API_ROUTES.DASHBOARD.ANALYTICS_SUBJECTS_ATTENTION}${query ? `?${query}` : ""}`, { token });
  },
};