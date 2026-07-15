"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ChevronDown,
  SkipForward,
  Eraser,
  AlertCircle,
  X,
  Sun,
  Moon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { capitalize } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/auth-context";
import { useTestSocket } from "@/hooks/use-test-socket";
import { testsApi, TestSession } from "@/lib/api";

function LiveTestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const testId = searchParams.get("id");
  const { token } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Read saved state once synchronously — before any useState calls
  const _saved = (() => {
    if (typeof window === "undefined" || !testId) return null;
    try { return JSON.parse(localStorage.getItem(`test_state_${testId}`) || "null"); }
    catch { return null; }
  })();

  const [testSession, setTestSession] = useState<TestSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(_saved?.currentQuestion ?? 0);
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    if (!_saved?.answers) return {};
    // JSON keys are always strings — convert back to number keys
    return Object.fromEntries(Object.entries(_saved.answers).map(([k, v]) => [Number(k), String(v)]));
  });
  const [skipped, setSkipped] = useState<Set<number>>(new Set(_saved?.skipped ?? []));
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [results, setResults] = useState<{ score: number; correct: number; total: number } | null>(null);
  const [questionNavOpen, setQuestionNavOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const questionStartTime = useRef<number>(Date.now());

  // Persist state to localStorage on every change
  useEffect(() => {
    if (!testId || testCompleted) return;
    localStorage.setItem(`test_state_${testId}`, JSON.stringify({
      answers,
      skipped: Array.from(skipped),
      currentQuestion,
    }));
  }, [answers, skipped, currentQuestion, testId, testCompleted]);

  // Socket connection
  const { isConnected, joinTest, sendAnswer, sendSkip, submitTest, startHeartbeat, stopHeartbeat } = useTestSocket({
    onTestJoined: (data) => {
      startHeartbeat(testId!, data.currentIndex);
    },
    onAnswerRecorded: (data) => {
      // Timer is managed by client-side calculation from ends_at
    },
    onTimeUpdate: (data) => {
      // Timer is managed by client-side calculation from ends_at
    },
    onTestSubmitted: (data) => {
      setResults({
        score: data.result.score,
        correct: data.result.correct,
        total: data.result.totalQuestions,
      });
      setTestCompleted(true);
      stopHeartbeat();
    },
    onError: (data) => {
      setError(data.message);
    },
  });

  // Warn user before refresh/leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!testCompleted && testId) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [testCompleted, testId]);

  // Fetch test session
  useEffect(() => {
    if (!testId || !token) return;

    const fetchTest = async () => {
      try {
        const response = await testsApi.getById(testId, token);
        setTestSession(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId, token]);

  // Join test room when connected
  useEffect(() => {
    if (isConnected && testId && testSession) {
      joinTest(testId);
    }
  }, [isConnected, testId, testSession, joinTest]);

  // Timer based on server's ends_at time
  useEffect(() => {
    if (!testSession?.ends_at || testCompleted) return;

    const endsAt = new Date(testSession.ends_at).getTime();

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [testSession?.ends_at, testCompleted]);

  const question = testSession?.questions?.[currentQuestion];
  const totalQuestions = testSession?.questions?.length || 0;
  const answeredCount = Object.keys(answers).length;
  const skippedCount = skipped.size;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = useCallback((answer: string) => {
    if (!question || !testId) return;

    const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000);
    sendAnswer(testId, currentQuestion, question.questionId, answer, timeTaken);
    questionStartTime.current = Date.now();

    setAnswers((prev) => ({ ...prev, [currentQuestion]: answer }));
    setSkipped((prev) => {
      const newSet = new Set(prev);
      newSet.delete(currentQuestion);
      return newSet;
    });
  }, [currentQuestion, question, testId, sendAnswer]);

  const handleClear = () => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion];
      return newAnswers;
    });
  };

  const handleSkip = useCallback(() => {
    if (!question || !testId) return;

    const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000);
    sendSkip(testId, currentQuestion, question.questionId, timeTaken);
    questionStartTime.current = Date.now();

    setSkipped((prev) => new Set(prev).add(currentQuestion));
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }, [currentQuestion, question, testId, sendSkip, totalQuestions]);

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      questionStartTime.current = Date.now();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      questionStartTime.current = Date.now();
    }
  };

  const handleSubmit = () => {
    if (testId) {
      stopHeartbeat();
      submitTest(testId);
      localStorage.removeItem(`test_state_${testId}`);
    }
    setShowConfirmSubmit(false);
  };

  const handleCancel = async () => {
    if (testId && token) {
      try {
        await testsApi.abandon(testId, token);
      } catch (err) {
        console.error("Failed to abandon test:", err);
      }
      localStorage.removeItem(`test_state_${testId}`);
    }
    stopHeartbeat();
    router.push("/dashboard/my-tests");
  };

  const getQuestionStatus = (index: number): "answered" | "skipped" | "current" | "unanswered" => {
    if (index === currentQuestion) return "current";
    if (answers[index]) return "answered";
    if (skipped.has(index)) return "skipped";
    return "unanswered";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "normal": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "mid": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "hard": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "expert": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !testSession) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4 shadow-lg">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-4"
            >
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              {error === "This test has already been completed"
                ? "This test has already been completed. You can view your results in the test history."
                : error || "We couldn't load the test session. Please try again."}
            </p>
            <Button onClick={() => router.push("/dashboard/my-tests")} className="w-full">
              View Test History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Screen
  if (testCompleted && results) {
    const score = results.score;
    const incorrect = results.total - results.correct;
    const scoreColor = score >= 70 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";
    const bgColor = score >= 70 ? "bg-emerald-500/10" : score >= 50 ? "bg-amber-500/10" : "bg-red-500/10";

    return (
      <div className="h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <Card className="w-full shadow-2xl border-0">
            <CardContent className="p-8">
              {/* Header with checkmark */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4"
                >
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold"
                >
                  Test Completed!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground mt-1"
                >
                  Great job finishing the test
                </motion.p>
              </div>

              {/* Score Circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
                className="flex justify-center mb-6"
              >
                <div className={`relative w-32 h-32 rounded-full ${bgColor} flex items-center justify-center`}>
                  <div className="text-center">
                    <span className={`text-4xl font-bold ${scoreColor}`}>
                      {score.toFixed(0)}
                    </span>
                    <span className={`text-lg ${scoreColor}`}>%</span>
                  </div>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-3 mb-6"
              >
                <div className="text-center p-3 rounded-xl bg-emerald-500/10">
                  <div className="text-xl font-bold text-emerald-500">{results.correct}</div>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-500/10">
                  <div className="text-xl font-bold text-red-500">{incorrect}</div>
                  <p className="text-xs text-muted-foreground">Incorrect</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted">
                  <div className="text-xl font-bold">{results.total}</div>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  className="w-full h-12"
                  onClick={() => router.push("/dashboard/my-tests")}
                >
                  View Test History
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b bg-card px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">Q</span>
            </div>
            <h1 className="text-lg font-bold hidden sm:block">Quiz App</h1>
            <Badge variant="secondary" className="font-mono text-xs hidden md:inline-flex">
              {testSession.test_id}
            </Badge>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <div className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-mono text-sm font-semibold transition-colors",
              timeLeft <= 60 ? "bg-red-500/10 text-red-500" : "bg-muted"
            )}>
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowCancelConfirm(true)}
              className="gap-1.5"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Mobile: Question Count at top */}
        <div className="md:hidden shrink-0 border-b bg-card">
          <Collapsible open={questionNavOpen} onOpenChange={setQuestionNavOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Questions</span>
                <span className="text-xs text-muted-foreground">
                  {answeredCount}/{totalQuestions}
                </span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                questionNavOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-3 pb-3 overflow-x-auto">
                <div className="flex gap-2 min-w-max justify-center">
                  {testSession.questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentQuestion(index);
                          setQuestionNavOpen(false);
                          questionStartTime.current = Date.now();
                        }}
                        className={cn(
                          "w-10 h-10 rounded-lg text-sm font-medium transition-all shrink-0",
                          status === "current" && "bg-primary text-primary-foreground shadow-md",
                          status === "answered" && "bg-primary/15 text-primary border border-primary/30",
                          status === "skipped" && "bg-amber-500/15 text-amber-500 border border-amber-500/30",
                          status === "unanswered" && "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Question Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 flex items-center justify-center">
            <div 
              className="flex flex-wrap justify-center content-center gap-x-20 gap-y-20 w-[150vw] h-[150vh] opacity-[0.08] dark:opacity-[0.04]"
              style={{ transform: "rotate(-35deg)" }}
            >
              {Array.from({ length: 150 }).map((_, i) => (
                <span key={i} className="font-mono text-xl text-foreground whitespace-nowrap">
                  {testSession.test_id}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium">
                {currentQuestion + 1}/{totalQuestions}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", getDifficultyColor(question.difficulty))}>
                  {capitalize(question.difficulty)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {capitalize(question.courseName)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {capitalize(question.subjectName)}
                </Badge>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold mb-8 leading-relaxed">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.choices.map((choice, choiceIndex) => {
                const letter = String.fromCharCode(65 + choiceIndex);
                const isSelected = answers[currentQuestion] === choice;

                return (
                  <motion.button
                    key={choiceIndex}
                    onClick={() => handleAnswer(choice)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: choiceIndex * 0.05 }}
                    className={cn(
                      "w-full p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 group",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <span className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      {letter}
                    </span>
                    <span className="flex-1 text-base">{choice}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="shrink-0 border-t bg-card p-3 sm:p-4 relative z-10">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={!answers[currentQuestion]}
                  className="gap-1.5"
                >
                  <Eraser className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="gap-1.5"
                >
                  <SkipForward className="h-4 w-4" />
                  <span className="hidden sm:inline">Skip</span>
                </Button>
              </div>

              {currentQuestion < totalQuestions - 1 ? (
                <Button onClick={handleNext} className="gap-1.5">
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setShowConfirmSubmit(true)} className="gap-1.5">
                  Submit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Question Count on Right Side */}
        <aside className="hidden md:flex w-64 shrink-0 border-l bg-card flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Questions</span>
              <span className="text-xs text-muted-foreground">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-4 gap-2">
              {testSession.questions.map((_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setCurrentQuestion(index);
                      questionStartTime.current = Date.now();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "aspect-square rounded-xl text-sm font-medium transition-all duration-200",
                      "flex items-center justify-center",
                      status === "current" && "bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                      status === "answered" && "bg-primary/15 text-primary border border-primary/30",
                      status === "skipped" && "bg-amber-500/15 text-amber-500 border border-amber-500/30",
                      status === "unanswered" && "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                    )}
                  >
                    {index + 1}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">Answered</span>
                </div>
                <span className="text-xs font-medium">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs text-muted-foreground">Skipped</span>
                </div>
                <span className="text-xs font-medium">{skippedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-muted border border-border" />
                  <span className="text-xs text-muted-foreground">Unanswered</span>
                </div>
                <span className="text-xs font-medium">{totalQuestions - answeredCount - skippedCount}</span>
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4"
          >
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Submit Test?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <div className="text-xl font-bold text-primary">{answeredCount}</div>
                    <div className="text-xs text-muted-foreground">Answered</div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10">
                    <div className="text-xl font-bold text-amber-500">{skippedCount}</div>
                    <div className="text-xs text-muted-foreground">Skipped</div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted">
                    <div className="text-xl font-bold">{totalQuestions - answeredCount - skippedCount}</div>
                    <div className="text-xs text-muted-foreground">Unanswered</div>
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 p-6 pt-0">
                <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
                  Go Back
                </Button>
                <Button onClick={handleSubmit}>Submit Test</Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4"
          >
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Cancel Test?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Are you sure you want to cancel this test? Your progress will be lost and the test will be marked as abandoned.
                </p>
              </CardContent>
              <div className="flex justify-end gap-2 p-6 pt-0">
                <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
                  Continue Test
                </Button>
                <Button variant="destructive" onClick={handleCancel}>
                  Cancel Test
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function LiveTestPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LiveTestContent />
    </Suspense>
  );
}