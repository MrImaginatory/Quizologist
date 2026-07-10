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
    path: "/user",
    target: `${env.USER_SERVICE_URL}/api/user`,
    auth: true,
    roles: ["admin"],
  },
  {
    path: "/user/role",
    target: `${env.USER_SERVICE_URL}/api/user/role`,
    auth: true,
    roles: ["admin"],
  },

  // ==================== Content Service ====================
  {
    path: "/content/faculty",
    target: `${env.CONTENT_SERVICE_URL}/api/content/faculty`,
    auth: true,
    roles: ["admin"],
  },
  {
    path: "/content/subject",
    target: `${env.CONTENT_SERVICE_URL}/api/content/subject`,
    auth: true,
    roles: ["admin", "teacher", "student"],
  },
  {
    path: "/content/topic",
    target: `${env.CONTENT_SERVICE_URL}/api/content/topic`,
    auth: true,
    roles: ["admin", "teacher", "student"],
  },

  // ==================== Question Service ====================
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
  // Test history — student only
  {
    path: "/test/history",
    target: `${env.TEST_SERVICE_URL}/api/test/history`,
    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // Get student performance — admin and teacher
  {
    path: "/test/student",
    target: `${env.TEST_SERVICE_URL}/api/test/student`,
    auth: true,
    roles: ["admin", "teacher"],
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
  // Get test by ID — student only
  {
    path: "/test",
    target: `${env.TEST_SERVICE_URL}/api/test`,
    auth: true,
    roles: ["student"],
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
