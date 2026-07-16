"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatisticsCard } from "@/components/statistics-card";
import { dashboardApi, DashboardStatsResponse } from "@/lib/api";
import { Loader2, MapPin } from "lucide-react";
import { ViewToggle } from "@/components/dashboard/view-toggle";
import { UsersByLocationChart } from "@/components/charts/users-by-location-chart";
import { UsersByLocationTable } from "@/components/dashboard/users-by-location-table";

export function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStatsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationView, setLocationView] = useState<"table" | "chart">("table");

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

  const adminStats = [
    {
      title: "Total Users",
      value: stats?.studentsCount?.toString() || "0",
      icon: "solar:users-group-two-rounded-line-duotone",
      badgeColor: "bg-teal-400/10",
      change: "Active",
      changeIcon: "solar:check-circle-line-duotone",
      period: "Students",
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers?.toString() || "0",
      icon: "solar:teaching-line-duotone",
      badgeColor: "bg-blue-400/10",
      change: "Active",
      changeIcon: "solar:check-circle-line-duotone",
      period: "Faculty",
    },
    {
      title: "Total Questions",
      value: stats?.totalQuestions?.toString() || "0",
      icon: "solar:question-circle-line-duotone",
      badgeColor: "bg-purple-400/10",
      change: "In Bank",
      changeIcon: "solar:library-line-duotone",
      period: "Question Bank",
    },
    {
      title: "Total Topics",
      value: stats?.totalTopics?.toString() || "0",
      icon: "solar:bookmark-square-line-duotone",
      badgeColor: "bg-orange-400/10",
      change: "Total",
      changeIcon: "solar:check-circle-line-duotone",
      period: "All Topics",
    },
    {
      title: "Total Subjects",
      value: stats?.totalSubjects?.toString() || "0",
      icon: "solar:book-open-line-duotone",
      badgeColor: "bg-teal-400/10",
      change: "Available",
      changeIcon: "solar:library-line-duotone",
      period: "Across Courses",
    },
    {
      title: "Tests Submitted",
      value: stats?.testsSubmitted?.toString() || "0",
      icon: "solar:clipboard-check-line-duotone",
      badgeColor: "bg-blue-400/10",
      change: "Total",
      changeIcon: "solar:chart-square-line-duotone",
      period: "All Time",
    },
  ];

  const usersByLocation = stats?.usersByLocation || [];

  return (
    <div className="space-y-6">
      <StatisticsCard stats={adminStats} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Users by Location
            {usersByLocation.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({usersByLocation.reduce((sum, loc) => sum + loc.user_count, 0)} total users)
              </span>
            )}
          </CardTitle>
          <ViewToggle value={locationView} onChange={setLocationView} />
        </CardHeader>
        <CardContent>
          {locationView === "chart" ? (
            <UsersByLocationChart data={usersByLocation} />
          ) : (
            <UsersByLocationTable data={usersByLocation} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
