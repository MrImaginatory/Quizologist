"use client";

import { useState } from "react";
import { useTestHistory } from "@/hooks/use-test-history";
import { TestHistory } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ClipboardCheck, Trophy, Clock, CheckCircle } from "lucide-react";
import { DataTable } from "@/components/data-table";

const statusColors: Record<string, string> = {
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  abandoned: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function MyTestsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { tests, total, totalPages, isLoading, error } = useTestHistory({ page, limit });

  const columns = [
    { key: "sno", header: "#", render: (_t: TestHistory, index: number) => index + 1 },
    { key: "test_id", header: "Test ID", render: (t: TestHistory) => (
      <span className="font-mono text-sm">{t.test_id}</span>
    )},
    { key: "status", header: "Status", render: (t: TestHistory) => (
      <Badge variant="outline" className={statusColors[t.status] || ""}>
        {t.status === "completed" ? "Completed" : t.status === "in_progress" ? "In Progress" : t.status}
      </Badge>
    )},
    { key: "score", header: "Score", render: (t: TestHistory) => (
      <span className={`font-medium ${t.score >= 70 ? "text-green-500" : t.score >= 50 ? "text-yellow-500" : "text-red-500"}`}>
        {t.score?.toFixed(1) || "-"}%
      </span>
    )},
    { key: "correct", header: "Correct", render: (t: TestHistory) => (
      <span>{t.correct} / {t.totalQuestions}</span>
    )},
    { key: "startedAt", header: "Date", render: (t: TestHistory) => (
      <span>{new Date(t.startedAt).toLocaleDateString()}</span>
    )},
  ];

  const completedTests = tests.filter((t) => t.status === "completed");
  const avgScore = completedTests.length > 0
    ? completedTests.reduce((sum, t) => sum + (t.score || 0), 0) / completedTests.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tests</h1>
        <p className="text-muted-foreground">View your test history and performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold mt-1">{total}</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1">{completedTests.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold mt-1">{avgScore.toFixed(1)}%</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test History Table */}
      <DataTable
        title="Test History"
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