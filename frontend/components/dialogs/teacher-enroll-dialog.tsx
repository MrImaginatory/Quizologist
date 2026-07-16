"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import { useSubjects } from "@/hooks/use-subjects";
import { teachersApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";

interface TeacherEnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TeacherEnrollDialog({
  open,
  onOpenChange,
  onSuccess,
}: TeacherEnrollDialogProps) {
  const { token, user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { courses, isLoading: isLoadingCourses } = useCourses({ limit: 100 });
  const { subjects, isLoading: isLoadingSubjects } = useSubjects({ limit: 100 });

  const availableSubjects = useMemo(
    () => subjects.filter((s) => s.course_id === selectedCourseId),
    [subjects, selectedCourseId]
  );

  useEffect(() => {
    if (selectedCourseId) {
      setSelectedSubjectIds([]);
      setSelectAll(false);
    }
  }, [selectedCourseId]);

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjectIds((prev) => {
      const newSelection = prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId];

      setSelectAll(newSelection.length === availableSubjects.length);
      return newSelection;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!selectedCourseId) {
        setError("Please select a course");
        setIsLoading(false);
        return;
      }

      if (!user?.id) {
        setError("User not authenticated");
        setIsLoading(false);
        return;
      }

      const payload = {
        teacher_id: user.id,
        course_id: selectedCourseId,
        subject_ids: selectedSubjectIds.length > 0 ? selectedSubjectIds : undefined,
      };

      const response = await teachersApi.bulkAssignSubjects(payload, token || undefined);

      if (response.data.created > 0) {
        toast.success(`Enrolled in ${response.data.created} subject(s)`);
      }

      if (response.data.skipped > 0) {
        toast.info(`${response.data.skipped} subject(s) skipped (already enrolled)`);
      }

      setSelectedCourseId("");
      setSelectedSubjectIds([]);
      setSelectAll(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll");
    } finally {
      setIsLoading(false);
    }
  };

  const getCourseName = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.name || "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enroll to Teach</DialogTitle>
          <DialogDescription>
            Select a course and the subjects you want to teach. You can select
            multiple subjects or all subjects in the course.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="space-y-2">
              <Label className="text-sm font-medium">Course *</Label>
              <Select
                value={selectedCourseId}
                onValueChange={(value) => {
                  if (value) setSelectedCourseId(value);
                }}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue>
                    {selectedCourseId
                      ? capitalize(getCourseName(selectedCourseId))
                      : isLoadingCourses
                        ? "Loading..."
                        : "Select a course"}
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

            {selectedCourseId && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Subjects</Label>
                  {availableSubjects.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={selectAll}
                        onCheckedChange={(checked) => {
                          const isSelectedAll = checked === true;
                          setSelectAll(isSelectedAll);
                          setSelectedSubjectIds(
                            isSelectedAll ? availableSubjects.map((s) => s.id) : []
                          );
                        }}
                      />
                      <label
                        htmlFor="select-all"
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        Select All
                      </label>
                    </div>
                  )}
                </div>

                {isLoadingSubjects ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : availableSubjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No subjects available for this course
                  </p>
                ) : (
                  <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                    {availableSubjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={subject.id}
                          checked={selectedSubjectIds.includes(subject.id)}
                          onCheckedChange={() => handleSubjectToggle(subject.id)}
                        />
                        <label
                          htmlFor={subject.id}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {capitalize(subject.name)}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {selectedSubjectIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedSubjectIds.length} of {availableSubjects.length} subjects
                    selected
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedCourseId}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enroll to Teach
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
