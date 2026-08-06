"use client";

import { useState } from "react";
import { Bar, BarChart, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, List, BarChart3 } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { TeacherStudentRatioResponse } from "@/lib/api";
import { capitalize } from "@/lib/utils";

const chartConfig = {
  teacher_count: {
    label: "Teachers",
    color: "#818cf8",
  },
  student_count: {
    label: "Students",
    color: "#4F46E5",
  },
} satisfies ChartConfig;

interface TeacherStudentRatioChartProps {
  data: TeacherStudentRatioResponse["data"] | null;
  isLoading: boolean;
}

export function TeacherStudentRatioChart({ data, isLoading }: TeacherStudentRatioChartProps) {
  const [view, setView] = useState<"list" | "chart">("chart");

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
          <div className="h-[200px] flex items-center justify-center">
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
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Aggregate by city, sort by student count, take top 10
  const cityMap = new Map<string, { city: string; state: string; teacher_count: number; student_count: number }>();
  for (const loc of data.locations) {
    const key = `${loc.city}|${loc.state}`;
    if (cityMap.has(key)) {
      const existing = cityMap.get(key)!;
      existing.teacher_count += loc.teacher_count;
      existing.student_count += loc.student_count;
    } else {
      cityMap.set(key, { city: loc.city, state: loc.state, teacher_count: loc.teacher_count, student_count: loc.student_count });
    }
  }

  const topLocations = Array.from(cityMap.values())
    .sort((a, b) => b.student_count - a.student_count)
    .slice(0, 10);

  const chartData = topLocations.map((loc) => ({
    city: loc.city,
    teacher_count: loc.teacher_count,
    student_count: loc.student_count,
    ratio: loc.teacher_count > 0 ? `1:${Math.round(loc.student_count / loc.teacher_count)}` : "N/A",
  }));

  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teacher-to-Student Ratio by Location
          </CardTitle>
          <CardDescription>Top 10 locations by student count</CardDescription>
        </div>
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
          <button
            onClick={() => setView("chart")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "chart" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Chart
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {view === "chart" ? (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <XAxis
                dataKey="city"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickFormatter={(value) => {
                  return value.length > 10 ? value.slice(0, 10) + "…" : value;
                }}
              />
              <Bar
                dataKey="teacher_count"
                stackId="a"
                fill="var(--color-teacher_count)"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="student_count"
                stackId="a"
                fill="var(--color-student_count)"
                radius={[4, 4, 0, 0]}
              />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-primary/10 bg-background/95 backdrop-blur-md p-3 shadow-xl space-y-1">
                          <p className="font-semibold">{payload[0].payload.city}</p>
                          {payload.map((entry: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-sm text-muted-foreground">
                                {entry.name === "teacher_count" ? "Teachers" : "Students"}:
                              </span>
                              <span className="text-sm font-medium">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="grid gap-2">
            {topLocations.map((loc, index) => {
              const ratio = loc.teacher_count > 0
                ? `1:${Math.round(loc.student_count / loc.teacher_count)}`
                : "N/A";

              return (
                <div
                  key={`${loc.city}-${loc.state}`}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{capitalize(loc.city)}</p>
                      <p className="text-xs text-muted-foreground">{loc.state}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium">{loc.teacher_count}</span>
                      <span className="text-xs text-muted-foreground">teachers</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-500" />
                      <span className="text-sm font-medium">{loc.student_count}</span>
                      <span className="text-xs text-muted-foreground">students</span>
                    </div>

                    <div className="px-2 py-0.5 rounded-md bg-muted text-xs font-semibold">
                      {ratio}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
