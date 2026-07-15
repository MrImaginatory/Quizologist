"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { capitalize } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { testsApi, TestResult } from "@/lib/api";

function TestResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const testId = searchParams.get("id");
  const { token } = useAuth();

  const [result, setResult] = useState<TestResult | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!testId || !token) return;

    const fetchResult = async () => {
      try {
        const response = await testsApi.getResult(testId, token);
        setResult(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [testId, token]);

  const question = result?.questions?.[currentQuestion];
  const totalQuestions = result?.questions?.length || 0;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4 shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Could not load results</h2>
            <p className="text-muted-foreground mb-6">
              {error || "The results for this test are not available yet."}
            </p>
            <Button onClick={() => router.push("/dashboard/my-tests")} className="w-full">
              View Test History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const score = result.score;
  const scoreColor = score >= 70 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";
  const bgColor = score >= 70 ? "bg-emerald-500/10" : score >= 50 ? "bg-amber-500/10" : "bg-red-500/10";

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/my-tests")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Test Results</h1>
              <p className="text-xs text-muted-foreground">{result.test_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={cn("text-sm", bgColor, scoreColor)}>
              {score.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar - Question Navigator */}
        <aside className="hidden lg:block w-64 shrink-0 border-r bg-card">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Questions</span>
              <span className="text-xs text-muted-foreground">
                {result.correct}/{totalQuestions}
              </span>
            </div>
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${(result.correct / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="grid grid-cols-5 gap-1.5 p-1">
              {result.questions.map((q, index) => {
                const isAnswered = q.selectedAnswer !== null && q.selectedAnswer !== "";
                const isSkipped = q.selectedAnswer !== null && q.selectedAnswer === "";
                const isCorrect = q.isCorrect;

                let bgColor = "bg-muted text-muted-foreground"; // unanswered
                if (isCorrect) bgColor = "bg-emerald-500/20 text-emerald-500";
                else if (isSkipped) bgColor = "bg-amber-500/20 text-amber-500";
                else if (isAnswered && !isCorrect) bgColor = "bg-red-500/20 text-red-500";

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={cn(
                      "aspect-square rounded-lg text-xs font-medium transition-all",
                      "flex items-center justify-center",
                      index === currentQuestion && "ring-2 ring-primary",
                      bgColor
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500/40" />
                <span className="text-muted-foreground">Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-500/40" />
                <span className="text-muted-foreground">Incorrect</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500/40" />
                <span className="text-muted-foreground">Skipped</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-muted" />
                <span className="text-muted-foreground">Unanswered</span>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 flex items-center justify-center">
            <div 
              className="flex flex-wrap justify-center content-center gap-x-20 gap-y-20 w-[150vw] h-[150vh] opacity-[0.08] dark:opacity-[0.04]"
              style={{ transform: "rotate(-35deg)" }}
            >
              {Array.from({ length: 150 }).map((_, i) => (
                <span key={i} className="font-mono text-xl text-foreground whitespace-nowrap">
                  {result.test_id}
                </span>
              ))}
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 relative z-10">
            {question && (
              <div className=" mx-auto">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">
                    Question {currentQuestion + 1} of {totalQuestions}
                  </span>
                  <div className="flex items-center gap-2">
                    {question.isCorrect ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Correct
                      </Badge>
                    ) : question.selectedAnswer === null || question.selectedAnswer === "" ? (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        Skipped
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        Incorrect
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {capitalize(question.courseName)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {capitalize(question.subjectName)}
                    </Badge>
                  </div>
                </div>

                {/* Question */}
                <h2 className="text-lg font-semibold mb-6">
                  {question.question}
                </h2>

                {/* Choices */}
                <div className="space-y-3 mb-6">
                  {question.choices.map((choice, choiceIndex) => {
                    const letter = String.fromCharCode(65 + choiceIndex);
                    const isSelected = choice === question.selectedAnswer;
                    const isCorrect = choice === question.correctAnswer;

                    return (
                      <div
                        key={choiceIndex}
                        className={cn(
                          "p-4 rounded-xl border-2 flex items-center gap-4",
                          isCorrect && "border-emerald-500 bg-emerald-500/5",
                          isSelected && !isCorrect && "border-red-500 bg-red-500/5",
                          !isCorrect && !isSelected && "border-border"
                        )}
                      >
                        <span className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                          isCorrect ? "bg-emerald-500 text-white" :
                            isSelected ? "bg-red-500 text-white" :
                              "bg-muted text-muted-foreground"
                        )}>
                          {letter}
                        </span>
                        <span className="flex-1">{choice}</span>
                        {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                        {isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <Card className="mb-4">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Explanation</h4>
                      <p className="text-sm text-muted-foreground">{question.explanation}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Video */}
                {question.videoUrl && (
                  <Card className="mb-4">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Video Explanation</h4>
                      <a
                        href={question.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Watch video explanation
                      </a>
                    </CardContent>
                  </Card>
                )}

                {/* Time Taken */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time taken: {question.timeTaken} seconds</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="shrink-0 border-t bg-card p-3 sm:p-4 relative z-10">
            <div className=" mx-auto flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={() => setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))}
                disabled={currentQuestion === totalQuestions - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestResultPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <TestResultContent />
    </Suspense>
  );
}
