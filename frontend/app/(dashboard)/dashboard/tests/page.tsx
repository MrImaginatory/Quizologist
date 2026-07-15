"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { useAllTests } from "@/hooks/use-all-tests";
import { useUsers } from "@/hooks/use-users";
import { TestHistory } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { TestFilters } from "@/components/filters/test-filters";

const statusColors: Record<string, string> = {
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  abandoned: "bg-red-500/10 text-red-500 border-red-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

export default function TestsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [studentId, setStudentId] = useState("");

  const { users: students, isLoading: studentsLoading } = useUsers({ role: "student", limit: 100 });

  const hasStudentSelected = studentId && studentId !== "all";

  const { tests, total, totalPages, isLoading, error, refetch } = useAllTests({
    page,
    limit,
    status: status === "all" ? "" : status,
    studentId: hasStudentSelected ? studentId : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const handleClearFilters = useCallback(() => {
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setStudentId("");
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

  const columns = [
    { key: "sno", header: "#", render: (_t: TestHistory, index: number) => index + 1 },
    {
      key: "test_id",
      header: "Test ID",
      render: (t: TestHistory) => (
        <span className="font-mono text-sm">{t.test_id}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (t: TestHistory) => (
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
      render: (t: TestHistory) => {
        const score = parseFloat(String(t.score)) || 0;
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
      render: (t: TestHistory) => (
        <span>
          {t.correct || 0} / {t.total_questions}
        </span>
      ),
    },
    {
      key: "started_at",
      header: "Date",
      render: (t: TestHistory) => {
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
            render: (t: TestHistory) => {
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
      <div>
        <h1 className="text-3xl font-bold">All Tests</h1>
        <p className="text-muted-foreground">View and manage all tests across the system</p>
      </div>

      <TestFilters
        status={status}
        dateFrom={dateFrom}
        dateTo={dateTo}
        studentId={studentId}
        students={students}
        studentsLoading={studentsLoading}
        onStatusChange={handleStatusChange}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onStudentChange={handleStudentChange}
        onClear={handleClearFilters}
      />

      <DataTable
        title="Tests"
        columns={columns}
        data={tests}
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
