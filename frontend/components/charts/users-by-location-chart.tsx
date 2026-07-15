"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  user_count: {
    label: "Users",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface LocationData {
  id: string;
  city: string;
  state: string;
  user_count: number;
}

interface UsersByLocationChartProps {
  data: LocationData[];
}

export function UsersByLocationChart({ data }: UsersByLocationChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No location data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    location: `${item.city}, ${item.state}`,
    user_count: item.user_count,
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
          dataKey="location"
          type="category"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          width={140}
        />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="dot"
              labelKey="location"
            />
          }
        />
        <Bar
          dataKey="user_count"
          fill="var(--color-user_count)"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
