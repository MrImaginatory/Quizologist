import { env } from "./env";

export interface RouteConfig {
  path: string;
  target: string;
  auth: boolean;
  roles?: string[];
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
  {
    path: "/question",
    target: `${env.QUESTION_SERVICE_URL}/api/question`,
    auth: true,
    roles: ["admin", "teacher", "student"],
  },
];

export function findMatchingRoute(
  reqPath: string
): { route: RouteConfig; remainingPath: string } | null {
  const normalised = reqPath.endsWith("/") ? reqPath.slice(0, -1) : reqPath;

  for (const route of routes) {
    const routePath = route.path.endsWith("/")
      ? route.path.slice(0, -1)
      : route.path;

    if (normalised === routePath || normalised.startsWith(routePath + "/")) {
      return { route, remainingPath: normalised.slice(routePath.length) };
    }
  }
  return null;
}
