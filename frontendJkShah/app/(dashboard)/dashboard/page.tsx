"use client";

import { useAuth } from "@/contexts/auth-context";
import { capitalize } from "@/lib/utils";
import { StudentDashboard } from "@/components/student-dashboard";
import { AdminDashboard } from "@/components/admin-dashboard";
import { TeacherDashboard } from "@/components/teacher-dashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {capitalize(user?.fname || "")}!</h1>
        <p className="text-muted-foreground">Here&apos;s your dashboard overview</p>
      </div>

      {user?.role === "student" && <StudentDashboard />}
      {user?.role === "admin" && <AdminDashboard />}
      {user?.role === "teacher" && <TeacherDashboard />}
    </div>
  );
}