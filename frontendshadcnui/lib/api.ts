import { API_ROUTES } from "./api-routes";

interface ApiRequestOptions extends RequestInit {
  token?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }

  return data;
}

export interface SignupPayload {
  fname: string;
  lname: string;
  role: "student" | "teacher" | "admin";
  email: string;
  mobileNumber: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      fname: string;
      lname: string;
      role: string;
      email: string;
      mobilenumber: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    };
    token: string;
  };
}

export const authApi = {
  signup: (payload: SignupPayload) =>
    apiRequest<AuthResponse>(API_ROUTES.AUTH.SIGNUP, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiRequest<AuthResponse>(API_ROUTES.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export interface User {
  id: string;
  fname: string;
  lname: string;
  role: string;
  email: string;
  mobileNumber: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: Pagination;
  };
}

export const usersApi = {
  getAll: (page = 1, limit = 10, token?: string) =>
    apiRequest<UsersResponse>(`${API_ROUTES.USERS.BASE}?page=${page}&limit=${limit}`, { token }),
  getById: (id: string, token?: string) =>
    apiRequest(API_ROUTES.USERS.BY_ID(id), { token }),
  getByRole: (role: string, page = 1, limit = 10, token?: string) =>
    apiRequest<UsersResponse>(`${API_ROUTES.USERS.BY_ROLE(role)}?page=${page}&limit=${limit}`, { token }),
};

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: {
    role: string;
    // Admin
    testsSubmitted?: number;
    totalQuestions?: number;
    totalTopics?: number;
    topicsCovered?: number;
    studentsCount?: number;
    totalSubjects?: number;
    totalTeachers?: number;
    totalCourses?: number;
    // Teacher
    questionsAdded?: number;
    studentsInCourses?: number;
    questionsInCourses?: number;
    // Student
    questionsInEnrolledCourses?: number;
  };
}

export const dashboardApi = {
  getStats: (token?: string) =>
    apiRequest<DashboardStatsResponse>(API_ROUTES.DASHBOARD.STATS, { token }),
  getStudentAnalytics: (studentId: string, token?: string) =>
    apiRequest(API_ROUTES.DASHBOARD.STUDENT_ANALYTICS(studentId), { token }),
  getTeacherAnalytics: (teacherId: string, token?: string) =>
    apiRequest(API_ROUTES.DASHBOARD.TEACHER_ANALYTICS(teacherId), { token }),
};

export interface Course {
  id: string;
  name: string;
  description: string | null;
}

export interface CoursesResponse {
  success: boolean;
  message: string;
  data: {
    courses: Course[];
    pagination: Pagination;
  };
}

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  course_id: string;
  course: {
    id: string;
    name: string;
  };
}

export interface SubjectsResponse {
  success: boolean;
  message: string;
  data: {
    subjects: Subject[];
    pagination: Pagination;
  };
}

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  subject_id: string;
  subject: {
    id: string;
    name: string;
    course: {
      id: string;
      name: string;
    };
  };
}

export interface TopicsResponse {
  success: boolean;
  message: string;
  data: {
    topics: Topic[];
    pagination: Pagination;
  };
}

export const coursesApi = {
  getAll: (page = 1, limit = 10, token?: string) =>
    apiRequest<CoursesResponse>(`${API_ROUTES.COURSES.BASE}?page=${page}&limit=${limit}`, { token }),
  getById: (id: string, token?: string) =>
    apiRequest(API_ROUTES.COURSES.BY_ID(id), { token }),
  delete: (id: string, token?: string) =>
    apiRequest(API_ROUTES.COURSES.BY_ID(id), { method: "DELETE", token }),
};

export const subjectsApi = {
  getAll: (page = 1, limit = 10, token?: string) =>
    apiRequest<SubjectsResponse>(`${API_ROUTES.SUBJECTS.BASE}?page=${page}&limit=${limit}`, { token }),
  getByCourse: (courseId: string, page = 1, limit = 10, token?: string) =>
    apiRequest<SubjectsResponse>(`${API_ROUTES.SUBJECTS.BY_COURSE(courseId)}?page=${page}&limit=${limit}`, { token }),
  delete: (id: string, token?: string) =>
    apiRequest(API_ROUTES.SUBJECTS.BY_ID(id), { method: "DELETE", token }),
};

export const topicsApi = {
  getAll: (page = 1, limit = 10, token?: string) =>
    apiRequest<TopicsResponse>(`${API_ROUTES.TOPICS.BASE}?page=${page}&limit=${limit}`, { token }),
  getBySubject: (subjectId: string, page = 1, limit = 10, token?: string) =>
    apiRequest<TopicsResponse>(`${API_ROUTES.TOPICS.BY_SUBJECT(subjectId)}?page=${page}&limit=${limit}`, { token }),
  delete: (id: string, token?: string) =>
    apiRequest(API_ROUTES.TOPICS.BY_ID(id), { method: "DELETE", token }),
};
