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
  },

  // Faculties
  FACULTIES: {
    BASE: `${BASE_URL}/api/content/faculty`,
    BY_ID: (id: string) => `${BASE_URL}/api/faculty/${id}`,
  },

  // Subjects
  SUBJECTS: {
    BASE: `${BASE_URL}/api/content/subject`,
    BY_ID: (id: string) => `${BASE_URL}/api/subject/${id}`,
    BY_FACULTY: (facultyId: string) => `${BASE_URL}/api/subject/faculty/${facultyId}`,
  },

  // Topics
  TOPICS: {
    BASE: `${BASE_URL}/api/content/topic`,
    BY_ID: (id: string) => `${BASE_URL}/api/topic/${id}`,
    BY_SUBJECT: (subjectId: string) => `${BASE_URL}/api/topic/subject/${subjectId}`,
  },

  // Questions
  QUESTIONS: {
    BASE: `${BASE_URL}/api/question`,
    BY_ID: (id: string) => `${BASE_URL}/api/question/${id}`,
    BY_SUBJECT: (subjectId: string) => `${BASE_URL}/api/question/subject/${subjectId}`,
    BY_TOPIC: (topicId: string) => `${BASE_URL}/api/question/topic/${topicId}`,
  },

  // Students
  STUDENTS: {
    BASE: `${BASE_URL}/api/student`,
    BY_ID: (id: string) => `${BASE_URL}/api/student/${id}`,
    ENROLL: `${BASE_URL}/api/student/enroll`,
    ENROLLMENTS: (studentId: string) => `${BASE_URL}/api/student/${studentId}/enrollments`,
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
    START: (id: string) => `${BASE_URL}/api/test/${id}/start`,
    SUBMIT: (id: string) => `${BASE_URL}/api/test/${id}/submit`,
    RESULT: (id: string) => `${BASE_URL}/api/test/${id}/result`,
  },

  // Dashboard
  DASHBOARD: {
    STATS: `${BASE_URL}/api/dashboard/stats`,
    STUDENT_ANALYTICS: (studentId: string) => `${BASE_URL}/api/dashboard/student/${studentId}`,
    TEACHER_ANALYTICS: (teacherId: string) => `${BASE_URL}/api/dashboard/teacher/${teacherId}`,
  },
} as const;

// Socket.IO URL
export const SOCKET_URL = `${BASE_URL}`;
