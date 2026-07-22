import { API_ROUTES } from "../api-routes";
import { apiRequest } from "./client";
import { CoursesResponse } from "./types";

export const coursesApi = {
  getAll: (page = 1, limit = 10, token?: string) =>
    apiRequest<CoursesResponse>(`${API_ROUTES.COURSES.BASE}?page=${page}&limit=${limit}`, { token }),
  getById: (id: string, token?: string) =>
    apiRequest(API_ROUTES.COURSES.BY_ID(id), { token }),
  create: (data: { name: string; description?: string }, token?: string) =>
    apiRequest(API_ROUTES.COURSES.BASE, { method: "POST", body: JSON.stringify(data), token }),
  delete: (id: string, token?: string) =>
    apiRequest(API_ROUTES.COURSES.BY_ID(id), { method: "DELETE", token }),
};