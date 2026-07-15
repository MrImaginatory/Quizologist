"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTestHistory } from "@/hooks/use-test-history";
import { useAuth } from "@/contexts/auth-context";
import { TestHistory, testsApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ClipboardCheck, Trophy, CheckCircle, Play, RotateCcw, XCircle, BookOpen } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { StartTestDialog } from "@/components/dialogs/start-test-dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  abandoned: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function MyTestsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [abandonTarget, setAbandonTarget] = useState<TestHistory | null>(null);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const { tests, total, totalPages, isLoading, error, refetch } = useTestHistory({ page, limit });

  const columns = [
    { key: "sno", header: "#", render: (_t: TestHistory, index: number) => index + 1 },
    { key: "test_id", header: "Test ID", render: (t: TestHistory) => (
      <span className="font-mono text-sm">{t.test_id}</span>
    )},
    { key: "status", header: "Status", render: (t: TestHistory) => (
      <Badge variant="outline" className={statusColors[t.status] || ""}>
        {t.status === "completed" ? "Completed" : t.status === "in_progress" ? "In Progress" : t.status === "abandoned" ? "Abandoned" : t.status}
      </Badge>
    )},
    { key: "score", header: "Score", render: (t: TestHistory) => {
      const score = parseFloat(String(t.score)) || 0;
      return (
        <span className={`font-medium ${score >= 70 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500"}`}>
          {score > 0 ? score.toFixed(1) : "-"}%
        </span>
      );
    }},
    { key: "correct", header: "Correct", render: (t: TestHistory) => (
      <span>{t.correct || 0} / {t.total_questions}</span>
    )},
    { key: "started_at", header: "Date", render: (t: TestHistory) => {
      if (!t.started_at) return <span>-</span>;
      const date = new Date(t.started_at);
      if (isNaN(date.getTime())) return <span>-</span>;
      return <span>{date.toLocaleDateString()}</span>;
    }},
    { key: "actions", header: "Actions", render: (t: TestHistory) => {
      if (t.status === "in_progress") {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/live-test?id=${t.id}`)}
              className="gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Resume
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => handleAbandonClick(t)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        );
      }
      if (t.status === "completed") {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/test-result?id=${t.id}`)}
            className="gap-1"
          >
            <BookOpen className="h-4 w-4" />
            View
          </Button>
        );
      }
      return null;
    }},
  ];

  const completedTests = tests.filter((t) => t.status === "completed");
  const avgScore = completedTests.length > 0
    ? completedTests.reduce((sum, t) => sum + (parseFloat(String(t.score)) || 0), 0) / completedTests.length
    : 0;

  const handleStartTest = (testId: string) => {
    router.push(`/live-test?id=${testId}`);
  };

  const handleAbandonClick = (test: TestHistory) => {
    setAbandonTarget(test);
    setShowAbandonDialog(true);
  };

  const handleConfirmAbandon = async () => {
    if (!abandonTarget) return;

    setIsAbandoning(true);
    try {
      await testsApi.abandon(abandonTarget.id, token || undefined);
      toast.success("Test abandoned successfully");
      setShowAbandonDialog(false);
      setAbandonTarget(null);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to abandon test");
    } finally {
      setIsAbandoning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tests</h1>
          <p className="text-muted-foreground">View your test history and performance</p>
        </div>
        <Button onClick={() => setShowStartDialog(true)}>
          <Play className="mr-2 h-4 w-4" />
          Start Test
        </Button>
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

      {/* Start Test Dialog */}
      <StartTestDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        onStartTest={handleStartTest}
      />

      {/* Abandon Confirmation Dialog */}
      <ConfirmDialog
        open={showAbandonDialog}
        onOpenChange={setShowAbandonDialog}
        title="Abandon Test?"
        description="Are you sure you want to abandon this test? Your progress will be lost and the test will be marked as abandoned."
        confirmText="Abandon"
        isLoading={isAbandoning}
        onConfirm={handleConfirmAbandon}
      />
    </div>
  );
}
