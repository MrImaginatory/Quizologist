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
import { CustomSelect } from "@/components/ui/custom-select";
import { Loader2, Plus, X } from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import { useSubjects } from "@/hooks/use-subjects";
import { useTopics } from "@/hooks/use-topics";
import { useTeachingCoursesAndSubjects } from "@/hooks/use-teaching-courses-and-subjects";
import { questionsApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";

const MAX_QUESTION_LENGTH = 1000;
const MAX_EXPLANATION_LENGTH = 2000;

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddQuestionDialog({ open, onOpenChange, onSuccess }: AddQuestionDialogProps) {
  const { token } = useAuth();
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

  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  const { courses: allCourses, isLoading: allCoursesLoading } = useCourses({ limit: 100 });
  const { subjects: allSubjects, isLoading: allSubjectsLoading } = useSubjects({ limit: 100, courseId: courseId || undefined });
  const { topics: allTopics, isLoading: allTopicsLoading } = useTopics({ limit: 100, subjectId: subjectId || undefined });
  const { courses: teacherCourses, subjects: teacherSubjects, isLoading: teachingLoading } = useTeachingCoursesAndSubjects();

  // For teachers, use only their assigned courses/subjects; for admins, use all
  const courses = isTeacher ? teacherCourses : allCourses;
  const subjects = isTeacher ? teacherSubjects : allSubjects;
  const isLoadingCourses = isTeacher ? teachingLoading : allCoursesLoading;
  const isLoadingSubjects = isTeacher ? teachingLoading : allSubjectsLoading;

  // Filter topics based on teacher's assigned subjects
  const topics = isTeacher
    ? allTopics.filter((t) => {
        const teacherSubjectIds = teacherSubjects.map((s) => s.id);
        return teacherSubjectIds.includes(t.subject_id);
      })
    : allTopics;
  const isLoadingTopics = isTeacher ? teachingLoading : allTopicsLoading;

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
      const filteredChoices = choices.filter((c) => c.trim() !== "");

      await questionsApi.create(
        {
          type: "mcq",
          question: question.trim(),
          choices: filteredChoices,
          correctAnswer: correctAnswer.trim(),
          explanation: explanation || undefined,
          videoUrl: videoUrl || undefined,
          difficulty,
          topic_id: topicId,
          subject_id: subjectId,
          course_id: courseId,
        },
        token || undefined
      );

      toast.success("Question created successfully!");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create question");
      toast.error(err instanceof Error ? err.message : "Failed to create question");
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
                <CustomSelect
                  id="course"
                  value={courseId}
                  onChange={(value) => {
                    setCourseId(value);
                    setSubjectId("");
                    setTopicId("");
                  }}
                  placeholder={isLoadingCourses ? "Loading..." : "Select course"}
                  options={courses.map((course) => ({
                    value: course.id,
                    label: capitalize(course.name),
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Subject *</Label>
                <CustomSelect
                  id="subject"
                  value={subjectId}
                  onChange={(value) => {
                    setSubjectId(value);
                    setTopicId("");
                  }}
                  disabled={!courseId}
                  placeholder={!courseId ? "Select course first" : isLoadingSubjects ? "Loading..." : "Select subject"}
                  options={subjects.map((subject) => ({
                    value: subject.id,
                    label: capitalize(subject.name),
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Topic *</Label>
                <CustomSelect
                  id="topic"
                  value={topicId}
                  onChange={(value) => setTopicId(value)}
                  disabled={!subjectId}
                  placeholder={!subjectId ? "Select subject first" : isLoadingTopics ? "Loading..." : "Select topic"}
                  options={topics.map((topic) => ({
                    value: topic.id,
                    label: capitalize(topic.name),
                  }))}
                />
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <CustomSelect
                id="difficulty"
                value={difficulty}
                onChange={(value) => setDifficulty(value)}
                options={[
                  { value: "beginner", label: "Beginner" },
                  { value: "normal", label: "Normal" },
                  { value: "mid", label: "Mid" },
                  { value: "hard", label: "Hard" },
                  { value: "expert", label: "Expert" },
                ]}
              />
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
                className="flex w-full rounded-[20px] border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                required
              />
              <p className="text-xs text-muted-foreground text-right">
                {question.length}/{MAX_QUESTION_LENGTH}
              </p>
            </div>

            {/* MCQ Choices */}
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
                className="flex w-full rounded-[20px] border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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