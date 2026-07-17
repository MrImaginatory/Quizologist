"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { useAllTests } from "@/hooks/use-all-tests";
import { useTeachingTests } from "@/hooks/use-teaching-tests";
import { useTeachingStudents } from "@/hooks/use-teaching-students";
import { useUsers } from "@/hooks/use-users";
import { useCourses } from "@/hooks/use-courses";
import { useSubjects } from "@/hooks/use-subjects";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Settings } from "lucide-react";
import { TestFilters } from "@/components/filters/test-filters";
import { capitalize } from "@/lib/utils";

interface TestRow {
  id: string;
  test_id: string;
  status: string;
  score: number;
  correct: number;
  total_questions: number;
  started_at: string;
  student?: {
    id: string;
    fname: string;
    lname: string;
    email: string;
  };
}

const statusColors: Record<string, string> = {
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  abandoned: "bg-red-500/10 text-red-500 border-red-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

export default function TestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const { users: adminStudents, isLoading: adminStudentsLoading } = useUsers({ role: "student", limit: 100 });
  const { students: teachingStudents, isLoading: teachingStudentsLoading } = useTeachingStudents({ limit: 100 });
  const { courses, isLoading: coursesLoading } = useCourses({ limit: 100 });
  const { subjects, isLoading: subjectsLoading } = useSubjects({ limit: 100 });

  const students = isTeacher ? teachingStudents : adminStudents;
  const studentsLoading = isTeacher ? teachingStudentsLoading : adminStudentsLoading;

  const hasStudentSelected = studentId && studentId !== "all";

  const { tests: allTests, total: allTotal, totalPages: allTotalPages, isLoading: allLoading, error: allError, refetch: allRefetch } = useAllTests({
    page,
    limit,
    status: status === "all" ? "" : status,
    studentId: hasStudentSelected ? studentId : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { tests: teachingTests, total: teachingTotal, totalPages: teachingTotalPages, isLoading: teachingLoading, error: teachingError, refetch: teachingRefetch } = useTeachingTests({
    page,
    limit,
    status: status === "all" ? "" : status,
    course_id: courseId || undefined,
    subject_id: subjectId || undefined,
    student_id: hasStudentSelected ? studentId : undefined,
  });

  const normalizedTests: TestRow[] = isTeacher
    ? teachingTests.map((t) => ({
        id: t.id,
        test_id: t.test_id,
        status: t.status,
        score: t.score,
        correct: t.correct,
        total_questions: t.total_questions,
        started_at: t.started_at,
        student: t.student,
      }))
    : allTests.map((t) => ({
        id: t.id,
        test_id: t.test_id,
        status: t.status,
        score: parseFloat(String(t.score)) || 0,
        correct: t.correct,
        total_questions: t.total_questions,
        started_at: t.started_at,
      }));

  const total = isTeacher ? teachingTotal : allTotal;
  const totalPages = isTeacher ? teachingTotalPages : allTotalPages;
  const isLoading = isTeacher ? teachingLoading : allLoading;
  const error = isTeacher ? teachingError : allError;
  const refetch = isTeacher ? teachingRefetch : allRefetch;

  const handleClearFilters = useCallback(() => {
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setStudentId("");
    setCourseId("");
    setSubjectId("");
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleDateFromChange = useCallback((value: string) => {
    setDateFrom(value);
    setPage(1);
  }, []);

  const handleDateToChange = useCallback((value: string) => {
    setDateTo(value);
    setPage(1);
  }, []);

  const handleStudentChange = useCallback((value: string) => {
    setStudentId(value);
    setPage(1);
  }, []);

  const handleCourseChange = useCallback((value: string) => {
    setCourseId(value);
    setSubjectId("");
    setPage(1);
  }, []);

  const handleSubjectChange = useCallback((value: string) => {
    setSubjectId(value);
    setPage(1);
  }, []);

  const columns = [
    { key: "sno", header: "#", render: (_t: TestRow, index: number) => index + 1 },
    {
      key: "test_id",
      header: "Test ID",
      render: (t: TestRow) => (
        <span className="font-mono text-sm">{t.test_id}</span>
      ),
    },
    ...(isTeacher
      ? [
          {
            key: "student",
            header: "Student",
            render: (t: TestRow) => (
              <div>
                <p className="font-medium">{capitalize(t.student?.fname || "")} {capitalize(t.student?.lname || "")}</p>
                <p className="text-xs text-muted-foreground">{t.student?.email}</p>
              </div>
            ),
          },
        ]
      : []),
    {
      key: "status",
      header: "Status",
      render: (t: TestRow) => (
        <Badge variant="outline" className={statusColors[t.status] || ""}>
          {t.status === "completed"
            ? "Completed"
            : t.status === "in_progress"
              ? "In Progress"
              : t.status === "abandoned"
                ? "Abandoned"
                : t.status === "pending"
                  ? "Pending"
                  : t.status}
        </Badge>
      ),
    },
    {
      key: "score",
      header: "Score",
      render: (t: TestRow) => {
        const score = Number(t.score) || 0;
        return (
          <span
            className={`font-medium ${
              score >= 70
                ? "text-green-500"
                : score >= 50
                  ? "text-yellow-500"
                  : "text-red-500"
            }`}
          >
            {score > 0 ? score.toFixed(1) : "-"}%
          </span>
        );
      },
    },
    {
      key: "correct",
      header: "Correct",
      render: (t: TestRow) => (
        <span>
          {t.correct || 0} / {t.total_questions}
        </span>
      ),
    },
    {
      key: "started_at",
      header: "Date",
      render: (t: TestRow) => {
        if (!t.started_at) return <span>-</span>;
        const date = new Date(t.started_at);
        if (isNaN(date.getTime())) return <span>-</span>;
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    ...(hasStudentSelected
      ? [
          {
            key: "actions",
            header: "Actions",
            render: (t: TestRow) => {
              if (t.status === "completed") {
                return (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/test-result?id=${t.id}&studentId=${studentId}`)}
                    className="gap-1"
                  >
                    <BookOpen className="h-4 w-4" />
                    View
                  </Button>
                );
              }
              return null;
            },
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tests</h1>
          <p className="text-muted-foreground">
            View test results for students
          </p>
        </div>
        {(isTeacher || user?.role === "admin") && (
          <Button variant="outline" onClick={() => router.push("/dashboard/tests/manage")}>
            <Settings className="mr-2 h-4 w-4" />
            Manage Tests
          </Button>
        )}
      </div>

      <TestFilters
        status={status}
        dateFrom={dateFrom}
        dateTo={dateTo}
        studentId={studentId}
        courseId={courseId}
        subjectId={subjectId}
        students={students}
        courses={courses}
        subjects={subjects}
        studentsLoading={studentsLoading}
        coursesLoading={coursesLoading}
        subjectsLoading={subjectsLoading}
        showStudentFilter={true}
        showCourseFilter={isTeacher}
        showSubjectFilter={isTeacher}
        onStatusChange={handleStatusChange}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onStudentChange={handleStudentChange}
        onCourseChange={handleCourseChange}
        onSubjectChange={handleSubjectChange}
        onClear={handleClearFilters}
      />

      <DataTable
        title={isTeacher ? "Teaching Tests" : "Tests"}
        columns={columns}
        data={normalizedTests}
        isLoading={isLoading}
        error={error}
        keyExtractor={(t) => t.id}
        pagination={{ page, totalPages, total, limit }}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
}
