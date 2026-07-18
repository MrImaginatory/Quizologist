"use client";

import { useRouter } from "next/navigation";
import { usePendingTests } from "@/hooks/use-pending-tests";
import { useAuth } from "@/contexts/auth-context";
import { predefinedTestsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Clock, Play, Calendar, AlertCircle, CheckCircle, Timer } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useMemo } from "react";

type TestStatus = "available" | "upcoming" | "expired";

export default function PendingTestsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { tests, isLoading, error } = usePendingTests();
  const [startingId, setStartingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const handleStartTest = async (testId: string) => {
    setStartingId(testId);
    try {
      const response = await predefinedTestsApi.start(testId, token || undefined);
      toast.success("Test started!");
      router.push(`/live-test?id=${response.data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start test");
    } finally {
      setStartingId(null);
    }
  };

  const getTestStatus = (test: any): TestStatus => {
    if (test.status === "upcoming") return "upcoming";
    if (test.is_scheduled && test.end_time) {
      const now = new Date();
      const endTime = new Date(test.end_time);
      if (now > endTime) return "expired";
    }
    return "available";
  };

  const statusConfig: Record<TestStatus, { color: string; icon: React.ReactNode; label: string }> = {
    upcoming: {
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: <Clock className="h-4 w-4" />,
      label: "Upcoming",
    },
    available: {
      color: "bg-green-500/10 text-green-500 border-green-500/20",
      icon: <CheckCircle className="h-4 w-4" />,
      label: "Available",
    },
    expired: {
      color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      icon: <AlertCircle className="h-4 w-4" />,
      label: "Expired",
    },
  };

  const filteredTests = useMemo(() => {
    if (filterStatus === "all") return tests;
    return tests.filter((test) => getTestStatus(test) === filterStatus);
  }, [tests, filterStatus]);

  const statusCounts = useMemo(() => {
    const counts = { available: 0, upcoming: 0, expired: 0 };
    tests.forEach((test) => {
      const status = getTestStatus(test);
      counts[status]++;
    });
    return counts;
  }, [tests]);

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
      <div>
        <h1 className="text-3xl font-bold">Available Tests</h1>
        <p className="text-muted-foreground">
          Tests available for you to take
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilterStatus("available")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-500">{statusCounts.available}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilterStatus("upcoming")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-blue-500">{statusCounts.upcoming}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilterStatus("expired")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-gray-500">{statusCounts.expired}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={(v) => { if (v) setFilterStatus(v); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tests</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {filteredTests.length} test(s) found
        </p>
      </div>

      {/* Tests Grid */}
      {filteredTests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {filterStatus === "all"
                ? "No tests available yet"
                : `No ${filterStatus} tests`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => {
            const testStatus = getTestStatus(test);
            const isAvailable = testStatus === "available";
            const config = statusConfig[testStatus];

            return (
              <Card key={test.id} className="relative overflow-hidden">
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className={config.color}>
                    <span className="mr-1">{config.icon}</span>
                    {config.label}
                  </Badge>
                </div>

                <CardHeader className="pr-24">
                  <CardTitle className="text-lg">{test.title}</CardTitle>
                  {test.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {test.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Test Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <span>{test.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Questions:</span>
                      <span>{test.question_limit}</span>
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <Badge variant="outline">{capitalize(test.difficulty)}</Badge>
                  </div>

                  {/* Schedule Info */}
                  {test.is_scheduled && (
                    <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                      <div className="flex items-center gap-2 font-medium">
                        <Calendar className="h-4 w-4" />
                        Scheduled Test
                      </div>
                      {test.start_time && (
                        <p className="text-xs pl-6">
                          Start: {new Date(test.start_time).toLocaleString()}
                        </p>
                      )}
                      {test.end_time && (
                        <p className="text-xs pl-6">
                          End: {new Date(test.end_time).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Start Button */}
                  <Button
                    className="w-full"
                    disabled={!isAvailable || startingId === test.id}
                    onClick={() => handleStartTest(test.id)}
                  >
                    {startingId === test.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    {testStatus === "upcoming"
                      ? "Not Started Yet"
                      : testStatus === "expired"
                        ? "Test Expired"
                        : "Start Test"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BookOpen(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
