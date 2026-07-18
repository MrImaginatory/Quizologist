"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { predefinedTestsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, BookOpen, Play, AlertCircle, Shield } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";
import { AppLogo } from "@/components/app-logo";

interface TestInfo {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  question_limit: number;
  difficulty: string;
  is_scheduled: boolean;
  start_time: string | null;
  end_time: string | null;
  status: string;
}

export default function JoinTestPage() {
  const router = useRouter();
  const params = useParams();
  const { token: authToken, isLoading: authLoading, user } = useAuth();
  const rawToken = params.token as string;

  // Extract the actual token from the URL format: test_name_start_end_uuid
  const token = rawToken.includes("_") ? rawToken.split("_").pop() || rawToken : rawToken;

  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!authToken) {
      // Store the current URL to redirect back after login
      const currentUrl = window.location.pathname;
      sessionStorage.setItem("redirectAfterLogin", currentUrl);
      router.push("/signin");
      return;
    }

    const fetchTestInfo = async () => {
      try {
        const response = await predefinedTestsApi.getByToken(token, authToken) as { data: TestInfo };
        setTestInfo(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test info");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchTestInfo();
  }, [token, authToken, authLoading, router]);

  const handleStartTest = async () => {
    if (!testInfo || !authToken) return;

    setIsStarting(true);
    try {
      const response = await predefinedTestsApi.start(testInfo.id, authToken);
      toast.success("Test started!");
      router.push(`/live-test?id=${response.data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start test");
    } finally {
      setIsStarting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Unable to Load Test</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!testInfo) return null;

  const isTestActive = testInfo.status === "active";
  const isScheduled = testInfo.is_scheduled;
  const now = new Date();
  const startTime = testInfo.start_time ? new Date(testInfo.start_time) : null;
  const endTime = testInfo.end_time ? new Date(testInfo.end_time) : null;
  const isWithinSchedule = !isScheduled || (startTime && now >= startTime && (!endTime || now <= endTime));

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <AppLogo size="lg" showName={true} />
        </div>

        {/* Test Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-2xl">{testInfo.title}</CardTitle>
              <Badge
                variant="outline"
                className={
                  isTestActive
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                }
              >
                {isTestActive ? "Active" : capitalize(testInfo.status)}
              </Badge>
            </div>
            {testInfo.description && (
              <p className="text-muted-foreground">{testInfo.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium">{testInfo.duration_minutes} minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Questions</p>
                  <p className="font-medium">{testInfo.question_limit}</p>
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Difficulty</p>
                <p className="font-medium">{capitalize(testInfo.difficulty)}</p>
              </div>
            </div>

            {/* Schedule Info */}
            {isScheduled && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Scheduled Test</p>
                {startTime && (
                  <p className="text-xs text-muted-foreground">
                    Start: {startTime.toLocaleString()}
                  </p>
                )}
                {endTime && (
                  <p className="text-xs text-muted-foreground">
                    End: {endTime.toLocaleString()}
                  </p>
                )}
                {!isWithinSchedule && (
                  <p className="text-xs text-orange-500">
                    This test is not available at this time
                  </p>
                )}
              </div>
            )}

            {/* Start Button */}
            <Button
              className="w-full"
              size="lg"
              disabled={isStarting || !isTestActive || !isWithinSchedule}
              onClick={handleStartTest}
            >
              {isStarting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Play className="mr-2 h-5 w-5" />
              )}
              {!isTestActive
                ? "Test Not Active"
                : !isWithinSchedule
                  ? "Not Available Yet"
                  : "Start Test"}
            </Button>

            {/* User Info */}
            {user && (
              <p className="text-center text-sm text-muted-foreground">
                Taking test as: {capitalize(user.fname)} {capitalize(user.lname)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
