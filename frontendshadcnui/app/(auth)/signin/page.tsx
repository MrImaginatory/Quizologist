"use client";

import { AuthPage } from "@/components/auth/auth-page";
import { RouteGuard } from "@/components/auth/route-guard";

export default function SignInPage() {
  return (
    <RouteGuard requireAuth={false}>
      <AuthPage />
    </RouteGuard>
  );
}
