import { API_ROUTES } from "../api-routes";
import { apiRequest } from "./client";
import {
  TestHistoryResponse,
  StartTestResponse,
  TestResultResponse,
  StudentResultsResponse,
  StartTestPayload,
  SubmitTestResponse,
  PredefinedTestResponse,
  PredefinedTestDetailResponse,
  CreatePredefinedTestPayload,
  PredefinedTestStartResponse,
} from "./types";

export const testsApi = {
  getAll: (params: {
    page?: number;
    limit?: number;
    status?: string;
    subjectId?: string;
    studentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.status) searchParams.set("status", params.status);
    if (params.subjectId) searchParams.set("subjectId", params.subjectId);
    if (params.studentId) searchParams.set("studentId", params.studentId);
    if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
    if (params.dateTo) searchParams.set("dateTo", params.dateTo);
    const query = searchParams.toString();
    return apiRequest<TestHistoryResponse>(`${API_ROUTES.TESTS.ALL}${query ? `?${query}` : ""}`, { token });
  },
  getHistory: (page = 1, limit = 10, token?: string) =>
    apiRequest<TestHistoryResponse>(`${API_ROUTES.TESTS.HISTORY}?page=${page}&limit=${limit}`, { token }),
  getById: (id: string, token?: string) =>
    apiRequest<StartTestResponse>(API_ROUTES.TESTS.BY_ID(id), { token }),
  getResult: (testId: string, token?: string) =>
    apiRequest<TestResultResponse>(API_ROUTES.TESTS.RESULT(testId), { token }),
  start: (payload: StartTestPayload, token?: string) =>
    apiRequest<StartTestResponse>(API_ROUTES.TESTS.START, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),
  submit: (testId: string, token?: string) =>
    apiRequest<SubmitTestResponse>(API_ROUTES.TESTS.SUBMIT(testId), {
      method: "POST",
      token,
    }),
  abandon: (testId: string, token?: string) =>
    apiRequest(API_ROUTES.TESTS.ABANDON(testId), {
      method: "POST",
      token,
    }),
  getStudentResults: (studentId: string, page = 1, limit = 10, token?: string) =>
    apiRequest<StudentResultsResponse>(
      `${API_ROUTES.TESTS.STUDENT_RESULTS(studentId)}?page=${page}&limit=${limit}`,
      { token }
    ),
};

// Predefined Tests API
export const predefinedTestsApi = {
  create: (payload: CreatePredefinedTestPayload, token?: string) =>
    apiRequest<PredefinedTestDetailResponse>(API_ROUTES.PREDEFINED_TESTS.BASE, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),
  getAll: (params: { page?: number; limit?: number; status?: string; course_id?: string } = {}, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.status) searchParams.set("status", params.status);
    if (params.course_id) searchParams.set("course_id", params.course_id);
    const query = searchParams.toString();
    return apiRequest<PredefinedTestResponse>(`${API_ROUTES.PREDEFINED_TESTS.BASE}${query ? `?${query}` : ""}`, { token });
  },
  getById: (id: string, token?: string) =>
    apiRequest<PredefinedTestDetailResponse>(API_ROUTES.PREDEFINED_TESTS.BY_ID(id), { token }),
  update: (id: string, payload: Partial<CreatePredefinedTestPayload>, token?: string) =>
    apiRequest<PredefinedTestDetailResponse>(API_ROUTES.PREDEFINED_TESTS.BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    }),
  delete: (id: string, token?: string) =>
    apiRequest(API_ROUTES.PREDEFINED_TESTS.BY_ID(id), { method: "DELETE", token }),
  activate: (id: string, token?: string) =>
    apiRequest<PredefinedTestDetailResponse>(API_ROUTES.PREDEFINED_TESTS.ACTIVATE(id), { method: "POST", token }),
  deactivate: (id: string, token?: string) =>
    apiRequest<PredefinedTestDetailResponse>(API_ROUTES.PREDEFINED_TESTS.DEACTIVATE(id), { method: "POST", token }),
  getPending: (token?: string) =>
    apiRequest(`${API_ROUTES.PREDEFINED_TESTS.PENDING}`, { token }),
  getByToken: (token: string, authToken?: string) =>
    apiRequest(`${API_ROUTES.PREDEFINED_TESTS.JOIN(token)}`, { token: authToken }),
  start: (id: string, token?: string) =>
    apiRequest<PredefinedTestStartResponse>(API_ROUTES.PREDEFINED_TESTS.START(id), { method: "POST", token }),
};