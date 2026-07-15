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
import { enrollmentsApi, EnrollmentPayload } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";

interface EnrollmentItem {
  courseId: string;
  subjectId: string;
  topicId: string;
}

interface EnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EnrollDialog({ open, onOpenChange, onSuccess }: EnrollDialogProps) {
  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([
    { courseId: "", subjectId: "", topicId: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { courses, isLoading: isLoadingCourses } = useCourses({ limit: 100 });
  const { subjects, isLoading: isLoadingSubjects } = useSubjects({ limit: 100 });
  const { topics, isLoading: isLoadingTopics } = useTopics({ limit: 100 });

  const addEnrollment = () => {
    if (enrollments.length < 50) {
      setEnrollments([...enrollments, { courseId: "", subjectId: "", topicId: "" }]);
    }
  };

  const removeEnrollment = (index: number) => {
    if (enrollments.length > 1) {
      setEnrollments(enrollments.filter((_, i) => i !== index));
    }
  };

  const updateEnrollment = (index: number, field: keyof EnrollmentItem, value: string) => {
    const updated = [...enrollments];
    updated[index] = { ...updated[index], [field]: value };
    // Reset dependent fields
    if (field === "courseId") {
      updated[index].subjectId = "";
      updated[index].topicId = "";
    } else if (field === "subjectId") {
      updated[index].topicId = "";
    }
    setEnrollments(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload: EnrollmentPayload = {
        enrollments: enrollments
          .filter((e) => e.courseId)
          .map((e) => ({
            course_id: e.courseId,
            subject_id: e.subjectId && e.subjectId !== "__all__" ? e.subjectId : undefined,
            topic_id: e.topicId && e.topicId !== "__all__" ? e.topicId : undefined,
          })),
      };

      if (payload.enrollments.length === 0) {
        setError("Please select at least one course");
        setIsLoading(false);
        return;
      }

      const response = await enrollmentsApi.enroll(payload, token || undefined);

      if (response.data.totalCreated > 0) {
        toast.success(`Enrolled in ${response.data.totalCreated} item(s)`);
      }

      if (response.data.totalSkipped > 0) {
        toast.info(`${response.data.totalSkipped} item(s) skipped (already enrolled)`);
      }

      setEnrollments([{ courseId: "", subjectId: "", topicId: "" }]);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll");
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectsForCourse = (courseId: string) => {
    return subjects.filter((s) => s.course_id === courseId);
  };

  const getTopicsForSubject = (subjectId: string) => {
    return topics.filter((t) => t.subject_id === subjectId);
  };

  const getCourseName = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.name || "";
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || "";
  };

  const getTopicName = (topicId: string) => {
    return topics.find((t) => t.id === topicId)?.name || "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enroll in Courses</DialogTitle>
          <DialogDescription>
            Select courses, subjects, and topics to enroll in. You can add multiple enrollments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {enrollments.map((enrollment, index) => {
              const availableSubjects = getSubjectsForCourse(enrollment.courseId);
              const availableTopics = getTopicsForSubject(enrollment.subjectId);

              return (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Enrollment {index + 1}</Label>
                    {enrollments.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeEnrollment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Course *</Label>
                      <Select
                        value={enrollment.courseId}
                        onValueChange={(value) => { if (value) updateEnrollment(index, "courseId", value); }}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue>
                            {enrollment.courseId ? capitalize(getCourseName(enrollment.courseId)) : isLoadingCourses ? "Loading..." : "Select"}
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

                    <div className="space-y-1">
                      <Label className="text-xs">Subject</Label>
                      <Select
                        value={enrollment.subjectId}
                        onValueChange={(value) => { if (value) updateEnrollment(index, "subjectId", value); }}
                        disabled={!enrollment.courseId}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue>
                            {enrollment.subjectId === "__all__" ? "All Subjects" : enrollment.subjectId ? capitalize(getSubjectName(enrollment.subjectId)) : !enrollment.courseId ? "Select course" : "All Subjects"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All Subjects</SelectItem>
                          {availableSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {capitalize(subject.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Topic</Label>
                      <Select
                        value={enrollment.topicId}
                        onValueChange={(value) => { if (value) updateEnrollment(index, "topicId", value); }}
                        disabled={!enrollment.subjectId}
                      >
                        <SelectTrigger className="w-full h-9">
                          <SelectValue>
                            {enrollment.topicId === "__all__" ? "All Topics" : enrollment.topicId ? capitalize(getTopicName(enrollment.topicId)) : !enrollment.subjectId ? "Select subject" : "All Topics"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All Topics</SelectItem>
                          {availableTopics.map((topic) => (
                            <SelectItem key={topic.id} value={topic.id}>
                              {capitalize(topic.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}

            {enrollments.length < 50 && (
              <Button
                type="button"
                variant="outline"
                onClick={addEnrollment}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Enrollment
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enroll
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}