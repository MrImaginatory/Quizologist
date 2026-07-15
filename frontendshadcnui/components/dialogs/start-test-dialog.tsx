"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, X, Play, ChevronDown } from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useAuth } from "@/contexts/auth-context";
import { testsApi, StartTestPayload, Subject, Topic, subjectsApi, topicsApi } from "@/lib/api";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Selection {
  courseId: string;
  subjectIds: string[];
  topicIds: string[];
}

interface StartTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTest: (testId: string) => void;
}

const DURATION_OPTIONS = [
  { value: 15, label: "15 min", min: 15, max: 30 },
  { value: 20, label: "20 min", min: 20, max: 40 },
  { value: 25, label: "25 min", min: 25, max: 50 },
  { value: 30, label: "30 min", min: 30, max: 60 },
  { value: 40, label: "40 min", min: 30, max: 80 },
  { value: 45, label: "45 min", min: 40, max: 120 },
];

function GroupedCheckboxList({
  items,
  selectedIds,
  onToggle,
  onToggleAll,
  getName,
  getId,
  isLoading,
}: {
  items: Record<string, { id: string; name: string }[]>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  getName: (item: { id: string; name: string }) => string;
  getId: (item: { id: string; name: string }) => string;
  isLoading?: boolean;
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["all"]));

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const allItems = Object.values(items).flat();
  const allIds = allItems.map(getId);
  const allSelected = allItems.length > 0 && allIds.every((id) => selectedIds.includes(id));

  return (
    <div className="border rounded-lg p-2 max-h-48 overflow-y-auto">
      <div className="space-y-1">
        {/* Select All */}
        <div className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-lg">
          <Checkbox
            checked={allSelected}
            onCheckedChange={() => onToggleAll(allIds)}
          />
          <span className="text-sm font-medium">Select All ({allItems.length})</span>
        </div>

        {/* Groups */}
        {Object.entries(items).map(([groupName, groupItems]) => {
          const groupAllSelected = groupItems.every((item) => selectedIds.includes(getId(item)));
          const isOpen = openGroups.has(groupName);

          return (
            <div key={groupName} className="border rounded-lg">
              <button
                type="button"
                onClick={() => toggleGroup(groupName)}
                className="w-full flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={groupAllSelected}
                    onCheckedChange={() => onToggleAll(groupItems.map(getId))}
                  />
                  <span className="text-sm font-medium">{capitalize(groupName)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({groupItems.length})
                  </span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )} />
              </button>

              {isOpen && (
                <div className="px-2 pb-2 space-y-1">
                  {groupItems.map((item) => (
                    <div key={getId(item)} className="flex items-center gap-2 pl-6 py-0.5">
                      <Checkbox
                        checked={selectedIds.includes(getId(item))}
                        onCheckedChange={() => onToggle(getId(item))}
                      />
                      <span className="text-xs">{getName(item)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StartTestDialog({ open, onOpenChange, onStartTest }: StartTestDialogProps) {
  const { token } = useAuth();
  const [duration, setDuration] = useState(30);
  const [questionLimit, setQuestionLimit] = useState(45);
  const [selections, setSelections] = useState<Selection[]>([
    { courseId: "", subjectIds: [], topicIds: [] },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedCourseIds, setSelectedCourseIds] = useState<Record<number, string>>({});
  const [selectedSubjectIdsMap, setSelectedSubjectIdsMap] = useState<Record<number, string[]>>({});

  const { enrollments } = useEnrollments();
  const { courses } = useCourses({ limit: 100 });

  // State for fetched subjects per selection
  const [subjectsMap, setSubjectsMap] = useState<Record<number, Subject[]>>({});
  const [loadingSubjectsMap, setLoadingSubjectsMap] = useState<Record<number, boolean>>({});

  // State for fetched topics per selection
  const [topicsMap, setTopicsMap] = useState<Record<number, Topic[]>>({});
  const [loadingTopicsMap, setLoadingTopicsMap] = useState<Record<number, boolean>>({});

  const durationConfig = DURATION_OPTIONS.find((d) => d.value === duration);

  const enrolledCourseIds = useMemo(() => {
    const ids = new Set<string>();
    enrollments.forEach((e) => {
      if (e.course?.id) ids.add(e.course.id);
    });
    return Array.from(ids);
  }, [enrollments]);

  const enrolledCourses = useMemo(() => {
    return courses.filter((c) => enrolledCourseIds.includes(c.id));
  }, [courses, enrolledCourseIds]);

  // Fetch subjects when course is selected
  const fetchSubjectsForCourse = useCallback(async (index: number, courseId: string) => {
    if (!courseId) return;
    setLoadingSubjectsMap((prev) => ({ ...prev, [index]: true }));
    try {
      const response = await subjectsApi.getByCourse(courseId, 1, 100, token || undefined);
      setSubjectsMap((prev) => ({ ...prev, [index]: response.data.subjects }));
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      setSubjectsMap((prev) => ({ ...prev, [index]: [] }));
    } finally {
      setLoadingSubjectsMap((prev) => ({ ...prev, [index]: false }));
    }
  }, [token]);

  // Fetch topics when subjects are selected
  const fetchTopicsForSubject = useCallback(async (index: number, subjectId: string) => {
    if (!subjectId) return;
    setLoadingTopicsMap((prev) => ({ ...prev, [index]: true }));
    try {
      const response = await topicsApi.getBySubject(subjectId, 1, 100, token || undefined);
      setTopicsMap((prev) => ({ ...prev, [index]: response.data.topics }));
    } catch (err) {
      console.error("Failed to fetch topics:", err);
      setTopicsMap((prev) => ({ ...prev, [index]: [] }));
    } finally {
      setLoadingTopicsMap((prev) => ({ ...prev, [index]: false }));
    }
  }, [token]);

  const groupSubjectsByCourse = (subjects: Subject[]) => {
    const grouped: Record<string, { id: string; name: string }[]> = {};
    subjects.forEach((s) => {
      const courseName = s.course?.name || "Unknown";
      if (!grouped[courseName]) grouped[courseName] = [];
      grouped[courseName].push({ id: s.id, name: s.name });
    });
    return grouped;
  };

  const groupTopicsBySubject = (topics: Topic[]) => {
    const grouped: Record<string, { id: string; name: string }[]> = {};
    topics.forEach((t) => {
      const subjectName = t.subject?.name || "Unknown";
      if (!grouped[subjectName]) grouped[subjectName] = [];
      grouped[subjectName].push({ id: t.id, name: t.name });
    });
    return grouped;
  };

  const toggleSubject = (index: number, subjectId: string) => {
    const updated = [...selections];
    const current = updated[index].subjectIds;
    if (current.includes(subjectId)) {
      updated[index].subjectIds = current.filter((id) => id !== subjectId);
    } else {
      updated[index].subjectIds = [...current, subjectId];
    }
    updated[index].topicIds = [];
    setSelections(updated);
    setSelectedSubjectIdsMap((prev) => ({ ...prev, [index]: updated[index].subjectIds }));
    // Fetch topics for the newly selected subject
    if (!current.includes(subjectId)) {
      fetchTopicsForSubject(index, subjectId);
    }
  };

  const toggleAllSubjects = (index: number, subjectIds: string[]) => {
    const updated = [...selections];
    const current = updated[index].subjectIds;
    const allSelected = subjectIds.every((id) => current.includes(id));
    if (allSelected) {
      updated[index].subjectIds = current.filter((id) => !subjectIds.includes(id));
    } else {
      updated[index].subjectIds = [...new Set([...current, ...subjectIds])];
    }
    updated[index].topicIds = [];
    setSelections(updated);
    setSelectedSubjectIdsMap((prev) => ({ ...prev, [index]: updated[index].subjectIds }));
  };

  const toggleTopic = (index: number, topicId: string) => {
    const updated = [...selections];
    const current = updated[index].topicIds;
    if (current.includes(topicId)) {
      updated[index].topicIds = current.filter((id) => id !== topicId);
    } else {
      updated[index].topicIds = [...current, topicId];
    }
    setSelections(updated);
  };

  const toggleAllTopics = (index: number, topicIds: string[]) => {
    const updated = [...selections];
    const current = updated[index].topicIds;
    const allSelected = topicIds.every((id) => current.includes(id));
    if (allSelected) {
      updated[index].topicIds = current.filter((id) => !topicIds.includes(id));
    } else {
      updated[index].topicIds = [...new Set([...current, ...topicIds])];
    }
    setSelections(updated);
  };

  const addSelection = () => {
    if (selections.length < 3) {
      setSelections([...selections, { courseId: "", subjectIds: [], topicIds: [] }]);
    }
  };

  const removeSelection = (index: number) => {
    if (selections.length > 1) {
      setSelections(selections.filter((_, i) => i !== index));
      setSelectedCourseIds((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      setSelectedSubjectIdsMap((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      setSubjectsMap((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      setTopicsMap((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const updateCourseSelection = (index: number, courseId: string) => {
    const updated = [...selections];
    updated[index] = { courseId, subjectIds: [], topicIds: [] };
    setSelections(updated);
    setSelectedCourseIds((prev) => ({ ...prev, [index]: courseId }));
    setSelectedSubjectIdsMap((prev) => ({ ...prev, [index]: [] }));
    setSubjectsMap((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setTopicsMap((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    // Fetch subjects for the selected course
    fetchSubjectsForCourse(index, courseId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const validSelections = selections
        .filter((s) => s.courseId)
        .map((s) => ({
          course_id: s.courseId,
          subject_id: s.subjectIds.length === 1 ? s.subjectIds[0] : undefined,
          topic_id: s.topicIds.length === 1 ? s.topicIds[0] : undefined,
        }));

      if (validSelections.length === 0) {
        setError("Please select at least one course");
        setIsLoading(false);
        return;
      }

      const payload: StartTestPayload = {
        duration_minutes: duration,
        question_limit: questionLimit,
        selections: validSelections,
      };

      const response = await testsApi.start(payload, token || undefined);
      toast.success("Test started successfully!");
      onStartTest(response.data.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start test");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Start New Test
          </DialogTitle>
          <DialogDescription>
            Configure your test settings and select topics to test on.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            {/* Duration & Question Limit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration *</Label>
                <Select
                  value={duration.toString()}
                  onValueChange={(value) => {
                    if (value) {
                      const newDuration = parseInt(value);
                      setDuration(newDuration);
                      const config = DURATION_OPTIONS.find((d) => d.value === newDuration);
                      if (config && questionLimit > config.max) {
                        setQuestionLimit(config.max);
                      } else if (config && questionLimit < config.min) {
                        setQuestionLimit(config.min);
                      }
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Questions *</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={questionLimit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (val === "") {
                      setQuestionLimit(0);
                    } else {
                      setQuestionLimit(parseInt(val) || 0);
                    }
                  }}
                  onBlur={() => {
                    const min = durationConfig?.min || 15;
                    const max = durationConfig?.max || 120;
                    if (questionLimit < min) setQuestionLimit(min);
                    if (questionLimit > max) setQuestionLimit(max);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Min: {durationConfig?.min} | Max: {durationConfig?.max}
                </p>
              </div>
            </div>

            {/* Selections */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Test Selections *</Label>
                {selections.length < 3 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addSelection}
                    className="h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>

              {selections.map((selection, index) => {
                const subjects = subjectsMap[index] || [];
                const topics = topicsMap[index] || [];
                const loadingSubjects = loadingSubjectsMap[index] || false;
                const loadingTopics = loadingTopicsMap[index] || false;

                const groupedSubjects = groupSubjectsByCourse(subjects);
                const groupedTopics = groupTopicsBySubject(topics);

                const selectedSubjectCount = selection.subjectIds.length;
                const selectedTopicCount = selection.topicIds.length;

                return (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Selection {index + 1}
                      </span>
                      {selections.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeSelection(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Course Selection */}
                    <div className="space-y-1">
                      <Label className="text-xs">Course *</Label>
                      <Select
                        value={selection.courseId}
                        onValueChange={(value) => { if (value) updateCourseSelection(index, value); }}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue>
                            {selection.courseId
                              ? capitalize(courses.find((c) => c.id === selection.courseId)?.name || "")
                              : "Select Course"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {enrolledCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {capitalize(course.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subjects Selection */}
                    {selection.courseId && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Subjects</Label>
                          {selectedSubjectCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {selectedSubjectCount} selected
                            </span>
                          )}
                        </div>
                        <GroupedCheckboxList
                          items={groupedSubjects}
                          selectedIds={selection.subjectIds}
                          onToggle={(id) => toggleSubject(index, id)}
                          onToggleAll={(ids) => toggleAllSubjects(index, ids)}
                          getName={(item) => item.name}
                          getId={(item) => item.id}
                          isLoading={loadingSubjects}
                        />
                      </div>
                    )}

                    {/* Topics Selection */}
                    {selection.subjectIds.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Topics</Label>
                          {selectedTopicCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {selectedTopicCount} selected
                            </span>
                          )}
                        </div>
                        <GroupedCheckboxList
                          items={groupedTopics}
                          selectedIds={selection.topicIds}
                          onToggle={(id) => toggleTopic(index, id)}
                          onToggleAll={(ids) => toggleAllTopics(index, ids)}
                          getName={(item) => item.name}
                          getId={(item) => item.id}
                          isLoading={loadingTopics}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Start Test
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
