"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { predefinedTestsApi, PredefinedTest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Play, Pause, Copy, Check } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";

export default function PredefinedTestDetailPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [test, setTest] = useState<PredefinedTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await predefinedTestsApi.getById(testId, token || undefined);
        setTest(response.data);
      } catch (err) {
        toast.error("Failed to fetch test details");
        router.push("/dashboard/tests");
      } finally {
        setIsLoading(false);
      }
    };

    if (testId) fetchTest();
  }, [testId, token, router]);

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await predefinedTestsApi.activate(testId, token || undefined);
      setTest((prev) => prev ? { ...prev, status: "active" } : null);
      toast.success("Test activated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to activate");
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await predefinedTestsApi.deactivate(testId, token || undefined);
      setTest((prev) => prev ? { ...prev, status: "inactive" } : null);
      toast.success("Test deactivated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate");
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleCopyLink = () => {
    if (test?.test_link_token) {
      const link = `${window.location.origin}/test/join/${test.test_link_token}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Test link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!test) return null;

  const statusColors: Record<string, string> = {
    draft: "bg-yellow-500/10 text-yellow-500",
    active: "bg-green-500/10 text-green-500",
    inactive: "bg-gray-500/10 text-gray-500",
    archived: "bg-red-500/10 text-red-500",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{test.title}</h1>
          {test.description && (
            <p className="text-muted-foreground">{test.description}</p>
          )}
        </div>
        <Badge className={statusColors[test.status]}>
          {capitalize(test.status)}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{test.duration_minutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Questions</span>
              <span className="font-medium">{test.question_limit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difficulty</span>
              <span className="font-medium">{capitalize(test.difficulty)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Attempts</span>
              <span className="font-medium">{test.max_attempts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fixed Questions</span>
              <span className="font-medium">{test.use_fixed_questions ? "Yes" : "No"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scheduled</span>
              <span className="font-medium">{test.is_scheduled ? "Yes" : "No"}</span>
            </div>
            {test.is_scheduled && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Time</span>
                  <span className="font-medium">
                    {test.start_time ? new Date(test.start_time).toLocaleString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Time</span>
                  <span className="font-medium">
                    {test.end_time ? new Date(test.end_time).toLocaleString() : "N/A"}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timezone</span>
              <span className="font-medium">{test.timezone}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-muted rounded text-sm">
              {test.test_link_token
                ? `${typeof window !== "undefined" ? window.location.origin : ""}/test/join/${test.test_link_token}`
                : "No link generated"}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              disabled={!test.test_link_token}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        {test.status === "draft" && (
          <Button onClick={handleActivate} disabled={isActivating}>
            {isActivating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Activate
          </Button>
        )}
        {test.status === "active" && (
          <Button variant="destructive" onClick={handleDeactivate} disabled={isDeactivating}>
            {isDeactivating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Pause className="mr-2 h-4 w-4" />
            )}
            Deactivate
          </Button>
        )}
      </div>
    </div>
  );
}
