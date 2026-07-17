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
import { usePredefinedTests } from "@/hooks/use-predefined-tests";
import { predefinedTestsApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Play, Pause, Loader2 } from "lucide-react";
import { TestFilters } from "@/components/filters/test-filters";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";

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
  const { user, token } = useAuth();
  const isTeacher = user?.role === "teacher";

  const [activeTab, setActiveTab] = useState<"student" | "predefined">("student");
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

  const { tests: predefinedTests, total: predefinedTotal, totalPages: predefinedTotalPages, isLoading: predefinedLoading, error: predefinedError } = usePredefinedTests({
    page,
    limit,
  });

  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

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

  const handleActivatePredefined = async (id: string) => {
    setActivatingId(id);
    try {
      await predefinedTestsApi.activate(id, token || undefined);
      toast.success("Test activated!");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to activate");
    } finally {
      setActivatingId(null);
    }
  };

  const handleDeactivatePredefined = async (id: string) => {
    setDeactivatingId(id);
    try {
      await predefinedTestsApi.deactivate(id, token || undefined);
      toast.success("Test deactivated!");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate");
    } finally {
      setDeactivatingId(null);
    }
  };

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
            Manage student tests and predefined tests
          </p>
        </div>
        {activeTab === "predefined" && (isTeacher || user?.role === "admin") && (
          <Button onClick={() => router.push("/dashboard/tests/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Test
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => { setActiveTab("student"); setPage(1); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "student"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Student Tests
        </button>
        <button
          onClick={() => { setActiveTab("predefined"); setPage(1); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "predefined"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          My Tests
        </button>
      </div>

      {activeTab === "student" ? (
        <>
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
        </>
      ) : (
        <div className="space-y-4">
          {/* Predefined Tests Table */}
          <div className="border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">#</th>
                  <th className="text-left p-3 font-medium">Title</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Duration</th>
                  <th className="text-left p-3 font-medium">Questions</th>
                  <th className="text-left p-3 font-medium">Created</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {predefinedLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : predefinedTests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No predefined tests found
                    </td>
                  </tr>
                ) : (
                  predefinedTests.map((test, index) => (
                    <tr
                      key={test.id}
                      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/tests/${test.id}`)}
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{test.title}</p>
                          {test.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {test.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={
                            test.status === "active"
                              ? "bg-green-500/10 text-green-500"
                              : test.status === "draft"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-gray-500/10 text-gray-500"
                          }
                        >
                          {capitalize(test.status)}
                        </Badge>
                      </td>
                      <td className="p-3">{test.duration_minutes} min</td>
                      <td className="p-3">{test.question_limit}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(test.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          {test.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivatePredefined(test.id)}
                              disabled={activatingId === test.id}
                            >
                              {activatingId === test.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {test.status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivatePredefined(test.id)}
                              disabled={deactivatingId === test.id}
                            >
                              {deactivatingId === test.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Pause className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
