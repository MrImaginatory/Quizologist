"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { BookOpen, AlertTriangle } from "lucide-react";
import { capitalize } from "@/lib/utils";
import type { LeastQuestionsResponse } from "@/lib/api";

const chartConfig = {
  questionCount: {
    label: "Questions",
    color: "#4F46E5",
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
    name: t.topicName.length > 20 ? capitalize(t.topicName.substring(0, 20)) + "..." : capitalize(t.topicName),
    questionCount: t.questionCount,
    fullName: capitalize(t.topicName),
    subject: capitalize(t.subjectName),
    course: capitalize(t.courseName),
  }));

  return (
    <Card className="overflow-hidden rounded-2xl">
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
            <CartesianGrid stroke="var(--border)" horizontal={false} strokeDasharray="3 3" opacity={0.3} />
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
                    <div className="rounded-xl border border-primary/10 bg-background/95 backdrop-blur-md p-3 shadow-xl">
                      <p className="font-semibold text-primary">{data.fullName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{data.subject} • {data.course}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <p className="text-sm font-medium">{data.questionCount} questions</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ fill: "var(--muted)", opacity: 0.2 }}
            />
            <Bar dataKey="questionCount" fill="var(--color-questionCount)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
