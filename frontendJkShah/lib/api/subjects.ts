import { API_ROUTES } from "../api-routes";
import { apiRequest } from "./client";
import { SubjectsResponse } from "./types";

export const subjectsApi = {
  getAll: (page = 1, limit = 10, token?: string) =>
    apiRequest<SubjectsResponse>(`${API_ROUTES.SUBJECTS.BASE}?page=${page}&limit=${limit}`, { token }),
  getByCourse: (courseId: string, page = 1, limit = 10, token?: string) =>
    apiRequest<SubjectsResponse>(`${API_ROUTES.SUBJECTS.BY_COURSE(courseId)}?page=${page}&limit=${limit}`, { token }),
  create: (data: { name: string; description?: string; course_id: string }, token?: string) =>
    apiRequest(API_ROUTES.SUBJECTS.BASE, { method: "POST", body: JSON.stringify(data), token }),
  update: (id: string, data: { name: string; description?: string; course_id: string }, token?: string) =>
    apiRequest(API_ROUTES.SUBJECTS.BY_ID(id), { method: "PUT", body: JSON.stringify(data), token }),
  delete: (id: string, token?: string) =>
    apiRequest(API_ROUTES.SUBJECTS.BY_ID(id), { method: "DELETE", token }),
};