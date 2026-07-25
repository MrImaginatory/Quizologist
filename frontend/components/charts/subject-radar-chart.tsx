"use client";

import { useState } from "react";
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
  weak: {
    label: "Weak (< 50%)",
    color: "#ef4444",
  },
  moderate: {
    label: "Moderate (50-80%)",
    color: "#f97316",
  },
  strong: {
    label: "Strong (> 80%)",
    color: "#22c55e",
  },
} satisfies ChartConfig;

interface SubjectRadarChartProps {
  data: SubjectPerformance[];
}

export function SubjectRadarChart({ data }: SubjectRadarChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<"weak" | "moderate" | "strong" | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No subject data available
      </div>
    );
  }

  // Split data into three categories
  const weakSubjects = data.filter((s) => s.accuracy < 50);
  const moderateSubjects = data.filter((s) => s.accuracy >= 50 && s.accuracy < 80);
  const strongSubjects = data.filter((s) => s.accuracy >= 80);

  // Create chart data with all subjects, filling missing values with 0 for each layer
  const chartData = data.map((item) => ({
    subject: item.subjectName,
    weak: item.accuracy < 50 ? item.accuracy : 0,
    moderate: item.accuracy >= 50 && item.accuracy < 80 ? item.accuracy : 0,
    strong: item.accuracy >= 80 ? item.accuracy : 0,
    accuracy: item.accuracy,
  }));

  const handleLegendClick = (category: "weak" | "moderate" | "strong") => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const getFilteredSubjects = () => {
    if (!selectedCategory) return [];
    switch (selectedCategory) {
      case "weak": return weakSubjects;
      case "moderate": return moderateSubjects;
      case "strong": return strongSubjects;
    }
  };

  const filteredSubjects = getFilteredSubjects();

  return (
    <div className="w-full min-h-[300px]">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          {/* Strong layer (green) */}
          <Radar
            dataKey="strong"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={selectedCategory === "strong" ? 0.4 : 0.15}
            strokeWidth={selectedCategory === "strong" ? 2.5 : 1.5}
          />
          {/* Moderate layer (orange) */}
          <Radar
            dataKey="moderate"
            stroke="#f97316"
            fill="#f97316"
            fillOpacity={selectedCategory === "moderate" ? 0.4 : 0.15}
            strokeWidth={selectedCategory === "moderate" ? 2.5 : 1.5}
          />
          {/* Weak layer (red) */}
          <Radar
            dataKey="weak"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={selectedCategory === "weak" ? 0.4 : 0.15}
            strokeWidth={selectedCategory === "weak" ? 2.5 : 1.5}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  if (value === 0) return null;
                  const label = name === "weak" ? "Weak" : name === "moderate" ? "Moderate" : "Strong";
                  return [`${value}%`, label];
                }}
              />
            }
          />
        </RadarChart>
      </ChartContainer>

      {/* Legend - clickable */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button
          onClick={() => handleLegendClick("weak")}
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
            selectedCategory === "weak"
              ? "bg-red-500/20 text-red-400"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          Weak ({weakSubjects.length})
        </button>
        <button
          onClick={() => handleLegendClick("moderate")}
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
            selectedCategory === "moderate"
              ? "bg-orange-500/20 text-orange-400"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          Moderate ({moderateSubjects.length})
        </button>
        <button
          onClick={() => handleLegendClick("strong")}
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
            selectedCategory === "strong"
              ? "bg-green-500/20 text-green-400"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          Strong ({strongSubjects.length})
        </button>
      </div>

      {/* Filtered subjects list */}
      {filteredSubjects.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-muted/50 border">
          <p className="text-xs font-medium mb-2 text-muted-foreground">
            {selectedCategory === "weak" && "Subjects needing improvement:"}
            {selectedCategory === "moderate" && "Subjects with moderate performance:"}
            {selectedCategory === "strong" && "Strong subjects:"}
          </p>
          <div className="space-y-1.5">
            {filteredSubjects.map((subject) => (
              <div key={subject.subjectId} className="flex items-center justify-between text-sm">
                <span>{subject.subjectName}</span>
                <span className={`font-medium ${
                  subject.accuracy < 50 ? "text-red-400" :
                  subject.accuracy < 80 ? "text-orange-400" :
                  "text-green-400"
                }`}>
                  {subject.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
