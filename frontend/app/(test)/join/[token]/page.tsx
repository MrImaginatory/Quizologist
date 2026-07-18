"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { predefinedTestsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, BookOpen, Play, AlertCircle } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";

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
}

export default function JoinTestPage() {
  const router = useRouter();
  const params = useParams();
  const { token: authToken, isLoading: authLoading } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{testInfo.title}</CardTitle>
          {testInfo.description && (
            <p className="text-muted-foreground">{testInfo.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{testInfo.duration_minutes} minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Questions</p>
                <p className="font-medium">{testInfo.question_limit}</p>
              </div>
            </div>
          </div>

          <div className="text-sm">
            <p className="text-muted-foreground">Difficulty</p>
            <p className="font-medium">{capitalize(testInfo.difficulty)}</p>
          </div>

          {testInfo.is_scheduled && (
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <p className="font-medium">Scheduled Test</p>
              {testInfo.start_time && (
                <p>Start: {new Date(testInfo.start_time).toLocaleString()}</p>
              )}
              {testInfo.end_time && (
                <p>End: {new Date(testInfo.end_time).toLocaleString()}</p>
              )}
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={isStarting}
            onClick={handleStartTest}
          >
            {isStarting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Play className="mr-2 h-5 w-5" />
            )}
            Start Test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
