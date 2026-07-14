"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatisticsCard } from "@/components/statistics-card";
import { dashboardApi, DashboardStatsResponse } from "@/lib/api";
import { capitalize } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, token } = useAuth();
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

  const getStatsForRole = () => {
    if (!stats) return [];

    if (stats.role === "admin") {
      return [
        {
          title: "Total Users",
          value: stats.studentsCount?.toString() || "0",
          icon: "solar:users-group-two-rounded-line-duotone",
          badgeColor: "bg-teal-400/10",
          change: "Active",
          changeIcon: "solar:check-circle-line-duotone",
          period: "Students",
        },
        {
          title: "Total Teachers",
          value: stats.totalTeachers?.toString() || "0",
          icon: "solar:teaching-line-duotone",
          badgeColor: "bg-blue-400/10",
          change: "Active",
          changeIcon: "solar:check-circle-line-duotone",
          period: "Faculty",
        },
        {
          title: "Total Questions",
          value: stats.totalQuestions?.toString() || "0",
          icon: "solar:question-circle-line-duotone",
          badgeColor: "bg-purple-400/10",
          change: "In Bank",
          changeIcon: "solar:library-line-duotone",
          period: "Question Bank",
        },
        {
          title: "Total Topics",
          value: stats.totalTopics?.toString() || "0",
          icon: "solar:bookmark-square-line-duotone",
          badgeColor: "bg-orange-400/10",
          change: "Total",
          changeIcon: "solar:check-circle-line-duotone",
          period: "All Topics",
        },
        {
          title: "Total Subjects",
          value: stats.totalSubjects?.toString() || "0",
          icon: "solar:book-open-line-duotone",
          badgeColor: "bg-teal-400/10",
          change: "Available",
          changeIcon: "solar:library-line-duotone",
          period: "Across Courses",
        },
        {
          title: "Tests Submitted",
          value: stats.testsSubmitted?.toString() || "0",
          icon: "solar:clipboard-check-line-duotone",
          badgeColor: "bg-blue-400/10",
          change: "Total",
          changeIcon: "solar:chart-square-line-duotone",
          period: "All Time",
        },
      ];
    }

    if (stats.role === "teacher") {
      return [
        {
          title: "Questions Added",
          value: stats.questionsAdded?.toString() || "0",
          icon: "solar:question-circle-line-duotone",
          badgeColor: "bg-teal-400/10",
          change: "Created",
          changeIcon: "solar:add-circle-line-duotone",
          period: "By You",
        },
        {
          title: "Students in Courses",
          value: stats.studentsInCourses?.toString() || "0",
          icon: "solar:users-group-two-rounded-line-duotone",
          badgeColor: "bg-blue-400/10",
          change: "Enrolled",
          changeIcon: "solar:check-circle-line-duotone",
          period: "Your Courses",
        },
        {
          title: "Tests Submitted",
          value: stats.testsSubmitted?.toString() || "0",
          icon: "solar:clipboard-check-line-duotone",
          badgeColor: "bg-purple-400/10",
          change: "Completed",
          changeIcon: "solar:chart-square-line-duotone",
          period: "By Students",
        },
        {
          title: "Questions in Courses",
          value: stats.questionsInCourses?.toString() || "0",
          icon: "solar:book-open-line-duotone",
          badgeColor: "bg-orange-400/10",
          change: "Available",
          changeIcon: "solar:library-line-duotone",
          period: "Your Courses",
        },
      ];
    }

    // Student stats
    return [
      {
        title: "Available Questions",
        value: stats.questionsInEnrolledCourses?.toString() || "0",
        icon: "solar:question-circle-line-duotone",
        badgeColor: "bg-teal-400/10",
        change: "In Library",
        changeIcon: "solar:book-open-line-duotone",
          period: "Enrolled Courses",
      },
      {
        title: "Tests Submitted",
        value: stats.testsSubmitted?.toString() || "0",
        icon: "solar:clipboard-check-line-duotone",
        badgeColor: "bg-blue-400/10",
        change: "Completed",
        changeIcon: "solar:check-circle-line-duotone",
        period: "All Time",
      },
      {
        title: "Pending Tests",
        value: "3",
        icon: "solar:square-hourglass-line-duotone",
        badgeColor: "bg-orange-400/10",
        change: "Due Soon",
        changeIcon: "solar:alarm-line-duotone",
        period: "This Week",
      },
      {
        title: "Average Score",
        value: "78%",
        icon: "solar:chart-square-line-duotone",
        badgeColor: "bg-purple-400/10",
        change: "+5%",
        changeIcon: "solar:course-up-line-duotone",
        period: "Improvement",
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.fname}!</h1>
          <p className="text-muted-foreground">Dashboard overview</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {capitalize(user?.fname || "")}!</h1>
        <p className="text-muted-foreground">Here&apos;s your dashboard overview</p>
      </div>

      <StatisticsCard stats={getStatsForRole()} />

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
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
