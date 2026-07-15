import { appConfig } from "./app-config";

const BASE_URL = appConfig.backendUrl;

// API Routes
export const API_ROUTES = {
  // Auth
  AUTH: {
    SIGNUP: `${BASE_URL}/api/user/signup`,
    LOGIN: `${BASE_URL}/api/user/login`,
  },

  // Users
  USERS: {
    BASE: `${BASE_URL}/api/user`,
    BY_ID: (id: string) => `${BASE_URL}/api/user/${id}`,
    BY_ROLE: (role: string) => `${BASE_URL}/api/user/role/${role}`,
    ASSIGN_LOCATION: (id: string) => `${BASE_URL}/api/user/${id}/location`,
  },

  // Courses
  COURSES: {
    BASE: `${BASE_URL}/api/content/course`,
    BY_ID: (id: string) => `${BASE_URL}/api/content/course/${id}`,
  },

  // Subjects
  SUBJECTS: {
    BASE: `${BASE_URL}/api/content/subject`,
    BY_ID: (id: string) => `${BASE_URL}/api/content/subject/${id}`,
    BY_COURSE: (courseId: string) => `${BASE_URL}/api/content/subject/course/${courseId}`,
  },

  // Topics
  TOPICS: {
    BASE: `${BASE_URL}/api/content/topic`,
    BY_ID: (id: string) => `${BASE_URL}/api/content/topic/${id}`,
    BY_SUBJECT: (subjectId: string) => `${BASE_URL}/api/content/topic/subject/${subjectId}`,
  },

  // Questions
  QUESTIONS: {
    BASE: `${BASE_URL}/api/question`,
    BY_ID: (id: string) => `${BASE_URL}/api/question/${id}`,
    BY_SUBJECT: (subjectId: string) => `${BASE_URL}/api/question/subject/${subjectId}`,
    BY_TOPIC: (topicId: string) => `${BASE_URL}/api/question/topic/${topicId}`,
    FILTER: `${BASE_URL}/api/question/filter`,
    BULK: `${BASE_URL}/api/question/bulk`,
    IMPORT_TEMPLATE: `${BASE_URL}/api/question/import-template`,
  },

  // Enrollments
  ENROLLMENTS: {
    BASE: `${BASE_URL}/api/enrollment`,
    BY_ID: (id: string) => `${BASE_URL}/api/enrollment/${id}`,
  },

  // Students
  STUDENTS: {
    BASE: `${BASE_URL}/api/student/list`,
    BY_ID: (id: string) => `${BASE_URL}/api/student/${id}`,
  },

  // Teachers
  TEACHERS: {
    BASE: `${BASE_URL}/api/teacher`,
    BY_ID: (id: string) => `${BASE_URL}/api/teacher/${id}`,
    ASSIGN: `${BASE_URL}/api/teacher/assign`,
    ASSIGNMENTS: (teacherId: string) => `${BASE_URL}/api/teacher/${teacherId}/assignments`,
  },

  // Tests
  TESTS: {
    BASE: `${BASE_URL}/api/test`,
    BY_ID: (id: string) => `${BASE_URL}/api/test/${id}`,
    START: `${BASE_URL}/api/test/start`,
    SUBMIT: (id: string) => `${BASE_URL}/api/test/${id}/submit`,
    ABANDON: (id: string) => `${BASE_URL}/api/test/abandon/${id}`,
    RESULT: (id: string) => `${BASE_URL}/api/test/result/${id}/`,
    HISTORY: `${BASE_URL}/api/test/history`,
  },

  // Dashboard
  DASHBOARD: {
    STATS: `${BASE_URL}/api/dashboard/stats`,
    STUDENT_ANALYTICS: (studentId: string) => `${BASE_URL}/api/dashboard/student/${studentId}`,
    TEACHER_ANALYTICS: (teacherId: string) => `${BASE_URL}/api/dashboard/teacher/${teacherId}`,
    STUDENT_TOPIC_PERFORMANCE: `${BASE_URL}/api/dashboard/student/topic-performance`,
    STUDENT_SUBJECT_PERFORMANCE: `${BASE_URL}/api/dashboard/student/subject-performance`,
    STUDENT_DIFFICULTY_BREAKDOWN: `${BASE_URL}/api/dashboard/student/difficulty-breakdown`,
    STUDENT_TIME_ANALYSIS: `${BASE_URL}/api/dashboard/student/time-analysis`,
    STUDENT_PERFORMANCE_TRENDS: `${BASE_URL}/api/dashboard/student/performance-trends`,
    STUDENT_STRENGTHS_WEAKNESSES: `${BASE_URL}/api/dashboard/student/strengths-weaknesses`,
  },

  // Locations
  LOCATIONS: {
    BASE: `${BASE_URL}/api/user/location`,
    BY_ID: (id: string) => `${BASE_URL}/api/user/location/${id}`,
  },
} as const;

// Socket.IO URL
export const SOCKET_URL = `${BASE_URL}`;
