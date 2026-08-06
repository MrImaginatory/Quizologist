"use client";

import { useState, useCallback } from "react";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";
import { AnalyticsFilters } from "./analytics-filters";
import dynamic from "next/dynamic";
import { TeacherStudentRatioCards } from "./teacher-student-ratio-cards";
import { TopStudentsTable } from "./top-students-table";
import { SubjectsAttentionTable } from "./subjects-attention-table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const TeacherStudentRatioChart = dynamic(
  () => import("./teacher-student-ratio-chart").then(m => ({ default: m.TeacherStudentRatioChart })),
  { ssr: false, loading: () => <div className="h-[300px] animate-pulse bg-muted rounded-lg" /> }
);
const LeastQuestionsChart = dynamic(
  () => import("./least-questions-chart").then(m => ({ default: m.LeastQuestionsChart })),
  { ssr: false, loading: () => <div className="h-[300px] animate-pulse bg-muted rounded-lg" /> }
);

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
      course_id: "",
      subject_id: "",
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Global Filters */}
      <motion.div variants={itemVariants}>
        <AnalyticsFilters
          locationId={filters.location_id}
          dateFrom={filters.date_from}
          dateTo={filters.date_to}
          courseId={filters.course_id}
          subjectId={filters.subject_id}
          topN={filters.limit}
          onLocationChange={(v) => handleFilterChange("location_id", v)}
          onDateFromChange={(v) => handleFilterChange("date_from", v)}
          onDateToChange={(v) => handleFilterChange("date_to", v)}
          onCourseChange={(v) => handleFilterChange("course_id", v)}
          onSubjectChange={(v) => handleFilterChange("subject_id", v)}
          onTopNChange={(v) => handleFilterChange("limit", v)}
          onClear={handleClearFilters}
        />
      </motion.div>

      {/* Module 1: Teacher-Student Ratio */}
      <motion.div variants={itemVariants} className="space-y-4">
        <TeacherStudentRatioCards data={ratioData} isLoading={isLoading} />
        <TeacherStudentRatioChart data={ratioData} isLoading={isLoading} />
      </motion.div>

      {/* Module 2: Top Students */}
      <motion.div variants={itemVariants}>
        <TopStudentsTable data={topStudents} isLoading={isLoading} />
      </motion.div>

      {/* Module 3: Least Questions */}
      <motion.div variants={itemVariants}>
        <LeastQuestionsChart data={leastQuestions} isLoading={isLoading} />
      </motion.div>

      {/* Module 4: Subjects Attention */}
      <motion.div variants={itemVariants}>
        <SubjectsAttentionTable data={subjectsAttention} isLoading={isLoading} />
      </motion.div>
    </motion.div>
  );
}
