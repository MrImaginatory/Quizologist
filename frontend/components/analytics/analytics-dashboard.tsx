"use client";

import { useState, useCallback } from "react";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";
import { AnalyticsFilters } from "./analytics-filters";
import { TeacherStudentRatioChart } from "./teacher-student-ratio-chart";
import { TeacherStudentRatioCards } from "./teacher-student-ratio-cards";
import { TopStudentsTable } from "./top-students-table";
import { LeastQuestionsChart } from "./least-questions-chart";
import { SubjectsAttentionTable } from "./subjects-attention-table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function AnalyticsDashboard() {
  const [filters, setFilters] = useState({
    location_id: "",
    date_from: "",
    date_to: "",
    subject_id: "",
    course_id: "",
    limit: 10,
  });

  const { ratioData, topStudents, leastQuestions, subjectsAttention, isLoading, error } = useAdminAnalytics(filters);

  const handleFilterChange = useCallback((key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      location_id: "",
      date_from: "",
      date_to: "",
      subject_id: "",
      course_id: "",
      limit: 10,
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Filters */}
      <AnalyticsFilters
        locationId={filters.location_id}
        dateFrom={filters.date_from}
        dateTo={filters.date_to}
        subjectId={filters.subject_id}
        topN={filters.limit}
        onLocationChange={(v) => handleFilterChange("location_id", v)}
        onDateFromChange={(v) => handleFilterChange("date_from", v)}
        onDateToChange={(v) => handleFilterChange("date_to", v)}
        onSubjectChange={(v) => handleFilterChange("subject_id", v)}
        onTopNChange={(v) => handleFilterChange("limit", v)}
        onClear={handleClearFilters}
      />

      {/* Module 1: Teacher-Student Ratio */}
      <div className="space-y-4">
        <TeacherStudentRatioCards data={ratioData} isLoading={isLoading} />
        <TeacherStudentRatioChart data={ratioData} isLoading={isLoading} />
      </div>

      {/* Module 2: Top Students */}
      <TopStudentsTable data={topStudents} isLoading={isLoading} />

      {/* Module 3: Least Questions */}
      <LeastQuestionsChart data={leastQuestions} isLoading={isLoading} />

      {/* Module 4: Subjects Attention */}
      <SubjectsAttentionTable data={subjectsAttention} isLoading={isLoading} />
    </div>
  );
}
