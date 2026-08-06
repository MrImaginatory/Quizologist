"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { NotFound } from "@/components/not-found";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export function RouteGuard({
  children,
  requireAuth = true,
  allowedRoles,
}: RouteGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ["/signin", "/signup"];
  const isPublicRoute = useMemo(() => publicRoutes.includes(pathname), [pathname]);

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated && !isPublicRoute) {
      router.push("/signin");
    }

    if (isPublicRoute && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, pathname, router, requireAuth, isPublicRoute]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (isPublicRoute && isAuthenticated) {
    return null;
  }

  // Role check: show 404 if user's role is not allowed
  if (allowedRoles && !allowedRoles.includes(user?.role!)) {
    return <NotFound />;
  }

  return <>{children}</>;
}
