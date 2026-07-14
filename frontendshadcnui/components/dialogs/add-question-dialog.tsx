"use client";

import { useState } from "react";
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
import { useCourses } from "@/hooks/use-courses";
import { useSubjects } from "@/hooks/use-subjects";
import { useTopics } from "@/hooks/use-topics";
import { capitalize } from "@/lib/utils";

const MAX_QUESTION_LENGTH = 1000;
const MAX_EXPLANATION_LENGTH = 2000;

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddQuestionDialog({ open, onOpenChange, onSuccess }: AddQuestionDialogProps) {
  const [type, setType] = useState<"mcq" | "descriptive">("mcq");
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [difficulty, setDifficulty] = useState("normal");
  const [topicId, setTopicId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { courses, isLoading: isLoadingCourses } = useCourses({ limit: 100 });
  const { subjects, isLoading: isLoadingSubjects } = useSubjects({ limit: 100 });
  const { topics, isLoading: isLoadingTopics } = useTopics({ limit: 100 });

  const selectedCourse = courses.find((c) => c.id === courseId);
  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const selectedTopic = topics.find((t) => t.id === topicId);

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
      setChoices(choices.filter((_, i) => i !== index));
      if (correctAnswer === choices[index]) {
        setCorrectAnswer("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // TODO: Call API to create question
      await new Promise((resolve) => setTimeout(resolve, 1000));
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create question");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setType("mcq");
    setQuestion("");
    setChoices(["", "", "", ""]);
    setCorrectAnswer("");
    setExplanation("");
    setVideoUrl("");
    setDifficulty("normal");
    setTopicId("");
    setSubjectId("");
    setCourseId("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
          <DialogDescription>
            Create a new question. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Course, Subject, Topic selectors */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Course *</Label>
                <Select value={courseId} onValueChange={(value) => {
                  if (value) {
                    setCourseId(value);
                    setSubjectId("");
                    setTopicId("");
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {selectedCourse ? capitalize(selectedCourse.name) : isLoadingCourses ? "Loading..." : "Select course"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {capitalize(course.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={subjectId} onValueChange={(value) => {
                  if (value) {
                    setSubjectId(value);
                    setTopicId("");
                  }
                }} disabled={!courseId}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {selectedSubject ? capitalize(selectedSubject.name) : !courseId ? "Select course first" : isLoadingSubjects ? "Loading..." : "Select subject"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {capitalize(subject.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Topic *</Label>
                <Select value={topicId} onValueChange={(value) => { if (value) setTopicId(value); }} disabled={!subjectId}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {selectedTopic ? capitalize(selectedTopic.name) : !subjectId ? "Select subject first" : isLoadingTopics ? "Loading..." : "Select topic"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {capitalize(topic.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Type and Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Type *</Label>
                <Select value={type} onValueChange={(value) => {
                  if (value) {
                    setType(value as "mcq" | "descriptive");
                    setCorrectAnswer("");
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{type === "mcq" ? "Multiple Choice" : "Descriptive"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
            </div>

            {/* Question */}
            <div className="space-y-2">
              <Label>Question *</Label>
              <textarea
                value={question}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_QUESTION_LENGTH) {
                    setQuestion(e.target.value);
                  }
                }}
                placeholder="Enter your question here"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                required
              />
              <p className="text-xs text-muted-foreground text-right">
                {question.length}/{MAX_QUESTION_LENGTH}
              </p>
            </div>

            {/* MCQ Choices */}
            {type === "mcq" && (
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
            {type === "descriptive" && (
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
            <Button
              type="submit"
              disabled={isLoading || !courseId || !subjectId || !topicId || !question || !correctAnswer}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}