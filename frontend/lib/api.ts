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
  location?: {
    id: string;
    address_line_1: string;
    city: string;
    pincode: string;
    state: string;
    country: string;
  } | null;
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
  assignLocation: (userId: string, locationId: string | null, token?: string) =>
    apiRequest(API_ROUTES.USERS.ASSIGN_LOCATION(userId), {
      method: "PATCH",
      body: JSON.stringify({ location_id: locationId }),
      token,
    }),
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
    usersByLocation?: Array<{
      id: string;
      city: string;
      state: string;
      user_count: number;
    }>;
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

export interface Location {
  id: string;
  address_line_1: string;
  address_line_2?: string;
  landmark?: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  is_central: boolean;
}

export interface CreateLocationPayload {
  address_line_1: string;
  address_line_2?: string;
  landmark?: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
}

export interface LocationsResponse {
  success: boolean;
  message: string;
  data: {
    locations: Location[];
    pagination: Pagination;
  };
}

export interface LocationResponse {
  success: boolean;
  message: string;
  data: Location;
}

export const locationsApi = {
  getAll: (page = 1, limit = 10, token?: string) =>
    apiRequest<LocationsResponse>(`${API_ROUTES.LOCATIONS.BASE}?page=${page}&limit=${limit}`, { token }),
  getById: (id: string, token?: string) =>
    apiRequest<LocationResponse>(API_ROUTES.LOCATIONS.BY_ID(id), { token }),
  create: (payload: CreateLocationPayload, token?: string) =>
    apiRequest<LocationResponse>(API_ROUTES.LOCATIONS.BASE, {
      method: "POST",
      body: JSON.stringify(payload),
      token,
    }),
  update: (id: string, payload: Partial<CreateLocationPayload>, token?: string) =>
    apiRequest<LocationResponse>(API_ROUTES.LOCATIONS.BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(payload),
      token,
    }),
  delete: (id: string, token?: string) =>
    apiRequest(API_ROUTES.LOCATIONS.BY_ID(id), { method: "DELETE", token }),
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

export interface EnrolledCourse {
  id: string;
  name: string;
}

export interface EnrolledCoursesResponse {
  success: boolean;
  message: string;
  data: {
    courses: EnrolledCourse[];
  };
}

export interface EnrolledSubjectsResponse {
  success: boolean;
  message: string;
  data: {
    subjects: { id: string; name: string }[];
  };
}

export interface EnrolledTopicsResponse {
  success: boolean;
  message: string;
  data: {
    topics: { id: string; name: string }[];
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
  getEnrolledCourses: (token?: string): Promise<EnrolledCoursesResponse> =>
    apiRequest<EnrolledCoursesResponse>(API_ROUTES.ENROLLMENTS.ENROLLED_COURSES, { token }),
  getEnrolledSubjects: (courseId: string, token?: string): Promise<EnrolledSubjectsResponse> =>
    apiRequest<EnrolledSubjectsResponse>(API_ROUTES.ENROLLMENTS.ENROLLED_SUBJECTS(courseId), { token }),
  getEnrolledTopics: (courseId: string, subjectId: string, token?: string): Promise<EnrolledTopicsResponse> =>
    apiRequest<EnrolledTopicsResponse>(API_ROUTES.ENROLLMENTS.ENROLLED_TOPICS(courseId, subjectId), { token }),
};

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  course_id: string;
  subject_id: string | null;
  course?: { id: string; name: string };
  subject?: { id: string; name: string } | null;
  teacher?: { id: string; fname: string; lname: string; email: string };
}

export interface TeacherAssignmentsResponse {
  success: boolean;
  message: string;
  data: {
    teacher: {
      id: string;
      fname: string;
      lname: string;
      email: string;
      role: string;
    };
    assignments: {
      id: string;
      name: string;
      subjects: { id: string; name: string }[];
    }[];
  };
}

export interface BulkSubjectPayload {
  teacher_id: string;
  course_id: string;
  subject_ids?: string[];
}

export interface BulkSubjectResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    created: number;
    skipped: number;
    assignments: TeacherAssignment[];
  };
}

export interface TeacherListResponse {
  success: boolean;
  message: string;
  data: {
    teachers: {
      id: string;
      fname: string;
      lname: string;
      email: string;
      mobileNumber: string;
      createdAt: string;
      courseCount: number;
      subjectCount: number;
      totalAssignments: number;
    }[];
    pagination: Pagination;
  };
}

export interface TeacherEnrollmentItem {
  id: string;
  teacher: { id: string; fname: string; lname: string; email: string };
  course: { id: string; name: string };
  subject: { id: string; name: string } | null;
}

export interface TeacherEnrollmentResponse {
  success: boolean;
  message: string;
  data: {
    assignments: TeacherEnrollmentItem[];
    pagination: Pagination;
  };
}

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

export interface TeachingTest {
  id: string;
  test_id: string;
  student: {
    id: string;
    fname: string;
    lname: string;
    email: string;
  };
  status: string;
  subject_id: string | null;
  topic_id: string | null;
  total_questions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  score: number;
  started_at: string;
  completed_at: string | null;
}

