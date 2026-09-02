"use client";

import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { usePreAssessmentStatus } from "@/hooks/use-preassessment-status";
import { preAssessmentApi } from "@/lib/api/tests";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function PreAssessmentBanner() {
  const { status, isLoading, refetch } = usePreAssessmentStatus();
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  if (isLoading || !status || !status.required || status.completed) {
    return null;
  }

  const handleStart = async () => {
    try {
      setIsStarting(true);
      
      // If there's already an active session, just resume it
      if (status.sessionId) {
        router.push(`/live-test?id=${status.sessionId}`);
        return;
      }

      // Otherwise generate and start a new one
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await preAssessmentApi.start(token);
      if (res.success && res.data) {
        router.push(`/live-test?id=${res.data.id}`);
      } else {
        toast.error(res.message || "Failed to start pre-assessment");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Card className="mb-6 border-amber-500 bg-amber-500/10 dark:bg-amber-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
          <AlertTriangle className="h-5 w-5" />
          Mandatory Pre-Assessment Required
        </CardTitle>
        <CardDescription className="text-amber-600/90 dark:text-amber-400/90">
          You must complete the pre-assessment before you can take any other tests. This helps us understand your baseline.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleStart} 
          disabled={isStarting}
          className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600"
        >
          {isStarting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4 mr-2" />
          )}
          {status.sessionId ? "Resume Pre-Assessment" : "Start Pre-Assessment Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
