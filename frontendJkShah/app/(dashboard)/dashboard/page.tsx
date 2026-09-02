"use client";

import { useAuth } from "@/contexts/auth-context";
import { capitalize } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { StudentDashboard } from "@/components/student-dashboard";
import { AdminDashboard } from "@/components/admin-dashboard";
import { TeacherDashboard } from "@/components/teacher-dashboard";
import { PreAssessmentBanner } from "@/components/pre-assessment-banner";

export default function DashboardPage() {
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border shadow-sm p-6 sm:p-10"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold text-sm tracking-wide uppercase">{greeting}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Welcome back, {capitalize(user?.fname || "")}!
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-base">
              Here&apos;s an overview of your activity and performance.
            </p>
          </div>
        </div>
        {/* Decorative background blur */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {user?.role === "student" && <PreAssessmentBanner />}
      {user?.role === "student" && <StudentDashboard />}
      {user?.role === "admin" && <AdminDashboard />}
      {user?.role === "teacher" && <TeacherDashboard />}
    </div>
  );
}