"use client";

import { usePathname } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

// Role-based route access configuration
// Key: URL path prefix, Value: allowed roles
// More specific paths MUST come before general ones (e.g. /tests/pending before /tests)
const ROLE_ROUTES: [string, string[]][] = [
  // Student only (specific paths first)
  ["/dashboard/tests/pending", ["student"]],
  ["/dashboard/enrollments", ["student"]],
  ["/dashboard/my-tests", ["student"]],

  // Admin + Teacher
  ["/dashboard/questions", ["admin", "teacher"]],
  ["/dashboard/tests", ["admin", "teacher"]],
  ["/dashboard/teacher-enrollments", ["admin", "teacher"]],

  // Admin only
  ["/dashboard/courses", ["admin"]],
  ["/dashboard/subjects", ["admin"]],
  ["/dashboard/topics", ["admin"]],
  ["/dashboard/users", ["admin"]],
  ["/dashboard/students", ["admin", "teacher"]],
  ["/dashboard/analytics", ["admin"]],
  ["/dashboard/locations", ["admin"]],
];

function getAllowedRoles(pathname: string): string[] | undefined {
  // First: exact match (highest priority)
  for (const [path, roles] of ROLE_ROUTES) {
    if (pathname === path) return roles;
  }
  // Second: longest prefix match (most specific wins)
  let bestMatch: string[] | undefined;
  let bestLen = 0;
  for (const [path, roles] of ROLE_ROUTES) {
    if (pathname.startsWith(path + "/") && path.length > bestLen) {
      bestMatch = roles;
      bestLen = path.length;
    }
  }
  if (bestMatch) return bestMatch;
  // Default: all authenticated users (dashboard home, profile, etc.)
  return undefined;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const allowedRoles = getAllowedRoles(pathname);

  return (
    <RouteGuard requireAuth={true} allowedRoles={allowedRoles}>
      <DashboardShell>{children}</DashboardShell>
    </RouteGuard>
  );
}
