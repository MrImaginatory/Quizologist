"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  Send,
  SkipForward,
  Eraser,
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

interface TestScreenProps {
  testSession: TestSession;
  onSubmit: (answers: Record<number, string>) => void;
  onTimeUp: () => void;
}

export function TestScreen({ testSession, onSubmit, onTimeUp }: TestScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const question = testSession.questions[currentQuestion];
  const totalQuestions = testSession.questions.length;
  const answeredCount = Object.keys(answers).length;
  const skippedCount = skipped.size;

  // Calculate time left
  useEffect(() => {
    const endTime = new Date(testSession.ends_at).getTime();
    const now = Date.now();
    setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [testSession.ends_at, onTimeUp]);

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

  const handleSubmit = () => {
    onSubmit(answers);
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
      case "beginner": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "normal": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "mid": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "expert": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <div className="shrink-0 border-b px-4 py-2 bg-background z-10">
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

            {/* Submit */}
            <Button onClick={() => setShowConfirmSubmit(true)} size="sm" className="gap-1">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Submit</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile: Question navigation on top */}
        <div className="lg:hidden shrink-0 border-b bg-background p-2">
          <ScrollArea className="w-full">
            <div className="flex gap-1.5 pb-2">
              {testSession.questions.map((_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={cn(
                      "w-9 h-9 rounded-lg text-xs font-medium shrink-0 transition-all",
                      status === "current" && "ring-2 ring-primary ring-offset-1",
                      status === "answered" && "bg-primary text-primary-foreground",
                      status === "skipped" && "bg-yellow-500 text-white",
                      status === "unanswered" && "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Desktop: Question navigation on left */}
        <div className="hidden lg:flex w-72 shrink-0 border-r bg-background flex-col">
          <div className="p-3 border-b">
            <h3 className="font-medium text-sm">Questions</h3>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="grid grid-cols-5 gap-2">
              {testSession.questions.map((_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={cn(
                      "w-full aspect-square rounded-lg text-sm font-medium transition-all",
                      status === "current" && "ring-2 ring-primary ring-offset-1",
                      status === "answered" && "bg-primary text-primary-foreground",
                      status === "skipped" && "bg-yellow-500 text-white",
                      status === "unanswered" && "bg-muted hover:bg-muted/80 text-foreground"
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
                <span className="w-3 h-3 rounded bg-primary" />
                <span className="text-muted-foreground">Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-yellow-500" />
                <span className="text-muted-foreground">Skipped ({skippedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-muted" />
                <span className="text-muted-foreground">Unanswered ({totalQuestions - answeredCount - skippedCount})</span>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Question Content */}
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

          {/* Bottom Navigation Bar */}
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
              {(skippedCount > 0 || totalQuestions - answeredCount - skippedCount > 0) && (
                <p className="text-sm text-yellow-500 text-center">
                  You have {skippedCount + (totalQuestions - answeredCount - skippedCount)} unanswered questions.
                </p>
              )}
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Submit Test
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}