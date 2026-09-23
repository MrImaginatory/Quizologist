import { env } from "./env";

export interface RouteConfig {
  path: string;

  auth: boolean;
  roles?: string[];
  methods?: string[]; // HTTP methods this rule applies to. If omitted, applies to all.
}

export const routes: RouteConfig[] = [
  // ==================== User Service ====================
  {
    path: "/user/me",

    auth: true,
  },
  {
    path: "/user/signup",

    auth: false,
  },
  {
    path: "/user/login",

    auth: false,
  },
  {
    path: "/user/location",

    auth: true,
    roles: ["admin"],
  },
  {
    path: "/user/role",

    auth: true,
    roles: ["admin"],
  },
  // Token lifecycle endpoints (MED-02 + MED-05). `auth: false` at the gateway
  // because they operate on the HttpOnly cookies themselves — refresh and
  // logout must still work when the access token has already expired.
  // They MUST be declared before the catch-all `/user` (admin) rule below.
  {
    path: "/user/refresh",

    auth: false,
    methods: ["POST"],
  },
  {
    path: "/user/logout",

    auth: false,
    methods: ["POST"],
  },
  {
    path: "/user/logout-all",

    auth: false,
    methods: ["POST"],
  },
  // MED-02: short-lived socket handshake ticket — gateway-authenticated via
  // cookie or bearer, never exposes the long-lived access token to JS.
  {
    path: "/user/socket-ticket",

    auth: true,
    methods: ["POST"],
  },
  {
    path: "/user",

    auth: true,
    roles: ["admin"],
  },

  // ==================== Content Service ====================
  // Bulk hierarchy import — admin only
  {
    path: "/content/bulk-hierarchy",

    auth: true,
    roles: ["admin"],
    methods: ["POST"],
  },
  // Course — write operations admin only
  {
    path: "/content/course",

    auth: true,
    roles: ["admin"],
    methods: ["POST", "PUT", "DELETE"],
  },
  // Course — read operations all authenticated users
  {
    path: "/content/course",

    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["GET"],
  },
  // Subject — write operations admin only
  {
    path: "/content/subject",

    auth: true,
    roles: ["admin"],
    methods: ["POST", "PUT", "DELETE"],
  },
  // Subject — read operations all authenticated users
  {
    path: "/content/subject",

    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["GET"],
  },
  // Topic — write operations admin only
  {
    path: "/content/topic",

    auth: true,
    roles: ["admin"],
    methods: ["POST", "PUT", "DELETE"],
  },
  // Topic — read operations all authenticated users
  {
    path: "/content/topic",

    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["GET"],
  },

  // ==================== Question Service ====================
  // Import endpoints — admin and teacher only (must come before /question)
  {
    path: "/question/import-template",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },
  {
    path: "/question/bulk",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["POST"],
  },

  // Write operations — admin and teacher only
  {
    path: "/question",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["POST"],
  },
  {
    path: "/question",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["PUT"],
  },
  {
    path: "/question",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["DELETE"],
  },

  // Read operations — all authenticated users
  {
    path: "/question",

    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["GET"],
  },

  // ==================== Student Service ====================
  // Get students with filters — admin only
  {
    path: "/student/list",

    auth: true,
    roles: ["admin"],
    methods: ["GET"],
  },
  // Get student enrollments by ID — admin only
  {
    path: "/student",

    auth: true,
    roles: ["admin"],
    methods: ["GET"],
  },
  // Enroll — student only
  {
    path: "/enrollment",

    auth: true,
    roles: ["student"],
    methods: ["POST"],
  },
  // View own enrollments — student only
  {
    path: "/enrollment",

    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // Get enrolled courses — student only
  {
    path: "/enrollment/courses",

    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // Get enrolled subjects for a course — student only
  {
    path: "/enrollment/subjects",

    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // Get enrolled topics for a subject — student only
  {
    path: "/enrollment/topics",

    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // View enrollments by student ID — admin and teacher
  {
    path: "/enrollment/student",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },
  // Unenroll — student only
  {
    path: "/enrollment",

    auth: true,
    roles: ["student"],
    methods: ["DELETE"],
  },

  // ==================== Test Service ====================
  // Pre-assessment — student only
  {
    path: "/test/pre-assessment",

    auth: true,
    roles: ["student"],
    methods: ["GET", "POST"],
  },
  // Start test — student only
  {
    path: "/test/start",

    auth: true,
    roles: ["student"],
    methods: ["POST"],
  },
  // Start time-based test - student only
  {
    path: "/test/time-based/start",

    auth: true,
    roles: ["student"],
    methods: ["POST"],
  },
  // Submit test — student only
  {
    path: "/test/submit",

    auth: true,
    roles: ["student"],
    methods: ["POST"],
  },
  // Abandon test — student only
  {
    path: "/test/abandon",

    auth: true,
    roles: ["student"],
    methods: ["POST"],
  },
  // Test history — student only
  {
    path: "/test/history",

    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // Get student performance, results, summary — admin, teacher; student (own data via service check)
  {
    path: "/test/student",

    auth: true,
    roles: ["student", "admin", "teacher"],
    methods: ["GET"],
  },
  // Get test detail for admin — admin and teacher
  {
    path: "/test/detail",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },
  // Get all tests — admin only
  {
    path: "/test/all",

    auth: true,
    roles: ["admin"],
    methods: ["GET"],
  },
  // Get test result — student only
  {
    path: "/test/result",

    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },

  // ==================== Predefined Test Service ====================
  // Get pending tests — student only
  {
    path: "/test/predefined/pending",

    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // Join test by token — student only
  {
    path: "/test/predefined/join",

    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // All predefined test POST operations — admin, teacher, student (test service handles role check)
  {
    path: "/test/predefined",

    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["POST"],
  },
  // Get all predefined tests — admin and teacher
  {
    path: "/test/predefined",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },
  // Get predefined test by ID — admin, teacher, student
  {
    path: "/test/predefined",

    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["GET"],
  },
  // Update predefined test — admin and teacher
  {
    path: "/test/predefined",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["PUT"],
  },
  // Delete predefined test — admin and teacher
  {
    path: "/test/predefined",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["DELETE"],
  },

  // Get test by ID — student only (MUST be AFTER /test/predefined routes)
  {
    path: "/test",

    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },

  // ==================== Teacher Service ====================
  // Get teachers with assignment counts — admin only
  {
    path: "/teacher/list",

    auth: true,
    roles: ["admin"],
    methods: ["GET"],
  },
  // Assign course to teacher — admin only
  {
    path: "/teacher/assign/course",

    auth: true,
    roles: ["admin"],
    methods: ["POST"],
  },
  // Assign subject to teacher — admin only
  {
    path: "/teacher/assign/subject",

    auth: true,
    roles: ["admin"],
    methods: ["POST"],
  },
  // Bulk assign subjects — admin and teacher
  {
    path: "/teacher/assign/bulk-subjects",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["POST"],
  },
  // Remove assignment — admin only
  {
    path: "/teacher/unenroll",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["DELETE"],
  },
  // Get all assignments — admin only
  {
    path: "/teacher/teacher-enrollment",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },
  // Get teacher assignments — admin and teacher
  {
    path: "/teacher/teacher",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },
  // Teaching data — teacher sees their own students/tests
  {
    path: "/teacher/teaching",

    auth: true,
    roles: ["admin", "teacher"],
    methods: ["GET"],
  },

  // ==================== Dashboard Service ====================
  // Location analytics — admin only
  {
    path: "/dashboard/location",

    auth: true,
    roles: ["admin"],
    methods: ["GET"],
  },
  // Get dashboard stats — all authenticated users
  {
    path: "/dashboard/stats",

    auth: true,
    roles: ["admin", "teacher", "student"],
    methods: ["GET"],
  },
  // Student analytics — student only
  {
    path: "/dashboard/student",

    auth: true,
    roles: ["student"],
    methods: ["GET"],
  },
  // Admin analytics — admin only
  {
    path: "/dashboard/analytics",

    auth: true,
    roles: ["admin"],
    methods: ["GET"],
  },
  // Student full details — admin and teacher
  {
    path: "/dashboard/admin/student",

    auth: true,
    roles: ["admin", "teacher"],
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
