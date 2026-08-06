"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { questionsApi, Question, coursesApi, subjectsApi, Course, Subject } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, X } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";

interface QuestionSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (questionIds: string[]) => void;
  selectedIds: string[];
  questionLimit: number;
  courseIds: string[];
  subjectIds?: string[];
  difficultyRatio?: Record<string, number> | null;
}

// Calculate required questions per difficulty level
function calculateRequiredPerDifficulty(
  questionLimit: number,
  difficultyRatio: Record<string, number> | null | undefined
): Record<string, number> {
  if (!difficultyRatio || Object.keys(difficultyRatio).length === 0) {
    // No ratio set - all questions can be any difficulty
    return {};
  }

  const required: Record<string, number> = {};
  const totalPercent = Object.values(difficultyRatio).reduce((sum, v) => sum + (v || 0), 0);

  if (totalPercent === 0) {
    return {};
  }

  for (const [level, percent] of Object.entries(difficultyRatio)) {
    if (!percent || percent <= 0) continue;

    const exact = (percent / 100) * questionLimit;
    // If floating point, allow one extra question
    const rounded = Math.round(exact);
    const needsExtra = exact > rounded;

    required[level] = needsExtra ? rounded + 1 : rounded;
  }

  return required;
}

export function QuestionSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  selectedIds,
  questionLimit,
  courseIds,
  subjectIds,
  difficultyRatio,
}: QuestionSelectorDialogProps) {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [courseNames, setCourseNames] = useState<Map<string, string>>(new Map());
  const [subjectNames, setSubjectNames] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("");
  const [filterCourse, setFilterCourse] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterTopic, setFilterTopic] = useState<string>("");
  const [localSelected, setLocalSelected] = useState<Set<string>>(new Set(selectedIds));

  useEffect(() => {
    if (open) {
      setLocalSelected(new Set(selectedIds));
      fetchQuestions();
      fetchNames();
    }
  }, [open, selectedIds]);

  // Re-fetch questions when course filter changes
  useEffect(() => {
    if (open) {
      fetchQuestions();
    }
  }, [filterCourse, open]);

  const fetchNames = async () => {
    try {
      const [coursesRes, subjectsRes] = await Promise.all([
        coursesApi.getAll(1, 1000, token || undefined),
        subjectsApi.getAll(1, 1000, token || undefined),
      ]);
      const cMap = new Map<string, string>();
      (coursesRes.data?.courses || []).forEach((c: Course) => cMap.set(c.id, c.name));
      setCourseNames(cMap);

      const sMap = new Map<string, string>();
      (subjectsRes.data?.subjects || []).forEach((s: Subject) => sMap.set(s.id, s.name));
      setSubjectNames(sMap);
    } catch (err) {
      console.error("Failed to fetch names:", err);
    }
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: 1, limit: 1000 };
      // Use filterCourse if set, otherwise use courseIds from props
      if (filterCourse && filterCourse !== "all") {
        params.course_id = filterCourse;
      } else if (courseIds.length === 1) {
        params.course_id = courseIds[0];
      }
      const response = await questionsApi.filter(params, token || undefined);
      setQuestions(response.data.questions || []);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get subjects filtered by selected course
  const filteredSubjectOptions = useMemo(() => {
    if (!filterCourse || filterCourse === "all") {
      // Show all unique subjects from questions
      return [...new Set(questions.map(q => q.subject_id))];
    }
    // Show only subjects that belong to the selected course
    return [...new Set(questions.filter(q => q.course_id === filterCourse).map(q => q.subject_id))];
  }, [questions, filterCourse]);

  // Reset subject filter when course changes
  useEffect(() => {
    if (filterCourse && filterCourse !== "all") {
      setFilterSubject("");
    }
  }, [filterCourse]);

  // Filter questions by search, difficulty, course, subject, topic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (search && !q.question.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (filterDifficulty && filterDifficulty !== "all" && q.difficulty !== filterDifficulty) {
        return false;
      }
      if (filterCourse && filterCourse !== "all" && q.course_id !== filterCourse) {
        return false;
      }
      if (filterSubject && filterSubject !== "all" && q.subject_id !== filterSubject) {
        return false;
      }
      if (filterTopic && filterTopic !== "all" && q.topic_id !== filterTopic) {
        return false;
      }
      // Original filters from props
      if (subjectIds && subjectIds.length > 0 && !subjectIds.includes(q.subject_id)) {
        return false;
      }
      if (courseIds.length > 0 && !courseIds.includes(q.course_id)) {
        return false;
      }
      return true;
    });
  }, [questions, search, filterDifficulty, filterCourse, filterSubject, filterTopic, subjectIds, courseIds]);

  // Count selected per difficulty
  const selectedByDifficulty = useMemo(() => {
    const counts: Record<string, number> = {};
    localSelected.forEach((id) => {
      const q = questions.find((q) => q.id === id);
      if (q) {
        counts[q.difficulty] = (counts[q.difficulty] || 0) + 1;
      }
    });
    return counts;
  }, [localSelected, questions]);

  // Calculate required per difficulty
  const requiredPerDifficulty = useMemo(() => {
    return calculateRequiredPerDifficulty(questionLimit, difficultyRatio);
  }, [questionLimit, difficultyRatio]);

  // Count available per difficulty
  const availableByDifficulty = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredQuestions.forEach((q) => {
      counts[q.difficulty] = (counts[q.difficulty] || 0) + 1;
    });
    return counts;
  }, [filteredQuestions]);

  // Check if we can select more of a specific difficulty
  const canSelectMore = (difficulty: string): boolean => {
    const required = requiredPerDifficulty[difficulty];
    if (!required) {
      // No ratio for this difficulty - allow if total limit not reached
      return localSelected.size < questionLimit;
    }
    const current = selectedByDifficulty[difficulty] || 0;
    return current < required;
  };

  const toggleQuestion = (question: Question) => {
    const newSelected = new Set(localSelected);

    if (newSelected.has(question.id)) {
      // Deselect
      newSelected.delete(question.id);
    } else {
      // Check if we can select more of this difficulty
      if (!canSelectMore(question.difficulty)) {
        const required = requiredPerDifficulty[question.difficulty];
        if (required) {
          toast.error(`Cannot select more than ${required} ${capitalize(question.difficulty)} questions`);
        } else {
          toast.error("Cannot select more questions");
        }
        return;
      }
      // Check total limit
      if (localSelected.size >= questionLimit) {
        toast.error(`Cannot select more than ${questionLimit} questions`);
        return;
      }
      newSelected.add(question.id);
    }
    setLocalSelected(newSelected);
  };

  const handleConfirm = () => {
    onSelect(Array.from(localSelected));
    onOpenChange(false);
  };

  const hasRatio = difficultyRatio && Object.keys(difficultyRatio).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] w-[95vw] h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Select Questions</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select up to {questionLimit} questions. {localSelected.size}/{questionLimit} selected.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Difficulty Ratio Counters - only show when ratio is set */}
          {hasRatio && (
            <div className="p-4 bg-card border border-border rounded-xl">
              <p className="text-sm font-medium mb-3 text-card-foreground">Questions per Difficulty Level:</p>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(requiredPerDifficulty).map(([level, required]) => {
                  const selected = selectedByDifficulty[level] || 0;
                  const isComplete = selected >= required;
                  const progress = required > 0 ? (selected / required) * 100 : 0;
                  return (
                    <div
                      key={level}
                      className={`relative p-3 rounded-xl text-center border transition-all ${
                        isComplete
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-border bg-secondary/50"
                      }`}
                    >
                      <p className="text-sm font-medium text-card-foreground">{capitalize(level)}</p>
                      <p className={`text-lg font-bold ${
                        isComplete ? "text-green-500" : "text-muted-foreground"
                      }`}>
                        {selected}/{required}
                      </p>
                      <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isComplete ? "bg-green-500" : "bg-primary"
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2">
            <Select value={filterDifficulty || "all"} onValueChange={(v) => setFilterDifficulty(v || "all")}>
              <SelectTrigger className="flex-1 min-w-[140px]">
                <SelectValue>
                  {filterDifficulty && filterDifficulty !== "all" ? capitalize(filterDifficulty) : "All Difficulties"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCourse || "all"} onValueChange={(v) => setFilterCourse(v || "all")}>
              <SelectTrigger className="flex-1 min-w-[140px]">
                <SelectValue>
                  {filterCourse && filterCourse !== "all"
                    ? capitalize(courseNames.get(filterCourse) || "Course")
                    : "All Courses"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courseIds.map((cId) => (
                  <SelectItem key={cId} value={cId}>
                    {capitalize(courseNames.get(cId) || "Course")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSubject || "all"} onValueChange={(v) => setFilterSubject(v || "all")}>
              <SelectTrigger className="flex-1 min-w-[140px]">
                <SelectValue>
                  {filterSubject && filterSubject !== "all"
                    ? capitalize(subjectNames.get(filterSubject) || "Subject")
                    : "All Subjects"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {filteredSubjectOptions.map((sId) => (
                  <SelectItem key={sId} value={sId}>
                    {capitalize(subjectNames.get(sId) || "Subject")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Available count and selected count */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {filteredQuestions.length} questions available
            </span>
            <div className="flex items-center gap-2">
              <Badge variant={localSelected.size >= questionLimit ? "destructive" : "default"}>
                {localSelected.size}/{questionLimit} selected
              </Badge>
              {localSelected.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocalSelected(new Set())}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No questions found
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isSelected = localSelected.has(q.id);
                const canSelect = canSelectMore(q.difficulty);
                const required = requiredPerDifficulty[q.difficulty];
                const current = selectedByDifficulty[q.difficulty] || 0;
                const atLimit = !canSelect && !isSelected;

                return (
                  <div
                    key={q.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : atLimit
                          ? "border-border opacity-50 cursor-not-allowed"
                          : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => !atLimit && toggleQuestion(q)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleQuestion(q)}
                      disabled={atLimit}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{q.question}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {capitalize(q.difficulty)}
                        </Badge>
                        {required && (
                          <span className="text-xs text-muted-foreground">
                            ({current}/{required} selected)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={localSelected.size === 0}>
            Select {localSelected.size} Questions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
