import { env } from "./env";

export interface RouteConfig {
  path: string;
  target: string;
  auth: boolean;
  roles?: string[];
  methods?: string[]; // HTTP methods this rule applies to. If omitted, applies to all.
}

export const routes: RouteConfig[] = [
  // ==================== User Service ====================
  {
    path: "/user/signup",
    target: `${env.USER_SERVICE_URL}/api/user/signup`,
    auth: false,
  },
  {
    path: "/user/login",
    target: `${env.USER_SERVICE_URL}/api/user/login`,
    auth: false,
  },
  {
    path: "/user/location",
    target: `${env.USER_SERVICE_URL}/api/user/location`,
    auth: true,
    roles: ["admin"],
  },
  {
    path: "/user/role",
    target: `${env.USER_SERVICE_URL}/api/user/role`,
    auth: true,
    roles: ["admin"],
  },
  {
    path: "/user",
    target: `${env.USER_SERVICE_URL}/api/user`,
    auth: true,
    roles: ["admin"],
  },

  // ==================== Content Service ====================
  // Course — write operations admin only
  {
    path: "/content/course",
    target: `${env.CONTENT_SERVICE_URL}/api/content/course`,
    auth: true,
    roles: ["admin"],
    methods: ["POST", "PUT", "DELETE"],
  },
  // Course — read operations all authenticated users
  {
    path: "/content/course",
    target: `${env.CONTENT_SERVICE_URL}/api/content/course`,
    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["GET"],
  },
  // Subject — write operations admin only
  {
    path: "/content/subject",
    target: `${env.CONTENT_SERVICE_URL}/api/content/subject`,
    auth: true,
    roles: ["admin"],
    methods: ["POST", "PUT", "DELETE"],
  },
  // Subject — read operations all authenticated users
  {
    path: "/content/subject",
    target: `${env.CONTENT_SERVICE_URL}/api/content/subject`,
    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["GET"],
  },
  // Topic — write operations admin only
  {
    path: "/content/topic",
    target: `${env.CONTENT_SERVICE_URL}/api/content/topic`,
    auth: true,
    roles: ["admin"],
    methods: ["POST", "PUT", "DELETE"],
  },
  // Topic — read operations all authenticated users
  {
    path: "/content/topic",
    target: `${env.CONTENT_SERVICE_URL}/api/content/topic`,
    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["GET"],
  },

  // ==================== Question Service ====================
  // Import endpoints — admin and teacher only (must come before /question)
  {
    path: "/question/import-template",
    target: `${env.QUESTION_SERVICE_URL}/api/question/import-template`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },
  {
    path: "/question/bulk",
    target: `${env.QUESTION_SERVICE_URL}/api/question/bulk`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["POST"],
  },

  // Write operations — admin and teacher only
  {
    path: "/question",
    target: `${env.QUESTION_SERVICE_URL}/api/question`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["POST"],
  },
  {
    path: "/question",
    target: `${env.QUESTION_SERVICE_URL}/api/question`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["PUT"],
  },
  {
    path: "/question",
    target: `${env.QUESTION_SERVICE_URL}/api/question`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["DELETE"],
  },

  // Read operations — all authenticated users
  {
    path: "/question",
    target: `${env.QUESTION_SERVICE_URL}/api/question`,
    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["GET"],
  },

  // ==================== Student Service ====================
  // Get students with filters — admin only
  {
    path: "/student/list",
    target: `${env.STUDENT_SERVICE_URL}/api/student/list`,
    auth: true,
    roles: ["admin"],
    methods: ["GET"],
  },
  // Get student enrollments by ID — admin only
  {
    path: "/student",
    target: `${env.STUDENT_SERVICE_URL}/api/student`,
    auth: true,
    roles: ["admin"],
    methods: ["GET"],
  },
  // Enroll — student only
  {
    path: "/enrollment",
    target: `${env.STUDENT_SERVICE_URL}/api/enrollment`,
    auth: true,
    roles: ["student"],
    methods: ["POST"],
  },
  // View own enrollments — student only
  {
    path: "/enrollment",
    target: `${env.STUDENT_SERVICE_URL}/api/enrollment`,
    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // Get enrolled courses — student only
  {
    path: "/enrollment/courses",
    target: `${env.STUDENT_SERVICE_URL}/api/enrollment/courses`,
    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // Get enrolled subjects for a course — student only
  {
    path: "/enrollment/subjects",
    target: `${env.STUDENT_SERVICE_URL}/api/enrollment/subjects`,
    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // Get enrolled topics for a subject — student only
  {
    path: "/enrollment/topics",
    target: `${env.STUDENT_SERVICE_URL}/api/enrollment/topics`,
    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // View enrollments by student ID — admin and teacher
  {
    path: "/enrollment/student",
    target: `${env.STUDENT_SERVICE_URL}/api/enrollment/student`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },
  // Unenroll — student only
  {
    path: "/enrollment",
    target: `${env.STUDENT_SERVICE_URL}/api/enrollment`,
    auth: true,
    roles: ["student"],
    methods: ["DELETE"],
  },

  // ==================== Test Service ====================
  // Start test — student only
  {
    path: "/test/start",
    target: `${env.TEST_SERVICE_URL}/api/test/start`,
    auth: true,
    roles: ["student"],
    methods: ["POST"],
  },
  // Submit test — student only
  {
    path: "/test/submit",
    target: `${env.TEST_SERVICE_URL}/api/test/submit`,
    auth: true,
    roles: ["student"],
    methods: ["POST"],
  },
  // Abandon test — student only
  {
    path: "/test/abandon",
    target: `${env.TEST_SERVICE_URL}/api/test/abandon`,
    auth: true,
    roles: ["student"],
    methods: ["POST"],
  },
  // Test history — student only
  {
    path: "/test/history",
    target: `${env.TEST_SERVICE_URL}/api/test/history`,
    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // Get student performance, results, summary — admin, teacher; student (own data via service check)
  {
    path: "/test/student",
    target: `${env.TEST_SERVICE_URL}/api/test/student`,
    auth: true,
    roles: ["student", "admin", "teacher"],
    methods: ["GET"],
  },
  // Get test detail for admin — admin and teacher
  {
    path: "/test/detail",
    target: `${env.TEST_SERVICE_URL}/api/test/detail`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },
  // Get all tests — admin only
  {
    path: "/test/all",
    target: `${env.TEST_SERVICE_URL}/api/test/all`,
    auth: true,
    roles: ["admin"],
    methods: ["GET"],
  },
  // Get test result — student only
  {
    path: "/test/result",
    target: `${env.TEST_SERVICE_URL}/api/test/result`,
    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },

  // ==================== Predefined Test Service ====================
  // Get pending tests — student only
  {
    path: "/test/predefined/pending",
    target: `${env.TEST_SERVICE_URL}/api/test/predefined/pending`,
    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // Join test by token — student only
  {
    path: "/test/predefined/join",
    target: `${env.TEST_SERVICE_URL}/api/test/predefined/join`,
    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // All predefined test POST operations — admin, teacher, student (test service handles role check)
  {
    path: "/test/predefined",
    target: `${env.TEST_SERVICE_URL}/api/test/predefined`,
    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["POST"],
  },
  // Get all predefined tests — admin and teacher
  {
    path: "/test/predefined",
    target: `${env.TEST_SERVICE_URL}/api/test/predefined`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },
  // Get predefined test by ID — admin, teacher, student
  {
    path: "/test/predefined",
    target: `${env.TEST_SERVICE_URL}/api/test/predefined`,
    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["GET"],
  },
  // Update predefined test — admin and teacher
  {
    path: "/test/predefined",
    target: `${env.TEST_SERVICE_URL}/api/test/predefined`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["PUT"],
  },
  // Delete predefined test — admin and teacher
  {
    path: "/test/predefined",
    target: `${env.TEST_SERVICE_URL}/api/test/predefined`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["DELETE"],
  },

  // Get test by ID — student only (MUST be AFTER /test/predefined routes)
  {
    path: "/test",
    target: `${env.TEST_SERVICE_URL}/api/test`,
    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },

  // ==================== Teacher Service ====================
  // Get teachers with assignment counts — admin only
  {
    path: "/teacher/list",
    target: `${env.TEACHER_SERVICE_URL}/api/teacher/list`,
    auth: true,
    roles: ["admin"],
    methods: ["GET"],
  },
  // Assign course to teacher — admin only
  {
    path: "/teacher/assign/course",
    target: `${env.TEACHER_SERVICE_URL}/api/teacher/assign/course`,
    auth: true,
    roles: ["admin"],
    methods: ["POST"],
  },
  // Assign subject to teacher — admin only
  {
    path: "/teacher/assign/subject",
    target: `${env.TEACHER_SERVICE_URL}/api/teacher/assign/subject`,
    auth: true,
    roles: ["admin"],
    methods: ["POST"],
  },
  // Bulk assign subjects — admin and teacher
  {
    path: "/teacher/assign/bulk-subjects",
    target: `${env.TEACHER_SERVICE_URL}/api/teacher/assign/bulk-subjects`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["POST"],
  },
  // Remove assignment — admin only
  {
    path: "/teacher/unenroll",
    target: `${env.TEACHER_SERVICE_URL}/api/teacher/unenroll`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["DELETE"],
  },
  // Get all assignments — admin only
  {
    path: "/teacher/teacher-enrollment",
    target: `${env.TEACHER_SERVICE_URL}/api/teacher/teacher-enrollment`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },
  // Get teacher assignments — admin and teacher
  {
    path: "/teacher/teacher",
    target: `${env.TEACHER_SERVICE_URL}/api/teacher/teacher`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },
  // Teaching data — teacher sees their own students/tests
  {
    path: "/teacher/teaching",
    target: `${env.TEACHER_SERVICE_URL}/api/teacher/teaching`,
    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },

  // ==================== Dashboard Service ====================
  // Get dashboard stats — all authenticated users
  {
    path: "/dashboard/stats",
    target: `${env.DASHBOARD_SERVICE_URL}/api/dashboard/stats`,
    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["GET"],
  },
  // Student analytics — student only
  {
    path: "/dashboard/student",
    target: `${env.DASHBOARD_SERVICE_URL}/api/dashboard/student`,
    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // Admin analytics — admin only
  {
    path: "/dashboard/analytics",
    target: `${env.DASHBOARD_SERVICE_URL}/api/dashboard/analytics`,
    auth: true,
    roles: ["admin"],
    methods: ["GET"],
  },
];

export function findMatchingRoute(
  reqPath: string,
  reqMethod: string
): { route: RouteConfig; remainingPath: string } | null {
  const normalised = reqPath.endsWith("/") ? reqPath.slice(0, -1) : reqPath;
  const upperMethod = reqMethod.toUpperCase();

  for (const route of routes) {
    const routePath = route.path.endsWith("/")
      ? route.path.slice(0, -1)
      : route.path;

    const pathMatch =
      normalised === routePath || normalised.startsWith(routePath + "/");

    if (!pathMatch) continue;

    // If the route specifies methods, the request method must match
    if (route.methods && !route.methods.includes(upperMethod)) continue;

    return { route, remainingPath: normalised.slice(routePath.length) };
  }
  return null;
}
