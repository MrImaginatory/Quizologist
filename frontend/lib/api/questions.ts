import { API_ROUTES } from "../api-routes";
import { apiRequest } from "./client";
import { QuestionsResponse, Question, CreateQuestionPayload } from "./types";

export const questionsApi = {
  create: (data: CreateQuestionPayload, token?: string) =>
    apiRequest<{ success: boolean; message: string; data: Question }>(API_ROUTES.QUESTIONS.BASE, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
  getAll: (page = 1, limit = 10, token?: string) =>
    apiRequest<QuestionsResponse>(`${API_ROUTES.QUESTIONS.BASE}?page=${page}&limit=${limit}`, { token }),
  filter: (params: {
    course_id?: string;
    subject_id?: string;
    topic_id?: string;
    page?: number;
    limit?: number;
  }, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params.course_id) searchParams.set("course_id", params.course_id);
    if (params.subject_id) searchParams.set("subject_id", params.subject_id);
    if (params.topic_id) searchParams.set("topic_id", params.topic_id);
    searchParams.set("page", (params.page || 1).toString());
    searchParams.set("limit", (params.limit || 10).toString());
    return apiRequest<QuestionsResponse>(`${API_ROUTES.QUESTIONS.FILTER}?${searchParams.toString()}`, { token });
  },
  getById: (id: string, token?: string) =>
    apiRequest(API_ROUTES.QUESTIONS.BY_ID(id), { token }),
  update: (id: string, data: Partial<Omit<Question, "id">>, token?: string) =>
    apiRequest<{ success: boolean; message: string; data: Question }>(API_ROUTES.QUESTIONS.BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),
  delete: (id: string, token?: string) =>
    apiRequest(API_ROUTES.QUESTIONS.BY_ID(id), { method: "DELETE", token }),
  getTemplate: async (token?: string): Promise<Blob> => {
    const response = await fetch(API_ROUTES.QUESTIONS.IMPORT_TEMPLATE, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    if (!response.ok) throw new Error("Failed to download template");
    return response.blob();
  },
  bulkImport: (questions: Omit<Question, "id">[], token?: string) =>
    apiRequest<{ totalRows: number; imported: number; failed: number; errors: { row: number; reason: string }[] }>(
      API_ROUTES.QUESTIONS.BULK,
      { method: "POST", body: JSON.stringify({ questions }), token }
    ),
};