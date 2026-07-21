import { API_ROUTES } from "../api-routes";
import { apiRequest } from "./client";
import {
  EnrollmentsResponse,
  EnrollmentPayload,
  EnrollmentResponse,
  EnrolledCoursesResponse,
  EnrolledSubjectsResponse,
  EnrolledTopicsResponse,
} from "./types";

export const enrollmentsApi = {
  getAll: (page = 1, limit = 100, token?: string) =>
    apiRequest<EnrollmentsResponse>(`${API_ROUTES.ENROLLMENTS.BASE}?page=${page}&limit=${limit}`, { token }),
  enroll: (payload: EnrollmentPayload, token?: string) =>
    apiRequest<EnrollmentResponse>(API_ROUTES.ENROLLMENTS.BASE, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),
  unenroll: (id: string, token?: string) =>
    apiRequest(API_ROUTES.ENROLLMENTS.BY_ID(id), { method: "DELETE", token }),
  getEnrolledCourses: (token?: string): Promise<EnrolledCoursesResponse> =>
    apiRequest<EnrolledCoursesResponse>(API_ROUTES.ENROLLMENTS.ENROLLED_COURSES, { token }),
  getEnrolledSubjects: (courseId: string, token?: string): Promise<EnrolledSubjectsResponse> =>
    apiRequest<EnrolledSubjectsResponse>(API_ROUTES.ENROLLMENTS.ENROLLED_SUBJECTS(courseId), { token }),
  getEnrolledTopics: (courseId: string, subjectId: string, token?: string): Promise<EnrolledTopicsResponse> =>
    apiRequest<EnrolledTopicsResponse>(API_ROUTES.ENROLLMENTS.ENROLLED_TOPICS(courseId, subjectId), { token }),
};