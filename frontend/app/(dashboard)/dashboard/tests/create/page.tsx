"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { predefinedTestsApi, CreatePredefinedTestPayload, Course, Subject, Topic } from "@/lib/api";
import { useCourses } from "@/hooks/use-courses";
import { useSubjects } from "@/hooks/use-subjects";
import { useTopics } from "@/hooks/use-topics";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Save, ArrowRight, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { capitalize } from "@/lib/utils";
import { Stepper } from "@/components/ui/stepper";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { Checkbox } from "@/components/ui/checkbox";

const DIFFICULTY_OPTIONS = ["beginner", "normal", "mid", "hard", "expert", "mixed"];

const STORAGE_KEY = "create-predefined-test-form";

interface FormState {
  currentStep: number;
  title: string;
  description: string;
  duration: number;
  questionLimit: number;
  difficulty: string;
  difficultyRatio: { beginner?: number; normal?: number; mid?: number; hard?: number; expert?: number };
  maxAttempts: number;
  isScheduled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
  useFixedQuestions: boolean;
  selectedCourseIds: string[];
  selectedSubjectIds: string[];
  selectedTopicIds: string[];
  useSpecificStudents: boolean;
  selectedStudentIds: string[];
}

const STEPS = [
  { title: "Basic Info", description: "Name & description" },
  { title: "Configuration", description: "Duration & questions" },
  { title: "Scope", description: "Course & topics" },
  { title: "Schedule", description: "Time window" },
  { title: "Questions", description: "Selection type" },
];

const defaultFormState: FormState = {
  currentStep: 0,
  title: "",
  description: "",
  duration: 30,
  questionLimit: 30,
  difficulty: "normal",
  difficultyRatio: {},
  maxAttempts: 1,
  isScheduled: false,
  startTime: "",
  endTime: "",
  timezone: "",
  useFixedQuestions: false,
  selectedCourseIds: [],
  selectedSubjectIds: [],
  selectedTopicIds: [],
  useSpecificStudents: false,
  selectedStudentIds: [],
};

