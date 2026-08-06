"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const topStudentsConfig: ChartConfig = {
  avgScore: {
    label: "Avg Score",
    color: "var(--chart-1)",
  },
};

const weakTopicsConfig: ChartConfig = {
  avgAccuracy: {
    label: "Accuracy %",
    color: "var(--chart-4)",
  },
};

const coverageConfig: ChartConfig = {
  count: {
    label: "Questions",
    color: "var(--chart-2)",
  },
};

interface TeacherChartsProps {
  topStudentsChartData: { name: string; avgScore: number }[];
  weakTopicsChartData: { name: string; avgAccuracy: number }[];
  coverageChartData: { name: string; count: number }[];
  activeChart: "topStudents" | "weakTopics" | "coverage";
}

export default function TeacherCharts({
  topStudentsChartData,
  weakTopicsChartData,
  coverageChartData,
  activeChart,
}: TeacherChartsProps) {
  if (activeChart === "topStudents") {
    return (
      <ChartContainer config={topStudentsConfig} className="h-[250px] w-full">
        <BarChart data={topStudentsChartData} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickFormatter={(value) => value.split(" ")[0]}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={5}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="avgScore" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    );
  }

  if (activeChart === "weakTopics") {
    return (
      <ChartContainer config={weakTopicsConfig} className="h-[250px] w-full">
        <RadarChart data={weakTopicsChartData}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          />
          <Radar
            name="Accuracy"
            dataKey="avgAccuracy"
            stroke="var(--chart-4)"
            fill="var(--chart-4)"
            fillOpacity={0.3}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={coverageConfig} className="h-[300px] w-full">
      <BarChart data={coverageChartData} accessibilityLayer>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + "..." : value}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={5}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
