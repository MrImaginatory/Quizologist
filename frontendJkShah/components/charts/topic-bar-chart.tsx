"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { TopicPerformance } from "@/lib/api";

const chartConfig = {
  accuracy: {
    label: "Accuracy",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface TopicBarChartProps {
  data: TopicPerformance[];
}

export function TopicBarChart({ data }: TopicBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No topic data available
      </div>
    );
  }

  const chartData = data
    .slice(0, 10)
    .sort((a, b) => b.accuracy - a.accuracy)
    .map((item) => ({
      topic: item.topicName.length > 20
        ? `${item.topicName.slice(0, 20)}...`
        : item.topicName,
      accuracy: item.accuracy,
    }));

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{ left: 20 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <YAxis
          dataKey="topic"
          type="category"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          width={120}
        />
        <XAxis
          type="number"
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
        <Bar
          dataKey="accuracy"
          fill="var(--color-accuracy)"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
