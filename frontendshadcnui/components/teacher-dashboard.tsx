"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatisticsCard } from "@/components/statistics-card";
import { dashboardApi, DashboardStatsResponse } from "@/lib/api";
import { Loader2 } from "lucide-react";

export function TeacherDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStatsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApi.getStats(token || undefined);
        setStats(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const teacherStats = [
    {
      title: "Questions Added",
      value: stats?.questionsAdded?.toString() || "0",
      icon: "solar:question-circle-line-duotone",
      badgeColor: "bg-teal-400/10",
      change: "Created",
      changeIcon: "solar:add-circle-line-duotone",
      period: "By You",
    },
    {
      title: "Students in Courses",
      value: stats?.studentsInCourses?.toString() || "0",
      icon: "solar:users-group-two-rounded-line-duotone",
      badgeColor: "bg-blue-400/10",
      change: "Enrolled",
      changeIcon: "solar:check-circle-line-duotone",
      period: "Your Courses",
    },
    {
      title: "Tests Submitted",
      value: stats?.testsSubmitted?.toString() || "0",
      icon: "solar:clipboard-check-line-duotone",
      badgeColor: "bg-purple-400/10",
      change: "Completed",
      changeIcon: "solar:chart-square-line-duotone",
      period: "By Students",
    },
    {
      title: "Questions in Courses",
      value: stats?.questionsInCourses?.toString() || "0",
      icon: "solar:book-open-line-duotone",
      badgeColor: "bg-orange-400/10",
      change: "Available",
      changeIcon: "solar:library-line-duotone",
      period: "Your Courses",
    },
  ];

  return (
    <div className="space-y-6">
      <StatisticsCard stats={teacherStats} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity to display.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Student Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No performance data available.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}