export default function CreatePredefinedTestPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const { courses, isLoading: isLoadingCourses } = useCourses({ limit: 100 });
  const { subjects, isLoading: isLoadingSubjects } = useSubjects({ limit: 100 });
  const { topics, isLoading: isLoadingTopics } = useTopics({ limit: 100 });

  const [formState, setFormState] = useState<FormState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return defaultFormState;
        }
      }
    }
    return defaultFormState;
  });

  const {
    currentStep, title, description, duration, questionLimit,
    difficulty, difficultyRatio, maxAttempts, isScheduled,
    startTime, endTime, timezone, useFixedQuestions,
    selectedCourseIds, selectedSubjectIds, selectedTopicIds,
    useSpecificStudents, selectedStudentIds
  } = formState;

  const updateForm = useCallback((updates: Partial<FormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
  }, [formState]);

  const isFormEmpty = !title && !description && duration === 30 && questionLimit === 30
    && difficulty === "normal" && Object.keys(difficultyRatio).length === 0
    && maxAttempts === 1 && !isScheduled && !startTime && !endTime
    && !timezone && !useFixedQuestions
    && (!selectedCourseIds || selectedCourseIds.length === 0)
    && (!selectedSubjectIds || selectedSubjectIds.length === 0)
    && (!selectedTopicIds || selectedTopicIds.length === 0);

  const filteredSubjects = useMemo(() => {
    if (!selectedCourseIds || selectedCourseIds.length === 0) return subjects;
    return subjects.filter((s) => selectedCourseIds.includes(s.course_id));
  }, [subjects, selectedCourseIds]);

  const filteredTopics = useMemo(() => {
    if (!selectedSubjectIds || selectedSubjectIds.length === 0) return topics;
    return topics.filter((t) => selectedSubjectIds?.includes(t.subject_id));
  }, [topics, selectedSubjectIds]);

  const toggleCourse = (courseId: string) => {
    const newIds = selectedCourseIds.includes(courseId)
      ? selectedCourseIds.filter((id) => id !== courseId)
      : [...selectedCourseIds, courseId];
    updateForm({
      selectedCourseIds: newIds,
      selectedSubjectIds: selectedSubjectIds.filter((sId) => {
        const subject = subjects.find((s) => s.id === sId);
        return subject ? newIds.includes(subject.course_id) : false;
      }),
      selectedTopicIds: selectedTopicIds.filter((tId) => {
        const topic = topics.find((t) => t.id === tId);
        return topic ? selectedSubjectIds?.includes(topic.subject_id) : false;
      }),
    });
  };

  const toggleSubject = (subjectId: string) => {
    const newIds = selectedSubjectIds?.includes(subjectId)
      ? selectedSubjectIds.filter((id) => id !== subjectId)
      : [...(selectedSubjectIds || []), subjectId];
    updateForm({
      selectedSubjectIds: newIds,
      selectedTopicIds: selectedTopicIds.filter((tId) => {
        const topic = topics.find((t) => t.id === tId);
        return topic ? newIds.includes(topic.subject_id) : false;
      }),
    });
  };

  const toggleTopic = (topicId: string) => {
    const newIds = selectedTopicIds?.includes(topicId)
      ? selectedTopicIds.filter((id) => id !== topicId)
      : [...(selectedTopicIds || []), topicId];
    updateForm({ selectedTopicIds: newIds });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return title.trim().length > 0;
      case 1:
        return duration > 0 && questionLimit > 0;
      case 2:
        return selectedCourseIds && selectedCourseIds.length > 0;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getMinEndDate = (): Date | undefined => {
    if (!startTime) return undefined;
    const start = new Date(startTime);
    const minEnd = new Date(start);
    minEnd.setMinutes(minEnd.getMinutes() + duration + 1);
    return minEnd;
  };

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length - 1) {
      updateForm({ currentStep: currentStep + 1 });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      updateForm({ currentStep: currentStep - 1 });
    }
  };

  const handleClearConfirm = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormState(defaultFormState);
    setShowClearDialog(false);
    toast.success("Form cleared");
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const hasRatio = Object.values(difficultyRatio).some((v) => v && v > 0);

      const payload: CreatePredefinedTestPayload = {
        title,
        description: description || undefined,
        duration_minutes: duration,
        question_limit: questionLimit,
        difficulty,
        difficulty_ratio: hasRatio ? difficultyRatio : undefined,
        max_attempts: maxAttempts,
        is_scheduled: isScheduled,
        start_time: isScheduled && startTime ? new Date(startTime).toISOString() : undefined,
        end_time: isScheduled && endTime ? new Date(endTime).toISOString() : undefined,
        timezone: timezone || "UTC",
        use_fixed_questions: useFixedQuestions,
        course_ids: selectedCourseIds || [],
        subject_ids: selectedSubjectIds && selectedSubjectIds.length > 0 ? selectedSubjectIds : undefined,
        topic_ids: selectedTopicIds && selectedTopicIds.length > 0 ? selectedTopicIds : undefined,
        student_ids: useSpecificStudents && selectedStudentIds.length > 0 ? selectedStudentIds : undefined,
      };

      const response = await predefinedTestsApi.create(payload, token || undefined);
      localStorage.removeItem(STORAGE_KEY);
      setFormState(defaultFormState);
      toast.success("Predefined test created successfully!");
      router.push(`/dashboard/tests/${response.data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create test");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Create Predefined Test</h1>
          <p className="text-muted-foreground">Configure a new test for students</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowClearDialog(true)}
          disabled={isFormEmpty}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

      <Stepper steps={STEPS} currentStep={currentStep} />

      <div className="mt-6">
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Set the test name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => updateForm({ title: e.target.value })}
                  placeholder="e.g., Midterm Exam - Direct Tax Laws"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  placeholder="Optional description for the test"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Set duration, questions, and difficulty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes) *</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => updateForm({ duration: parseInt(e.target.value) || 0 })}
                    min={1}
                    max={300}
                    placeholder="e.g., 30"
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Question Limit *</Label>
                  <Input
                    type="number"
                    value={questionLimit}
                    onChange={(e) => updateForm({ questionLimit: parseInt(e.target.value) || 0 })}
                    min={1}
                    max={200}
                    placeholder="e.g., 30"
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty *</Label>
                  <Select value={difficulty} onValueChange={(v) => { if (v) updateForm({ difficulty: v }); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {capitalize(difficulty)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d}>{capitalize(d)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Attempts</Label>
                  <Input
                    type="number"
                    value={maxAttempts}
                    onChange={(e) => updateForm({ maxAttempts: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={10}
                    placeholder="e.g., 1"
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Difficulty Ratio - only show when difficulty is "mixed" */}
              {difficulty === "mixed" && (
                <div className="space-y-2">
                  <Label>Difficulty Ratio (%)</Label>
                  <p className="text-xs text-muted-foreground">
                    Set the percentage of questions for each difficulty level. Must sum to 100%.
                  </p>
                  <div className="grid grid-cols-5 gap-3">
                    {(["beginner", "normal", "mid", "hard", "expert"] as const).map((d) => {
                      const total = Object.values(difficultyRatio).reduce((a, b) => a + (b || 0), 0);
                      const currentVal = difficultyRatio[d] || 0;
                      const remaining = 100 - (total - currentVal);
                      return (
                        <div key={d} className="space-y-1">
                          <Label className="text-xs capitalize">{d}</Label>
                          <Input
                            type="number"
                            value={currentVal || ""}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              updateForm({ difficultyRatio: { ...difficultyRatio, [d]: Math.min(val, remaining) } });
                            }}
                            min={0}
                            max={100}
                            placeholder="0"
                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <p className="text-[10px] text-muted-foreground">max {remaining}%</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Total:
                    </p>
                    <p className={`text-sm font-medium ${
                      Object.values(difficultyRatio).reduce((a, b) => a + (b || 0), 0) === 100
                        ? "text-green-500"
                        : Object.values(difficultyRatio).reduce((a, b) => a + (b || 0), 0) > 100
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}>
                      {Object.values(difficultyRatio).reduce((a, b) => a + (b || 0), 0)}%
                    </p>
                  </div>
                  {Object.values(difficultyRatio).reduce((a, b) => a + (b || 0), 0) > 100 && (
                    <p className="text-xs text-destructive">
                      Total cannot exceed 100%
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Course & Topic Scope</CardTitle>
              <CardDescription>Select courses, subjects, and topics for the test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingCourses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Courses *</Label>
                        <p className="text-xs text-muted-foreground">Select at least one course</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all-courses"
                          checked={selectedCourseIds?.length === courses.length && courses.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateForm({ selectedCourseIds: courses.map((c) => c.id) });
                            } else {
                              updateForm({ selectedCourseIds: [], selectedSubjectIds: [], selectedTopicIds: [] });
                            }
                          }}
                        />
                        <label htmlFor="select-all-courses" className="text-sm text-muted-foreground cursor-pointer">
                          Select All
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                      {courses.map((course) => (
                        <div key={course.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`course-${course.id}`}
                            checked={selectedCourseIds?.includes(course.id) || false}
                            onCheckedChange={() => toggleCourse(course.id)}
                          />
                          <label
                            htmlFor={`course-${course.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {capitalize(course.name)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {filteredSubjects.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Subjects (Optional)</Label>
                          <p className="text-xs text-muted-foreground">Filter by specific subjects</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="select-all-subjects"
                            checked={selectedSubjectIds?.length === filteredSubjects.length && filteredSubjects.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateForm({ selectedSubjectIds: filteredSubjects.map((s) => s.id) });
                              } else {
                                updateForm({ selectedSubjectIds: [], selectedTopicIds: [] });
                              }
                            }}
                          />
                          <label htmlFor="select-all-subjects" className="text-sm text-muted-foreground cursor-pointer">
                            Select All
                          </label>
                          {(selectedSubjectIds?.length || 0) > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateForm({ selectedSubjectIds: [], selectedTopicIds: [] })}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto border rounded-lg p-3">
                        {filteredSubjects.map((subject) => (
                          <div key={subject.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`subject-${subject.id}`}
                              checked={selectedSubjectIds?.includes(subject.id) || false}
                              onCheckedChange={() => toggleSubject(subject.id)}
                            />
                            <label
                              htmlFor={`subject-${subject.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {capitalize(subject.name)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredTopics.length > 0 && selectedSubjectIds.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Topics (Optional)</Label>
                          <p className="text-xs text-muted-foreground">Filter by specific topics</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="select-all-topics"
                            checked={selectedTopicIds?.length === filteredTopics.length && filteredTopics.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateForm({ selectedTopicIds: filteredTopics.map((t) => t.id) });
                              } else {
                                updateForm({ selectedTopicIds: [] });
                              }
                            }}
                          />
                          <label htmlFor="select-all-topics" className="text-sm text-muted-foreground cursor-pointer">
                            Select All
                          </label>
                          {(selectedTopicIds?.length || 0) > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateForm({ selectedTopicIds: [] })}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto border rounded-lg p-3">
                        {filteredTopics.map((topic) => (
                          <div key={topic.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`topic-${topic.id}`}
                              checked={selectedTopicIds?.includes(topic.id) || false}
                              onCheckedChange={() => toggleTopic(topic.id)}
                            />
                            <label
                              htmlFor={`topic-${topic.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {capitalize(topic.name)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Selected:</span>
                    <Badge variant="outline">{selectedCourseIds.length} courses</Badge>
                    {selectedSubjectIds.length > 0 && (
                      <Badge variant="outline">{selectedSubjectIds.length} subjects</Badge>
                    )}
                    {selectedTopicIds.length > 0 && (
                      <Badge variant="outline">{selectedTopicIds.length} topics</Badge>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Scheduling</CardTitle>
              <CardDescription>Optional: Set a time window for the test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Scheduled Test</Label>
                  <p className="text-sm text-muted-foreground">Limit when students can take this test</p>
                </div>
                <Button
                  type="button"
                  variant={isScheduled ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateForm({ isScheduled: !isScheduled })}
                >
                  {isScheduled ? "On" : "Off"}
                </Button>
              </div>
              {isScheduled && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time *</Label>
                    <DateTimePicker
                      value={startTime}
                      onChange={(v) => updateForm({ startTime: v })}
                      disabled={!isScheduled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time *</Label>
                    <DateTimePicker
                      value={endTime}
                      onChange={(v) => updateForm({ endTime: v })}
                      disabled={!isScheduled || !startTime}
                      minDate={getMinEndDate()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <TimezoneSelect
                      value={timezone}
                      onChange={(v) => updateForm({ timezone: v })}
                      placeholder="Select timezone"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Question Selection</CardTitle>
              <CardDescription>Choose between fixed or dynamic questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Fixed Questions</Label>
                  <p className="text-sm text-muted-foreground">Use the same questions for all students</p>
                </div>
                <Button
                  type="button"
                  variant={useFixedQuestions ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateForm({ useFixedQuestions: !useFixedQuestions })}
                >
                  {useFixedQuestions ? "On" : "Off"}
                </Button>
              </div>
              {useFixedQuestions && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Question selection will be available after creating the test.
                  </p>
                </div>
              )}

              {/* Specific Students Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Specific Students</Label>
                  <p className="text-sm text-muted-foreground">Only allow specific students to take this test</p>
                </div>
                <Button
                  type="button"
                  variant={useSpecificStudents ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateForm({ useSpecificStudents: !useSpecificStudents, selectedStudentIds: [] })}
                >
                  {useSpecificStudents ? "On" : "Off"}
                </Button>
              </div>
              {useSpecificStudents && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Student selection will be available after creating the test.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can assign specific students from the test details page.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between gap-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 0 ? () => router.back() : handleBack}
        >
          {currentStep === 0 ? "Cancel" : "Back"}
        </Button>
        {currentStep < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !canProceed()}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Create Test
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        title="Clear Form"
        description="Are you sure you want to clear all form data? This action cannot be undone."
        confirmText="Clear"
        onConfirm={handleClearConfirm}
      />
    </div>
  );
}
