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
};

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  subjectName: string;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
  avgTimePerQuestion: number;
  status: "strong" | "moderate" | "weak";
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
  avgTimePerQuestion: number;
  status: "strong" | "moderate" | "weak";
}

export interface PerformanceTrend {
  testId: string;
  score: number;
  correct: number;
  incorrect: number;
  totalQuestions: number;
  date: string;
}

export interface StrengthsWeaknessesResponse {
  success: boolean;
  message: string;
  data: {
    strong: TopicPerformance[];
    weak: TopicPerformance[];
    overallAccuracy: number;
    totalTopicsAttempted: number;
    totalTests: number;
  };
}

export interface TopicPerformanceResponse {
  success: boolean;
  message: string;
  data: {
    topics: TopicPerformance[];
    totalTests: number;
  };
}

export interface SubjectPerformanceResponse {
  success: boolean;
  message: string;
  data: {
    subjects: SubjectPerformance[];
    totalTests: number;
  };
}

export interface PerformanceTrendsResponse {
  success: boolean;
  message: string;
  data: {
    last15Days: PerformanceTrend[];
    last30Days: PerformanceTrend[];
    last60Days: PerformanceTrend[];
  };
}

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

export interface Question {
  id: string;
  type: "mcq" | "descriptive";
  question: string;
  choices: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  videoUrl: string | null;
  difficulty: string;
  topic_id: string;
  subject_id: string;
  course_id: string;
  questionAddedBy: string;
}

export interface QuestionsResponse {
  success: boolean;
  message: string;
  data: {
    questions: Question[];
    pagination: Pagination;
  };
}

export const questionsApi = {
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

export interface Enrollment {
  id: string;
  student_id: string;
  course: { id: string; name: string };
  subject: { id: string; name: string } | null;
  topic: { id: string; name: string } | null;
}

export interface EnrollmentsResponse {
  success: boolean;
  message: string;
  data: {
    enrollments: Enrollment[];
    pagination: Pagination;
  };
}

export interface EnrollmentPayload {
  enrollments: {
    course_id: string;
    subject_id?: string;
    topic_id?: string;
  }[];
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data: {
    created: Enrollment[];
    skipped: { enrollment: { course_id: string; subject_id?: string; topic_id?: string }; reason: string }[];
    totalCreated: number;
    totalSkipped: number;
  };
}

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
};

export interface TestHistory {
  id: string;
  test_id: string;
  status: string;
  totalQuestions: number;
  correct: number;
  score: number;
  startedAt: string;
}

export interface TestHistoryResponse {
  success: boolean;
  message: string;
  data: {
    tests: TestHistory[];
    pagination: Pagination;
  };
}

export const testsApi = {
  getHistory: (page = 1, limit = 10, token?: string) =>
    apiRequest<TestHistoryResponse>(`${API_ROUTES.TESTS.HISTORY}?page=${page}&limit=${limit}`, { token }),
  getById: (id: string, token?: string) =>
    apiRequest(API_ROUTES.TESTS.BY_ID(id), { token }),
};
