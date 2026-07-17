"use client";

import { useRouter } from "next/navigation";
import { usePendingTests } from "@/hooks/use-pending-tests";
import { useAuth } from "@/contexts/auth-context";
import { predefinedTestsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Play, Calendar } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

export default function PendingTestsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { tests, isLoading, error } = usePendingTests();
  const [startingId, setStartingId] = useState<string | null>(null);

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

  const getTestStatus = (test: any) => {
    if (test.status === "upcoming") return "upcoming";
    if (test.is_scheduled && test.end_time) {
      const now = new Date();
      const endTime = new Date(test.end_time);
      if (now > endTime) return "expired";
    }
    return "available";
  };

  const statusColors: Record<string, string> = {
    upcoming: "bg-blue-500/10 text-blue-500",
    available: "bg-green-500/10 text-green-500",
    expired: "bg-gray-500/10 text-gray-500",
  };

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
        <h1 className="text-3xl font-bold">Pending Tests</h1>
        <p className="text-muted-foreground">
          Tests available for you to take
        </p>
      </div>

      {tests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No pending tests available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => {
            const testStatus = getTestStatus(test);
            const isAvailable = testStatus === "available";

            return (
              <Card key={test.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    <Badge className={statusColors[testStatus]}>
                      {capitalize(testStatus)}
                    </Badge>
                  </div>
                  {test.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {test.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{test.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Questions:</span>
                      <span>{test.question_limit}</span>
                    </div>
                  </div>

                  {test.is_scheduled && (
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Scheduled</span>
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
                    {testStatus === "upcoming" ? "Not Started Yet" : "Start Test"}
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
