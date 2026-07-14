"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Send,
  SkipForward,
  Eraser,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/app-logo";

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
  const [testCompleted, setTestCompleted] = useState(false);
  const [results, setResults] = useState<{ score: number; correct: number; total: number } | null>(null);

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

  const getQuestionStatus = (index: number): "answered" | "skipped" | "current" | "unanswered" => {
    if (index === currentQuestion) return "current";
    if (answers[index]) return "answered";
    if (skipped.has(index)) return "skipped";
    return "unanswered";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/10 text-green-500";
      case "normal": return "bg-blue-500/10 text-blue-500";
      case "mid": return "bg-yellow-500/10 text-yellow-500";
      case "hard": return "bg-orange-500/10 text-orange-500";
      case "expert": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  // Results Screen
  if (testCompleted && results) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Test Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{results.score.toFixed(1)}%</div>
              <p className="text-muted-foreground mt-2">Your Score</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-500">{results.correct}</div>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="text-center p-4 bg-red-500/10 rounded-lg">
                <div className="text-2xl font-bold text-red-500">{results.total - results.correct}</div>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => window.location.href = "/dashboard/my-tests"}>
              View Test History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 border-b px-4 py-2 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AppLogo size="sm" showName={true} />
            <Badge variant="outline" className="font-mono text-xs">
              {testSession.test_id}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress Stats */}
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {answeredCount} Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                {skippedCount} Skipped
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-muted" />
                {totalQuestions - answeredCount - skippedCount} Left
              </span>
            </div>

            {/* Timer */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold",
              timeLeft <= 60 ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-muted"
            )}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>

            <Button onClick={() => setShowConfirmSubmit(true)} size="sm" className="gap-1">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Submit</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Content - Left/Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-3xl mx-auto">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {totalQuestions}
                  </span>
                  <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {question.courseName} → {question.subjectName}
                  <br />
                  {question.topicName}
                </div>
              </div>

              {/* Question */}
              <div className="text-lg mb-6">{question.question}</div>

              {/* Choices */}
              <div className="space-y-3">
                {question.choices.map((choice, choiceIndex) => {
                  const letter = String.fromCharCode(65 + choiceIndex);
                  const isSelected = answers[currentQuestion] === choice;

                  return (
                    <button
                      key={choiceIndex}
                      onClick={() => handleAnswer(choice)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-4",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {letter}
                      </span>
                      <span className="flex-1">{choice}</span>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="shrink-0 border-t bg-background p-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={!answers[currentQuestion]}
                  className="gap-1"
                >
                  <Eraser className="h-4 w-4" />
                  Clear
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="gap-1"
                >
                  <SkipForward className="h-4 w-4" />
                  Skip
                </Button>
              </div>

              {currentQuestion < totalQuestions - 1 ? (
                <Button onClick={handleNext} className="gap-1">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setShowConfirmSubmit(true)} className="gap-1">
                  <Send className="h-4 w-4" />
                  Submit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Question Count - Right Side */}
        <div className="w-64 shrink-0 bg-background flex flex-col border-l border-border/50">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold text-sm">Questions</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {answeredCount} of {totalQuestions} answered
            </p>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-5 gap-2">
              {testSession.questions.map((_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={cn(
                      "aspect-square rounded-xl text-sm font-medium transition-all duration-150",
                      "flex items-center justify-center",
                      status === "current" && "bg-primary text-primary-foreground shadow-md scale-105",
                      status === "answered" && "bg-primary/20 text-primary border border-primary/30",
                      status === "skipped" && "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30",
                      status === "unanswered" && "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded bg-primary" />
                  <span className="text-xs text-muted-foreground">Answered</span>
                  <span className="ml-auto text-xs font-medium">{answeredCount}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded bg-yellow-500" />
                  <span className="text-xs text-muted-foreground">Skipped</span>
                  <span className="ml-auto text-xs font-medium">{skippedCount}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded bg-muted border border-border" />
                  <span className="text-xs text-muted-foreground">Unanswered</span>
                  <span className="ml-auto text-xs font-medium">{totalQuestions - answeredCount - skippedCount}</span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Submit Test?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-xl font-bold text-primary">{answeredCount}</div>
                  <div className="text-xs text-muted-foreground">Answered</div>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <div className="text-xl font-bold text-yellow-500">{skippedCount}</div>
                  <div className="text-xs text-muted-foreground">Skipped</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xl font-bold">{totalQuestions - answeredCount - skippedCount}</div>
                  <div className="text-xs text-muted-foreground">Unanswered</div>
                </div>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmit()}>Submit Test</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}