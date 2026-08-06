"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BarChart3 } from "lucide-react";
import type { TeacherStudentRatioResponse } from "@/lib/api";

interface TeacherStudentRatioCardsProps {
  data: TeacherStudentRatioResponse["data"] | null;
  isLoading: boolean;
}

export function TeacherStudentRatioCards({ data, isLoading }: TeacherStudentRatioCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const avgRatio = data.total_teachers > 0
    ? `1:${Math.round(data.total_students / data.total_teachers)}`
    : "N/A";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="overflow-hidden relative group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl border-primary/10 bg-gradient-to-br from-card to-muted/20">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Total Teachers</CardTitle>
          <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold">{data.total_teachers}</div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden relative group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl border-primary/10 bg-gradient-to-br from-card to-muted/20">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Total Students</CardTitle>
          <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
            <Users className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold">{data.total_students}</div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden relative group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl border-primary/10 bg-gradient-to-br from-card to-muted/20">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Average Ratio</CardTitle>
          <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold">{avgRatio}</div>
          <p className="text-xs text-muted-foreground mt-1">Teacher : Student</p>
        </CardContent>
      </Card>
    </div>
  );
}
