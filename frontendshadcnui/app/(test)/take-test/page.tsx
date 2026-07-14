"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { capitalize } from "@/lib/utils";

interface Question {
  index: number;
  questionId: string;
  question: string;
  choices: string[];
  difficulty: string;
  topicName: string;
  subjectName: string;
  courseName: string;
}

interface TestSession {
  id: string;
  test_id: string;
  status: string;
  duration_minutes: number;
  question_limit: number;
  ends_at: string;
  totalQuestions: number;
  questions: Question[];
}

// Dummy test session data
const dummyTestSession: TestSession = {
  id: "test-123",
  test_id: "john_doe_mon_20260714_171500",
  status: "in_progress",
  duration_minutes: 30,
  question_limit: 10,
  ends_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  totalQuestions: 10,
  questions: [
    {
      index: 0,
      questionId: "q1",
      question: "What is the time complexity of binary search?",
      choices: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
      difficulty: "normal",
      topicName: "Algorithms",
      subjectName: "Computer Science",
      courseName: "Data Structures",
    },
    {
      index: 1,
      questionId: "q2",
      question: "Which data structure uses LIFO (Last In First Out) principle?",
      choices: ["Queue", "Stack", "Array", "Linked List"],
      difficulty: "beginner",
      topicName: "Data Structures",
      subjectName: "Computer Science",
      courseName: "Data Structures",
    },
    {
      index: 2,
      questionId: "q3",
      question: "What is the worst-case time complexity of Quick Sort?",
      choices: ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"],
      difficulty: "hard",
      topicName: "Sorting Algorithms",
      subjectName: "Algorithms",
      courseName: "Data Structures",
    },
    {
      index: 3,
      questionId: "q4",
      question: "Which traversal of a binary search tree gives sorted order?",
      choices: ["Pre-order", "Post-order", "In-order", "Level-order"],
      difficulty: "normal",
      topicName: "Tree Traversals",
      subjectName: "Data Structures",
      courseName: "Data Structures",
    },
    {
      index: 4,
      questionId: "q5",
      question: "What is the space complexity of merge sort?",
      choices: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
      difficulty: "mid",
      topicName: "Sorting Algorithms",
      subjectName: "Algorithms",
      courseName: "Data Structures",
    },
    {
      index: 5,
      questionId: "q6",
      question: "Which graph algorithm is used to find shortest path in weighted graphs?",
      choices: ["BFS", "DFS", "Dijkstra's", "Prim's"],
      difficulty: "normal",
      topicName: "Graph Algorithms",
      subjectName: "Algorithms",
      courseName: "Data Structures",
    },
    {
      index: 6,
      questionId: "q7",
      question: "What is the load factor in hash tables?",
      choices: [
        "Number of elements / Number of buckets",
        "Number of buckets / Number of elements",
        "Total capacity / Used capacity",
        "None of the above",
      ],
      difficulty: "mid",
      topicName: "Hash Tables",
      subjectName: "Data Structures",
      courseName: "Data Structures",
    },
    {
      index: 7,
      questionId: "q8",
      question: "Which type of queue allows insertion at both ends?",
      choices: ["Simple Queue", "Priority Queue", "Deque", "Circular Queue"],
      difficulty: "beginner",
      topicName: "Queues",
      subjectName: "Data Structures",
      courseName: "Data Structures",
    },
    {
      index: 8,
      questionId: "q9",
      question: "What is the height of a balanced binary tree with n nodes?",
      choices: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
      difficulty: "hard",
      topicName: "Balanced Trees",
      subjectName: "Data Structures",
      courseName: "Data Structures",
    },
    {
      index: 9,
      questionId: "q10",
      question: "Which algorithm is used for cycle detection in a graph?",
      choices: ["BFS", "DFS", "Both BFS and DFS", "None of the above"],
      difficulty: "expert",
      topicName: "Graph Algorithms",
      subjectName: "Algorithms",
      courseName: "Data Structures",
    },
  ],
};

export default function TakeTestPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [results, setResults] = useState<{ score: number; correct: number; total: number } | null>(null);
  const [questionNavOpen, setQuestionNavOpen] = useState(true);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const testSession = dummyTestSession;
  const question = testSession.questions[currentQuestion];
  const totalQuestions = testSession.questions.length;
  const answeredCount = Object.keys(answers).length;
  const skippedCount = skipped.size;

  // Calculate time left
  useEffect(() => {
    const endTime = new Date(testSession.ends_at).getTime();
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        handleSubmit(answers);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answer }));
    setSkipped((prev) => {
      const newSet = new Set(prev);
      newSet.delete(currentQuestion);
      return newSet;
    });
  };

  const handleClear = () => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion];
      return newAnswers;
    });
  };

  const handleSkip = () => {
    setSkipped((prev) => new Set(prev).add(currentQuestion));
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = (finalAnswers: Record<number, string> = answers) => {
    let correct = 0;
    testSession.questions.forEach((q, index) => {
      if (finalAnswers[index] === q.choices[0]) {
        correct++;
      }
    });

    const score = (correct / testSession.questions.length) * 100;
    setResults({ score, correct, total: testSession.questions.length });
    setTestCompleted(true);
    setShowConfirmSubmit(false);
  };

  const handleCancel = () => {
    setShowCancelConfirm(false);
    window.location.href = "/dashboard/my-tests";
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

  // Results Screen
  if (testCompleted && results) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Test Completed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10"
                >
                  <span className="text-3xl font-bold text-primary">{results.score.toFixed(0)}%</span>
                </motion.div>
                <p className="text-muted-foreground mt-3">Your Score</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-emerald-500/10">
                  <div className="text-2xl font-bold text-emerald-500">{results.correct}</div>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-red-500/10">
                  <div className="text-2xl font-bold text-red-500">{results.total - results.correct}</div>
                  <p className="text-xs text-muted-foreground">Incorrect</p>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={() => window.location.href = "/dashboard/my-tests"}>
                View Test History
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b bg-card px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between mx-auto">
          <div className="flex items-center gap-3">
            {/* Logo only on mobile, Logo + Name on desktop */}
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">Q</span>
            </div>
            <h1 className="text-lg font-bold hidden sm:block">Quiz App</h1>
            <Badge variant="secondary" className="font-mono text-xs hidden md:inline-flex">
              {testSession.test_id}
            </Badge>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
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

            {/* Timer */}
            <div className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-mono text-sm font-semibold transition-colors",
              timeLeft <= 60 ? "bg-red-500/10 text-red-500" : "bg-muted"
            )}>
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Cancel Button */}
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
                        onClick={() => setCurrentQuestion(index)}
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
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            <div
              className="absolute inset-0"
              style={{
                transform: "rotate(-35deg) scale(1.5)",
                transformOrigin: "center center",
              }}
            >
              {Array.from({ length: 80 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute font-mono text-[10px] opacity-[0.07] dark:opacity-[0.05] text-gray-900 dark:text-gray-100 whitespace-nowrap"
                  style={{
                    top: `${Math.floor(i / 10) * 80 - 300}px`,
                    left: `${(i % 10) * 200 - 200}px`,
                  }}
                >
                  {testSession.test_id}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 relative z-10">
            {/* Question Meta */}
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

              {/* Question */}
              <h2 className="text-xl sm:text-2xl font-semibold mb-8 leading-relaxed">
                {question.question}
              </h2>

              {/* Choices */}
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
            {/* Progress Bar */}
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
                    onClick={() => setCurrentQuestion(index)}
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

            {/* Legend */}
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
                <Button onClick={() => handleSubmit()}>Submit Test</Button>
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