"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Clock, ChevronLeft, ChevronRight, CheckCircle2, ChevronDown,
  SkipForward, AlertCircle, X, Sun, Moon, Loader2,
} from "lucide-react";
import { cn, capitalize } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/auth-context";
import { useTimeBasedSocket } from "@/hooks/use-time-based-socket";
import { Question } from "@/lib/api/types";
import { toast } from "sonner";

function TimeBasedLiveTestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const testId = searchParams.get("id");
  const { token } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();

  // Questions accumulate as backend serves them
  const [questions, setQuestions] = useState<Question[]>([]);
  // Which question index is being viewed
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // Submitted answers per question index
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, string>>({});
  // Skipped question indices
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  // Local selection for the CURRENT question (not yet submitted)
  const [selectedOption, setSelectedOption] = useState<string>("");

  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [error, setError] = useState("");
  const [testCompleted, setTestCompleted] = useState(false);
  const [results, setResults] = useState<{ score: number; correct: number; total: number } | null>(null);
  const [allCorrect, setAllCorrect] = useState(false);
  const [questionNavOpen, setQuestionNavOpen] = useState(true);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const questionStartTime = useRef<number>(Date.now());
  // Index to auto-advance to when the next question arrives
  const nextIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!testCompleted && testId) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [testCompleted, testId]);

  const { isConnected, joinTest, sendAnswer, sendSkip, submitTest, startHeartbeat, stopHeartbeat } =
    useTimeBasedSocket({
      onTestJoined: (data) => {
        startHeartbeat(testId!);
        setTimeLeft(data.timeRemaining);
      },
      onNextQuestion: (data) => {
        setQuestions((prev) => [...prev, data.question]);
        
        if (nextIndexRef.current !== null) {
          setCurrentQuestion(nextIndexRef.current);
          nextIndexRef.current = null;
        }

        setSelectedOption("");
        setIsSubmittingAnswer(false);
        setIsInitialLoading(false);
        questionStartTime.current = Date.now();
      },
      onAllCorrect: () => {
        setAllCorrect(true);
        setIsSubmittingAnswer(false);
        setIsInitialLoading(false);
      },
      onTimeUpdate: (data) => { setTimeLeft(data.timeRemaining); },
      onTestSubmitted: (data) => {
        setResults({ score: data.result.score, correct: data.result.correct, total: data.result.totalQuestions });
        setTestCompleted(true);
        setIsSubmittingAnswer(false);
        stopHeartbeat();
        if (data.reason === "timeout") toast.info("Time's up! Your test has been submitted.");
      },
      onError: (data) => {
        setError(data.message);
        setIsInitialLoading(false);
        setIsSubmittingAnswer(false);
        toast.error(data.message);
      },
    });

  useEffect(() => {
    if (testId && token) joinTest(testId);
  }, [testId, token, joinTest]);

  // Clear selectedOption when navigating to a different question
  useEffect(() => {
    setSelectedOption(submittedAnswers[currentQuestion] || "");
  }, [currentQuestion]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || testCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);
        if (next <= 0) { clearInterval(timer); handleSubmitTest(); }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, testCompleted]);

  const question = questions[currentQuestion] ?? null;
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(submittedAnswers).length;
  const skippedCount = skipped.size;
  // A question is "done" (locked) if it has been submitted or skipped
  const currentQuestionDone = !!submittedAnswers[currentQuestion] || skipped.has(currentQuestion);
  // The last question is the live one that hasn't been submitted yet
  const isOnLatestQuestion = currentQuestion === questions.length - 1;

  const formatTime = (seconds: number) => {
    if (seconds < 0) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "normal":   return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "mid":      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "hard":     return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "expert":   return "bg-red-500/10 text-red-500 border-red-500/20";
      default:         return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getQuestionStatus = (index: number): "answered" | "skipped" | "current" | "unanswered" => {
    if (index === currentQuestion) return "current";
    if (submittedAnswers[index]) return "answered";
    if (skipped.has(index)) return "skipped";
    return "unanswered";
  };

  // Save & Next — submit the selected answer and request the next question
  const handleSaveNext = () => {
    if (!question || !testId || !selectedOption || isSubmittingAnswer) return;
    const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000);
    const submittingIndex = currentQuestion;
    setSubmittedAnswers((prev) => ({ ...prev, [submittingIndex]: selectedOption }));
    setSkipped((prev) => { const s = new Set(prev); s.delete(submittingIndex); return s; });
    nextIndexRef.current = submittingIndex + 1;
    setIsSubmittingAnswer(true);
    sendAnswer(testId, question.id, selectedOption, timeTaken);
  };

  // Skip — skip current question and request the next
  const handleSkip = () => {
    if (!question || !testId || isSubmittingAnswer) return;
    const timeTaken = Math.floor((Date.now() - questionStartTime.current) / 1000);
    const skippingIndex = currentQuestion;
    setSkipped((prev) => new Set(prev).add(skippingIndex));
    setSubmittedAnswers((prev) => { const a = { ...prev }; delete a[skippingIndex]; return a; });
    setSelectedOption("");
    nextIndexRef.current = skippingIndex + 1;
    setIsSubmittingAnswer(true);
    sendSkip(testId, question.id, timeTaken);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
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

  const handleSubmitTest = () => {
    if (testId) { stopHeartbeat(); submitTest(testId); }
    setShowConfirmSubmit(false);
  };

  const handleCancel = () => { stopHeartbeat(); router.push("/dashboard/my-tests"); };

  // ── Loading (waiting for first question) ───────────────────────────────
  if (isInitialLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4 shadow-lg">
          <CardContent className="p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-4">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push("/dashboard/my-tests")} className="w-full">Back to My Tests</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Results ─────────────────────────────────────────────────────────────
  if (testCompleted && results) {
    const score = results.score;
    const incorrect = results.total - results.correct;
    const scoreColor = score >= 70 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";
    const bgColor   = score >= 70 ? "bg-emerald-500/10" : score >= 50 ? "bg-amber-500/10" : "bg-red-500/10";
    return (
      <div className="h-screen flex items-center justify-center bg-background p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }} className="w-full max-w-2xl">
          <Card className="w-full shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl font-bold">Test Completed!</motion.h2>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-muted-foreground mt-1">Great job finishing the time-based test</motion.p>
              </div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring", stiffness: 150 }} className="flex justify-center mb-6">
                <div className={`relative w-32 h-32 rounded-full ${bgColor} flex items-center justify-center`}>
                  <div className="text-center">
                    <span className={`text-4xl font-bold ${scoreColor}`}>{score.toFixed(0)}</span>
                    <span className={`text-lg ${scoreColor}`}>%</span>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 rounded-xl bg-emerald-500/10"><div className="text-xl font-bold text-emerald-500">{results.correct}</div><p className="text-xs text-muted-foreground">Correct</p></div>
                <div className="text-center p-3 rounded-xl bg-red-500/10"><div className="text-xl font-bold text-red-500">{incorrect}</div><p className="text-xs text-muted-foreground">Incorrect</p></div>
                <div className="text-center p-3 rounded-xl bg-muted"><div className="text-xl font-bold">{results.total}</div><p className="text-xs text-muted-foreground">Total</p></div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                <Button className="w-full h-12" onClick={() => router.push("/dashboard/my-tests")}>View Test History</Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const showAllCorrectBanner = allCorrect && isOnLatestQuestion && currentQuestionDone;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b bg-card px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center relative">
              {process.env.NEXT_PUBLIC_APP_LOGO
                ? <img src={process.env.NEXT_PUBLIC_APP_LOGO} alt="Logo" className="w-5 h-5 object-contain" />
                : <span className="text-primary font-bold text-sm">Q</span>}
              <div className={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background", isConnected ? "bg-emerald-500" : "bg-red-500")} title={isConnected ? "Connected" : "Disconnected"} />
            </div>
            <h1 className="text-lg font-bold hidden sm:block">{process.env.NEXT_PUBLIC_APP_NAME || "Quiz App"}</h1>
            <Badge variant="secondary" className="font-mono text-xs hidden md:inline-flex">TIME-BASED</Badge>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="h-9 w-9">
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className={cn("flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-mono text-sm font-semibold transition-colors", timeLeft <= 60 ? "bg-red-500/10 text-red-500" : "bg-muted")}>
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setShowCancelConfirm(true)} className="gap-1.5">
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Mobile nav */}
        <div className="md:hidden shrink-0 border-b bg-card">
          <Collapsible open={questionNavOpen} onOpenChange={setQuestionNavOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Questions</span>
                <span className="text-xs text-muted-foreground">{answeredCount}/{totalQuestions} answered</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", questionNavOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-3 pb-3 overflow-x-auto">
                <div className="flex gap-2 min-w-max justify-center">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button key={index} onClick={() => { setCurrentQuestion(index); setQuestionNavOpen(false); questionStartTime.current = Date.now(); }}
                        className={cn("w-10 h-10 rounded-lg text-sm font-medium transition-all shrink-0",
                          status === "current"    && "bg-primary text-primary-foreground shadow-md",
                          status === "answered"   && "bg-primary/15 text-primary border border-primary/30",
                          status === "skipped"    && "bg-amber-500/15 text-amber-500 border border-amber-500/30",
                          status === "unanswered" && "bg-muted text-muted-foreground hover:bg-muted/80")}>
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Question area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 flex items-center justify-center">
            <div className="flex flex-wrap justify-center content-center gap-x-20 gap-y-20 w-[150vw] h-[150vh] opacity-[0.08] dark:opacity-[0.04]" style={{ transform: "rotate(-35deg)" }}>
              {Array.from({ length: 150 }).map((_, i) => (
                <span key={i} className="font-mono text-xl text-foreground whitespace-nowrap">TIME-BASED</span>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 relative z-10">
            {/* All correct banner */}
            {showAllCorrectBanner ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-6">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold">You're unstoppable!</h2>
                <p className="text-muted-foreground max-w-md">You have correctly answered every question in the bank. Submit the test to see your final score.</p>
                <Button onClick={() => setShowConfirmSubmit(true)} className="mt-4">Submit Test</Button>
              </div>
            ) : isSubmittingAnswer ? (
              /* Loading next question */
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading next question...</p>
              </div>
            ) : question ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-muted-foreground">Question {currentQuestion + 1}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs", getDifficultyColor((question as any).difficulty))}>
                      {capitalize((question as any).difficulty || "normal")}
                    </Badge>
                    {(question as any).courseName && <Badge variant="secondary" className="text-xs">{capitalize((question as any).courseName)}</Badge>}
                    {(question as any).subjectName && <Badge variant="secondary" className="text-xs">{capitalize((question as any).subjectName)}</Badge>}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={`${question.id}-${currentQuestion}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: question.question.replace(/^(?:<[^>]*>)?\s*(?:Q\s*\d+|\d+)\s*[.)\]]?\s*/i, (match, p1) => (p1 || '') + (currentQuestion + 1) + '. ') }} />
                    <div className="space-y-3">
                      {question.choices?.map((choice, choiceIndex) => {
                        const letter = String.fromCharCode(65 + choiceIndex);
                        // For past (locked) questions, show submitted answer
                        const isLockedQuestion = currentQuestionDone && !isOnLatestQuestion;
                        const displaySelected = isLockedQuestion ? submittedAnswers[currentQuestion] === choice : selectedOption === choice;

                        return (
                          <motion.button
                            key={choiceIndex}
                            onClick={() => {
                              // Only allow selection on the current live question (not locked past ones)
                              if (!currentQuestionDone) setSelectedOption(choice);
                            }}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: choiceIndex * 0.05 }}
                            className={cn(
                              "w-full p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 group",
                              displaySelected      ? "border-primary bg-primary/5 shadow-sm"
                              : currentQuestionDone ? "border-border opacity-60 cursor-not-allowed"
                              :                      "border-border hover:border-primary/40 hover:bg-muted/30"
                            )}>
                            <span className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors",
                              displaySelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                            )}>
                              {letter}
                            </span>
                            <span className="flex-1 text-base" dangerouslySetInnerHTML={{ __html: choice }} />
                            {displaySelected && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </>
            ) : null}
          </div>

          {/* Bottom nav */}
          {!showAllCorrectBanner && !isSubmittingAnswer && question && (
            <div className="shrink-0 border-t bg-card p-3 sm:p-4 relative z-10">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="gap-1.5">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-2">
                  {/* Skip — only for the latest live question */}
                  {isOnLatestQuestion && !currentQuestionDone && (
                    <Button variant="outline" onClick={handleSkip} className="gap-1.5">
                      <SkipForward className="h-4 w-4" />
                      <span className="hidden sm:inline">Skip</span>
                    </Button>
                  )}
                </div>

                {/* Right side button */}
                {isOnLatestQuestion && !currentQuestionDone ? (
                  /* Save & Next — submit answer */
                  <Button onClick={handleSaveNext} disabled={!selectedOption} className="gap-1.5">
                    <span className="hidden sm:inline">Save &amp; Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : currentQuestion < questions.length - 1 ? (
                  /* Browsing past questions — navigate forward */
                  <Button onClick={handleNext} className="gap-1.5">
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  /* On latest question, already answered — waiting for backend to serve next question.
                     Show a disabled placeholder so the layout doesn't shift. */
                  <Button disabled className="gap-1.5 opacity-40">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Loading...</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 border-l bg-card flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Questions</span>
              <span className="text-xs text-muted-foreground">{answeredCount} answered</span>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-4 gap-2">
              {questions.map((_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <motion.button key={index} onClick={() => { setCurrentQuestion(index); questionStartTime.current = Date.now(); }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("aspect-square rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center",
                      status === "current"    && "bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                      status === "answered"   && "bg-primary/15 text-primary border border-primary/30",
                      status === "skipped"    && "bg-amber-500/15 text-amber-500 border border-amber-500/30",
                      status === "unanswered" && "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent")}>
                    {index + 1}
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-xs text-muted-foreground">Answered</span></div><span className="text-xs font-medium">{answeredCount}</span></div>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-xs text-muted-foreground">Skipped</span></div><span className="text-xs font-medium">{skippedCount}</span></div>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-muted border border-border" /><span className="text-xs text-muted-foreground">Unanswered</span></div><span className="text-xs font-medium">{totalQuestions - answeredCount - skippedCount}</span></div>
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4">
            <Card className="shadow-2xl">
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-amber-500" />Submit Test?</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-primary/10"><div className="text-xl font-bold text-primary">{answeredCount}</div><div className="text-xs text-muted-foreground">Answered</div></div>
                  <div className="p-3 rounded-xl bg-amber-500/10"><div className="text-xl font-bold text-amber-500">{skippedCount}</div><div className="text-xs text-muted-foreground">Skipped</div></div>
                  <div className="p-3 rounded-xl bg-muted"><div className="text-xl font-bold">{totalQuestions - answeredCount - skippedCount}</div><div className="text-xs text-muted-foreground">Unanswered</div></div>
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 p-6 pt-0">
                <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>Go Back</Button>
                <Button onClick={handleSubmitTest}>Submit Test</Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4">
            <Card className="shadow-2xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertCircle className="h-5 w-5" />Cancel Test?</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">Are you sure you want to leave? Your session stays active and you can resume from My Tests.</p></CardContent>
              <div className="flex justify-end gap-2 p-6 pt-0">
                <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>Continue Test</Button>
                <Button variant="destructive" onClick={handleCancel}>Cancel Test</Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function TimeBasedLiveTestPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <TimeBasedLiveTestContent />
    </Suspense>
  );
}