export interface TeachingTestsResponse {
  success: boolean;
  message: string;
  data: {
    tests: TeachingTest[];
    pagination: Pagination;
  };
}

export interface TeachingStudent {
  id: string;
  fname: string;
  lname: string;
  email: string;
  course_id: string;
  subject_id: string;
}

export interface TeachingStudentsResponse {
  success: boolean;
  message: string;
  data: {
    students: TeachingStudent[];
    pagination: Pagination;
  };
}

export interface TopStudent {
  id: string;
  fname: string;
  lname: string;
  email: string;
  totalTests: number;
  avgScore: number;
  avgCorrect: number;
  avgIncorrect: number;
}

export interface TopStudentsResponse {
  success: boolean;
  message: string;
  data: {
    students: TopStudent[];
  };
}

export interface WeakTopic {
  topicId: string;
  topicName: string;
  subjectName: string;
  courseName: string;
  weakStudentCount: number;
  totalStudents: number;
  avgAccuracy: number;
}

export interface WeaknessSummaryResponse {
  success: boolean;
  message: string;
  data: {
    weakTopics: WeakTopic[];
  };
}

export interface CoverageTopic {
  topicId: string;
  topicName: string;
  subjectName: string;
  courseName: string;
  count: number;
}

export interface QuestionCoverageResponse {
  success: boolean;
  message: string;
  data: {
    topics: CoverageTopic[];
  };
}

export interface TestHistory {
  id: string;
  test_id: string;
  status: string;
  total_questions: number;
  correct: number;
  score: string | number;
  started_at: string;
  course?: { id: string; name: string };
}

export interface TestHistoryResponse {
  success: boolean;
  message: string;
  data: {
    tests: TestHistory[];
    pagination: Pagination;
  };
}

export interface StartTestPayload {
  duration_minutes: number;
  question_limit: number;
  selections: {
    course_id: string;
    subject_id?: string;
    topic_id?: string;
  }[];
}

export interface TestSession {
  id: string;
  test_id: string;
  status: string;
  duration_minutes: number;
  question_limit: number;
  ends_at: string;
  totalQuestions: number;
  questions: {
    index: number;
    questionId: string;
    question: string;
    choices: string[];
    difficulty: string;
    topicName: string;
    subjectName: string;
    courseName: string;
  }[];
}

export interface StartTestResponse {
  success: boolean;
  message: string;
  data: TestSession;
}

export interface SubmitTestResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    test_id: string;
    status: string;
    totalQuestions: number;
    attempted: number;
    skipped: number;
    correct: number;
    incorrect: number;
    score: number;
  };
}

export interface TestResult {
  id: string;
  test_id: string;
  status: string;
  totalQuestions: number;
  attempted: number;
  skipped: number;
  correct: number;
  incorrect: number;
  score: number;
  disconnectCount: number;
  startedAt: string;
  completedAt: string;
  questions: {
    index: number;
    question: string;
    choices: string[];
    selectedAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    videoUrl: string;
    timeTaken: number;
    topicName: string;
    subjectName: string;
    courseName: string;
  }[];
}

export interface TestResultResponse {
  success: boolean;
  message: string;
  data: TestResult;
}

export interface StudentResultsResponse {
  success: boolean;
  message: string;
  data: {
    results: TestResult[];
    pagination: Pagination;
  };
}

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
export interface PredefinedTest {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  status: "draft" | "active" | "inactive" | "archived";
  is_scheduled: boolean;
  start_time: string | null;
  end_time: string | null;
  timezone: string;
  duration_minutes: number;
  question_limit: number;
  difficulty: string;
  difficulty_ratio: { beginner?: number; normal?: number; mid?: number; hard?: number; expert?: number } | null;
  use_fixed_questions: boolean;
  use_specific_students: boolean;
  max_attempts: number;
  course_ids: string[];
  subject_ids: string[] | null;
  topic_ids: string[] | null;
  test_link_token: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PredefinedTestResponse {
  success: boolean;
  message: string;
  data: {
    tests: PredefinedTest[];
    pagination: Pagination;
  };
}

export interface PredefinedTestDetailResponse {
  success: boolean;
  message: string;
  data: PredefinedTest;
}

export interface CreatePredefinedTestPayload {
  title: string;
  description?: string;
  is_scheduled?: boolean;
  start_time?: string;
  end_time?: string;
  timezone?: string;
  duration_minutes: number;
  question_limit: number;
  difficulty?: string;
  difficulty_ratio?: { beginner?: number; normal?: number; mid?: number; hard?: number; expert?: number };
  use_fixed_questions?: boolean;
  use_specific_students?: boolean;
  max_attempts?: number;
  course_ids: string[];
  subject_ids?: string[];
  topic_ids?: string[];
  fixed_question_ids?: string[];
  student_ids?: string[];
}

export interface PredefinedTestStartResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    test_id: string;
    status: string;
    duration_minutes: number;
    question_limit: number;
    ends_at: string;
    totalQuestions: number;
    questions: {
      index: number;
      questionId: string;
      question: string;
      choices: string[];
      difficulty: string;
      topicName: string;
      subjectName: string;
      courseName: string;
    }[];
  };
}

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
