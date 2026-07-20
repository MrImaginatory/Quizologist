"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Users } from "lucide-react";
import type { TeacherStudentRatioResponse } from "@/lib/api";

const chartConfig = {
  teacher_count: {
    label: "Teachers",
    color: "var(--chart-1)",
  },
  student_count: {
    label: "Students",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface TeacherStudentRatioChartProps {
  data: TeacherStudentRatioResponse["data"] | null;
  isLoading: boolean;
}

export function TeacherStudentRatioChart({ data, isLoading }: TeacherStudentRatioChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teacher-to-Student Ratio by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.locations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teacher-to-Student Ratio by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.locations.map((loc) => ({
    name: loc.city,
    teacher_count: loc.teacher_count,
    student_count: loc.student_count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Teacher-to-Student Ratio by Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              width={80}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Legend />
            <Bar dataKey="teacher_count" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="student_count" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
