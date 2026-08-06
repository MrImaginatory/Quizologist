"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { PerformanceTrend } from "@/lib/api";

const chartConfig = {
  score: {
    label: "Score",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface PerformanceTrendChartProps {
  data: PerformanceTrend[];
}

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No test data available for this period
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: item.score,
    correct: item.correct,
    total: item.totalQuestions,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 12, right: 12 }}
      >
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="dot"
              formatter={(value) => `${value}%`}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="var(--color-score)"
          fill="var(--color-score)"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
