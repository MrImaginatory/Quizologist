"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { SubjectPerformance } from "@/lib/api";

const chartConfig = {
  accuracy: {
    label: "Accuracy",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface SubjectRadarChartProps {
  data: SubjectPerformance[];
}

export function SubjectRadarChart({ data }: SubjectRadarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No subject data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    subject: item.subjectName,
    accuracy: item.accuracy,
  }));

  return (
    <div className="w-full min-h-[300px]">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <Radar
            dataKey="accuracy"
            stroke="var(--chart-1)"
            fill="var(--chart-1)"
            fillOpacity={0.3}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => `${value}%`}
              />
            }
          />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}
