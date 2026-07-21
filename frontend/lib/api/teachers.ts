import { API_ROUTES } from "../api-routes";
import { apiRequest } from "./client";
import {
  TeacherListResponse,
  TeacherAssignmentsResponse,
  TeacherEnrollmentResponse,
  TeachingStudentsResponse,
  TeachingCoursesAndSubjectsResponse,
  TeachingTestsResponse,
  TopStudentsResponse,
  WeaknessSummaryResponse,
  QuestionCoverageResponse,
  TeacherAssignment,
  BulkSubjectPayload,
  BulkSubjectResponse,
} from "./types";

export const teachersApi = {
  list: (page = 1, limit = 10, token?: string) =>
    apiRequest<TeacherListResponse>(`${API_ROUTES.TEACHERS.BASE}/list?page=${page}&limit=${limit}`, { token }),
  getAssignments: (teacherId: string, token?: string) =>
    apiRequest<TeacherAssignmentsResponse>(API_ROUTES.TEACHERS.BY_ID(teacherId), { token }),
  getTeacherEnrollments: (params: { teacher_id?: string; course_id?: string; page?: number; limit?: number }, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params.teacher_id) searchParams.set("teacher_id", params.teacher_id);
    if (params.course_id) searchParams.set("course_id", params.course_id);
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return apiRequest<TeacherEnrollmentResponse>(`${API_ROUTES.TEACHERS.TEACHER_ENROLLMENT}${query ? `?${query}` : ""}`, { token });
  },
  assignCourse: (teacherId: string, courseId: string, token?: string) =>
    apiRequest<{ success: boolean; message: string; data: TeacherAssignment }>(
      API_ROUTES.TEACHERS.ASSIGN_COURSE,
      {
        method: "POST",
        body: JSON.stringify({ teacher_id: teacherId, course_id: courseId }),
        token,
      }
    ),
  assignSubject: (teacherId: string, courseId: string, subjectId: string, token?: string) =>
    apiRequest<{ success: boolean; message: string; data: TeacherAssignment }>(
      API_ROUTES.TEACHERS.ASSIGN_SUBJECT,
      {
        method: "POST",
        body: JSON.stringify({ teacher_id: teacherId, course_id: courseId, subject_id: subjectId }),
        token,
      }
    ),
  bulkAssignSubjects: (payload: BulkSubjectPayload, token?: string) =>
    apiRequest<BulkSubjectResponse>(API_ROUTES.TEACHERS.ASSIGN_BULK_SUBJECTS, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),
  unenroll: (assignmentId: string, token?: string) =>
    apiRequest<{ success: boolean; message: string; data: { message: string } }>(
      API_ROUTES.TEACHERS.UNENROLL(assignmentId),
      { method: "DELETE", token }
    ),
  getTeachingStudents: (params: { course_id?: string; subject_id?: string; student_id?: string; search?: string; page?: number; limit?: number }, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params.course_id) searchParams.set("course_id", params.course_id);
    if (params.subject_id) searchParams.set("subject_id", params.subject_id);
    if (params.student_id) searchParams.set("student_id", params.student_id);
    if (params.search) searchParams.set("search", params.search);
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return apiRequest<TeachingStudentsResponse>(`${API_ROUTES.TEACHERS.TEACHING_STUDENTS}${query ? `?${query}` : ""}`, { token });
  },
  getTeachingCoursesAndSubjects: (token?: string): Promise<TeachingCoursesAndSubjectsResponse> => {
    return apiRequest<TeachingCoursesAndSubjectsResponse>(API_ROUTES.TEACHERS.TEACHING_COURSES_AND_SUBJECTS, { token });
  },
  getTeachingTests: (params: { course_id?: string; subject_id?: string; student_id?: string; search?: string; status?: string; page?: number; limit?: number }, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params.course_id) searchParams.set("course_id", params.course_id);
    if (params.subject_id) searchParams.set("subject_id", params.subject_id);
    if (params.student_id) searchParams.set("student_id", params.student_id);
    if (params.search) searchParams.set("search", params.search);
    if (params.status) searchParams.set("status", params.status);
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return apiRequest<TeachingTestsResponse>(`${API_ROUTES.TEACHERS.TEACHING_TESTS}${query ? `?${query}` : ""}`, { token });
  },
  getTopStudents: (params: { course_id?: string; subject_id?: string; limit?: number }, token?: string): Promise<TopStudentsResponse> => {
    const searchParams = new URLSearchParams();
    if (params.course_id) searchParams.set("course_id", params.course_id);
    if (params.subject_id) searchParams.set("subject_id", params.subject_id);
    if (params.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return apiRequest<TopStudentsResponse>(`${API_ROUTES.TEACHERS.TEACHING_TOP_STUDENTS}${query ? `?${query}` : ""}`, { token });
  },
  getWeaknessSummary: (params: { course_id?: string; threshold?: number }, token?: string): Promise<WeaknessSummaryResponse> => {
    const searchParams = new URLSearchParams();
    if (params.course_id) searchParams.set("course_id", params.course_id);
    if (params.threshold) searchParams.set("threshold", params.threshold.toString());
    const query = searchParams.toString();
    return apiRequest<WeaknessSummaryResponse>(`${API_ROUTES.TEACHERS.TEACHING_WEAKNESS_SUMMARY}${query ? `?${query}` : ""}`, { token });
  },
  getQuestionCoverage: (params: { course_id?: string; subject_id?: string; limit?: number }, token?: string): Promise<QuestionCoverageResponse> => {
    const searchParams = new URLSearchParams();
    if (params.course_id) searchParams.set("course_id", params.course_id);
    if (params.subject_id) searchParams.set("subject_id", params.subject_id);
    if (params.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return apiRequest<QuestionCoverageResponse>(`${API_ROUTES.TEACHERS.TEACHING_QUESTION_COVERAGE}${query ? `?${query}` : ""}`, { token });
  },
};