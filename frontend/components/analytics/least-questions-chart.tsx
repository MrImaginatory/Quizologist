"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { BookOpen, AlertTriangle } from "lucide-react";
import type { LeastQuestionsResponse } from "@/lib/api";

const chartConfig = {
  questionCount: {
    label: "Questions",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

interface LeastQuestionsChartProps {
  data: LeastQuestionsResponse["data"] | null;
  isLoading: boolean;
}

export function LeastQuestionsChart({ data, isLoading }: LeastQuestionsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Topics with Fewest Questions
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

  if (!data || data.topics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Topics with Fewest Questions
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

  const needsAttention = data.topics.filter(t => t.status === "needs_questions").length;

  const chartData = data.topics.map((t) => ({
    name: t.topicName.length > 20 ? t.topicName.substring(0, 20) + "..." : t.topicName,
    questionCount: t.questionCount,
    fullName: t.topicName,
    subject: t.subjectName,
    course: t.courseName,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Topics with Fewest Questions
          </CardTitle>
          {needsAttention > 0 && (
            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {needsAttention} need attention
            </Badge>
          )}
        </div>
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
              width={150}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <p className="font-medium">{data.fullName}</p>
                      <p className="text-xs text-muted-foreground">{data.subject} • {data.course}</p>
                      <p className="text-sm mt-1">{data.questionCount} questions</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="questionCount" fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
