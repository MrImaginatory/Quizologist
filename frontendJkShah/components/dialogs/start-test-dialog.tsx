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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Loader2, Plus, X, Play, ChevronDown, Search } from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useAuth } from "@/contexts/auth-context";
import { testsApi, StartTestPayload, Subject, Topic, enrollmentsApi } from "@/lib/api";
import { timeBasedTestsApi } from "@/lib/api/timeBased";
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
  onStartTest: (testId: string, testType?: "standard" | "time_based") => void;
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
  searchPlaceholder,
}: {
  items: Record<string, { id: string; name: string }[]>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  getName: (item: { id: string; name: string }) => string;
  getId: (item: { id: string; name: string }) => string;
  isLoading?: boolean;
  searchPlaceholder?: string;
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["all"]));
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const lowerQuery = searchQuery.toLowerCase();
    const result: Record<string, { id: string; name: string }[]> = {};
    for (const [groupName, groupItems] of Object.entries(items)) {
      const filtered = groupItems.filter(
        (item) =>
          getName(item).toLowerCase().includes(lowerQuery) ||
          groupName.toLowerCase().includes(lowerQuery)
      );
      if (filtered.length > 0) {
        result[groupName] = filtered;
      }
    }
    return result;
  }, [items, searchQuery, getName]);

  const allItems = Object.values(filteredItems).flat();
  const allIds = allItems.map(getId);
  const allSelected = allItems.length > 0 && allIds.every((id) => selectedIds.includes(id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }



  return (
    <div className="border rounded-lg max-h-56 flex flex-col">
      <div className="p-2 border-b bg-muted/30">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder || "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs focus-visible:ring-primary"
          />
        </div>
      </div>
      <div className="p-2 overflow-y-auto space-y-1">
        {/* Select All */}
        <div className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-lg">
          <Checkbox
            checked={allSelected}
            onCheckedChange={() => onToggleAll(allIds)}
          />
          <span className="text-sm font-medium">Select All ({allItems.length})</span>
        </div>

        {/* Groups */}
        {Object.entries(filteredItems).map(([groupName, groupItems]) => {
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
  const [testMode, setTestMode] = useState<"standard" | "time_based">("standard");
  const [duration, setDuration] = useState<number | "">(30);
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
  const [subjectsMap, setSubjectsMap] = useState<Record<number, { id: string; name: string }[]>>({});
  const [loadingSubjectsMap, setLoadingSubjectsMap] = useState<Record<number, boolean>>({});

  // State for fetched topics per selection
  const [topicsMap, setTopicsMap] = useState<Record<number, { id: string; name: string }[]>>({});
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

  // Fetch enrolled subjects when course is selected
  const fetchSubjectsForCourse = useCallback(async (index: number, courseId: string) => {
    if (!courseId) return;
    setLoadingSubjectsMap((prev) => ({ ...prev, [index]: true }));
    try {
      const response = await enrollmentsApi.getEnrolledSubjects(courseId, token || undefined);
      setSubjectsMap((prev) => ({ ...prev, [index]: response.data.subjects }));
    } catch (err) {
      console.error("Failed to fetch enrolled subjects:", err);
      setSubjectsMap((prev) => ({ ...prev, [index]: [] }));
    } finally {
      setLoadingSubjectsMap((prev) => ({ ...prev, [index]: false }));
    }
  }, [token]);

  // Fetch enrolled topics when subjects are selected
  const fetchTopicsForSubject = useCallback(async (index: number, subjectId: string) => {
    if (!subjectId) return;
    const courseId = selections[index]?.courseId;
    if (!courseId) return;
    setLoadingTopicsMap((prev) => ({ ...prev, [index]: true }));
    try {
      const response = await enrollmentsApi.getEnrolledTopics(courseId, subjectId, token || undefined);
      setTopicsMap((prev) => ({ ...prev, [index]: response.data.topics }));
    } catch (err) {
      console.error("Failed to fetch enrolled topics:", err);
      setTopicsMap((prev) => ({ ...prev, [index]: [] }));
    } finally {
      setLoadingTopicsMap((prev) => ({ ...prev, [index]: false }));
    }
  }, [token, selections]);

  const groupSubjectsByCourse = (subjects: { id: string; name: string }[], courseName: string) => {
    const grouped: Record<string, { id: string; name: string }[]> = {};
    subjects.forEach((s) => {
      const name = courseName || "Enrolled";
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push({ id: s.id, name: capitalize(s.name) });
    });
    return grouped;
  };

  const groupTopicsBySubject = (topics: { id: string; name: string }[], subjectNames: string[]) => {
    const grouped: Record<string, { id: string; name: string }[]> = {};
    const groupName = subjectNames.length > 1 ? "All Selected Subjects" : (subjectNames[0] || "Enrolled");
    topics.forEach((t) => {
      if (!grouped[groupName]) grouped[groupName] = [];
      grouped[groupName].push({ id: t.id, name: capitalize(t.name) });
    });
    return grouped;
  };

  const toggleSubject = async (index: number, subjectId: string) => {
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

    // Fetch topics for all selected subjects
    if (updated[index].subjectIds.length > 0) {
      setLoadingTopicsMap((prev) => ({ ...prev, [index]: true }));
      try {
        const allTopics: { id: string; name: string }[] = [];
        const courseId = updated[index].courseId;
        for (const sid of updated[index].subjectIds) {
          const response = await enrollmentsApi.getEnrolledTopics(courseId, sid, token || undefined);
          allTopics.push(...response.data.topics);
        }
        const uniqueTopics = allTopics.filter((topic, i, self) =>
          i === self.findIndex((t) => t.id === topic.id)
        );
        setTopicsMap((prev) => ({ ...prev, [index]: uniqueTopics }));
      } catch (err) {
        console.error("Failed to fetch topics:", err);
        setTopicsMap((prev) => ({ ...prev, [index]: [] }));
      } finally {
        setLoadingTopicsMap((prev) => ({ ...prev, [index]: false }));
      }
    } else {
      setTopicsMap((prev) => ({ ...prev, [index]: [] }));
    }
  };

  const toggleAllSubjects = async (index: number, subjectIds: string[]) => {
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

    // Fetch topics for all selected subjects
    if (updated[index].subjectIds.length > 0) {
      setLoadingTopicsMap((prev) => ({ ...prev, [index]: true }));
      try {
        const allTopics: { id: string; name: string }[] = [];
        const courseId = updated[index].courseId;
        for (const subjectId of updated[index].subjectIds) {
          const response = await enrollmentsApi.getEnrolledTopics(courseId, subjectId, token || undefined);
          allTopics.push(...response.data.topics);
        }
        // Remove duplicates by id
        const uniqueTopics = allTopics.filter((topic, i, self) =>
          i === self.findIndex((t) => t.id === topic.id)
        );
        setTopicsMap((prev) => ({ ...prev, [index]: uniqueTopics }));
      } catch (err) {
        console.error("Failed to fetch topics:", err);
        setTopicsMap((prev) => ({ ...prev, [index]: [] }));
      } finally {
        setLoadingTopicsMap((prev) => ({ ...prev, [index]: false }));
      }
    } else {
      setTopicsMap((prev) => ({ ...prev, [index]: [] }));
    }
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

      if (testMode === "time_based") {
         const response = await timeBasedTestsApi.start(
           {
             duration_minutes: Number(duration),
             selections: validSelections as any,
           },
           token || undefined
         );
         toast.success("Time-Based Test started successfully!");
         onStartTest((response.data as any).session.id, "time_based");
      } else {
         const payload: StartTestPayload = {
           duration_minutes: Number(duration),
           question_limit: questionLimit,
           selections: validSelections,
           adaptive: true,
         };

         const response = await testsApi.start(payload, token || undefined);
         toast.success("Test started successfully!");
         onStartTest(response.data.id, "standard");
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start test");
    } finally {
      setIsLoading(false);
    }
  };

  const hasCourseSelected = selections.some(s => s.courseId !== "");
  const isValidDuration = duration !== "" && Number(duration) > 0;
  const isFormValid = hasCourseSelected && isValidDuration;

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

            {/* Test Mode Selection */}
            <div className="space-y-2">
              <Label>Test Type</Label>
              <div className="flex bg-muted p-1 rounded-full w-ful">
                <button
                  type="button"
                  onClick={() => setTestMode("standard")}
                  className={cn(
                    "flex-1 text-sm font-medium py-1.5 rounded-full transition-all",
                    testMode === "standard" ? "bg-background shadow-sm text-foreground ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setTestMode("time_based")}
                  className={cn(
                    "flex-1 text-sm font-medium py-1.5 rounded-full transition-all",
                    testMode === "time_based" ? "bg-background shadow-sm text-foreground ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Time-Based
                </button>
              </div>
            </div>

            {/* Duration & Question Limit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (Minutes) *</Label>
                {testMode === "standard" ? (
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
                    <SelectTrigger className="w-full h-9 focus:ring-primary focus-visible:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()} className="focus:bg-primary focus:text-primary-foreground">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => {
                       const val = e.target.value;
                       setDuration(val === "" ? "" : Math.max(1, parseInt(val) || 0));
                    }}
                    placeholder="e.g. 30"
                    min={1}
                    className="h-9 focus-visible:ring-primary"
                  />
                )}
              </div>

              {testMode === "standard" && (
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
                  className="focus-visible:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Min: {durationConfig?.min} | Max: {durationConfig?.max}
                </p>
              </div>
              )}
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

                const groupedSubjects = groupSubjectsByCourse(subjects, courses.find((c) => c.id === selection.courseId)?.name || "");
                const selectedSubjectNames = subjects
                  .filter((s) => selection.subjectIds.includes(s.id))
                  .map((s) => s.name);
                const groupedTopics = groupTopicsBySubject(topics, selectedSubjectNames);

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
                      <SearchableSelect
                        options={enrolledCourses.map((c) => ({
                          value: c.id,
                          label: capitalize(c.name),
                        }))}
                        value={selection.courseId}
                        onValueChange={(val) => {
                           if (val && val !== "all") {
                             updateCourseSelection(index, val);
                           }
                        }}
                        placeholder="Search course..."
                        emptyText="No courses found."
                      />
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
                          searchPlaceholder="Search subjects..."
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
                          searchPlaceholder="Search topics..."
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
            <Button type="submit" disabled={isLoading || !isFormValid}>
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
