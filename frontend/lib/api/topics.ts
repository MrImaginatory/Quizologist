import { API_ROUTES } from "../api-routes";
import { apiRequest } from "./client";
import { TopicsResponse } from "./types";

export const topicsApi = {
  getAll: (page = 1, limit = 10, token?: string) =>
    apiRequest<TopicsResponse>(`${API_ROUTES.TOPICS.BASE}?page=${page}&limit=${limit}`, { token }),
  getBySubject: (subjectId: string, page = 1, limit = 10, token?: string) =>
    apiRequest<TopicsResponse>(`${API_ROUTES.TOPICS.BY_SUBJECT(subjectId)}?page=${page}&limit=${limit}`, { token }),
  delete: (id: string, token?: string) =>
    apiRequest(API_ROUTES.TOPICS.BY_ID(id), { method: "DELETE", token }),
};