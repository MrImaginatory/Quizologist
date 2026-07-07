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
  // Enroll — student only
  {
    path: "/enrollment",
    target: `${env.STUDENT_SERVICE_URL}/api/enrollment`,
    auth: true,
    roles: ["student"],
    methods: ["POST"],
  },
  // View enrollments — student only
  {
    path: "/enrollment",
    target: `${env.STUDENT_SERVICE_URL}/api/enrollment`,
    auth: true,
    roles: ["student"],
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
