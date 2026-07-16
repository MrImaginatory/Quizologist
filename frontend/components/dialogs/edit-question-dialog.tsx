"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";
import { questionsApi, Question } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";

const MAX_EXPLANATION_LENGTH = 2000;

interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
  onSuccess?: () => void;
}

export function EditQuestionDialog({
  open,
  onOpenChange,
  question,
  onSuccess,
}: EditQuestionDialogProps) {
  const { token } = useAuth();
  const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [difficulty, setDifficulty] = useState("normal");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (question && open) {
      setChoices(question.choices && question.choices.length > 0 ? [...question.choices] : ["", "", "", ""]);
      setCorrectAnswer(question.correctAnswer || "");
      setExplanation(question.explanation || "");
      setVideoUrl(question.videoUrl || "");
      setDifficulty(question.difficulty || "normal");
      setError("");
    }
  }, [question, open]);

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const addChoice = () => {
    if (choices.length < 5) {
      setChoices([...choices, ""]);
    }
  };

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      const removedChoice = choices[index];
      setChoices(choices.filter((_, i) => i !== index));
      if (correctAnswer === removedChoice) {
        setCorrectAnswer("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;

    setIsLoading(true);
    setError("");

    try {
      const filteredChoices = choices.filter((c) => c.trim() !== "");

      await questionsApi.update(
        question.id,
        {
          type: question.type,
          question: question.question,
          choices: question.type === "mcq" ? filteredChoices : null,
          correctAnswer,
          explanation,
          videoUrl,
          difficulty,
          topic_id: question.topic_id,
          subject_id: question.subject_id,
          course_id: question.course_id,
          questionAddedBy: question.questionAddedBy,
        },
        token || undefined
      );

      toast.success("Question updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update question");
    } finally {
      setIsLoading(false);
    }
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update the question details below. The question text cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Question (Read-only) */}
            <div className="space-y-2">
              <Label>Question</Label>
              <div className="p-3 bg-muted rounded-md text-sm">
                {question.question}
              </div>
              <p className="text-xs text-muted-foreground">Question text cannot be edited</p>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(value) => { if (value) setDifficulty(value); }}>
                <SelectTrigger className="w-full">
                  <SelectValue>{capitalize(difficulty)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* MCQ Choices */}
            {question.type === "mcq" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Choices *</Label>
                  {choices.length < 5 && (
                    <Button type="button" variant="ghost" size="sm" onClick={addChoice}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Choice
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {choices.map((choice, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={correctAnswer === choice && choice !== ""}
                        onChange={() => setCorrectAnswer(choice)}
                        disabled={!choice}
                        className="h-4 w-4"
                      />
                      <Input
                        value={choice}
                        onChange={(e) => handleChoiceChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      {choices.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => removeChoice(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select the radio button next to the correct answer
                </p>
              </div>
            )}

            {/* Correct Answer for Descriptive */}
            {question.type === "descriptive" && (
              <div className="space-y-2">
                <Label>Correct Answer *</Label>
                <textarea
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="Enter the correct answer"
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  required
                />
              </div>
            )}

            {/* Explanation */}
            <div className="space-y-2">
              <Label>Explanation</Label>
              <textarea
                value={explanation}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_EXPLANATION_LENGTH) {
                    setExplanation(e.target.value);
                  }
                }}
                placeholder="Optional explanation for the answer"
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {explanation.length}/{MAX_EXPLANATION_LENGTH}
              </p>
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !correctAnswer}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
