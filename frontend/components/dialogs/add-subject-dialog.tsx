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
import { Loader2 } from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import { subjectsApi, Subject } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";

const MAX_DESCRIPTION_LENGTH = 1024;

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editSubject?: Subject | null;
  onSuccess?: () => void;
}

export function AddSubjectDialog({ open, onOpenChange, editSubject, onSuccess }: AddSubjectDialogProps) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { courses, isLoading: isLoadingCourses } = useCourses({ limit: 100 });

  const isEditing = !!editSubject;
  const selectedCourse = courses.find((c) => c.id === courseId);

  useEffect(() => {
    if (editSubject && open) {
      setName(editSubject.name);
      setDescription(editSubject.description || "");
      setCourseId(editSubject.course_id);
    } else if (!open) {
      setName("");
      setDescription("");
      setCourseId("");
      setError("");
    }
  }, [editSubject, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = { name: name.trim(), description: description.trim() || undefined, course_id: courseId };

      if (isEditing) {
        await subjectsApi.update(editSubject.id, payload, token || undefined);
        toast.success("Subject updated successfully!");
      } else {
        await subjectsApi.create(payload, token || undefined);
        toast.success("Subject created successfully!");
      }

      setName("");
      setDescription("");
      setCourseId("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const msg = isEditing ? "Failed to update subject" : "Failed to create subject";
      setError(err instanceof Error ? err.message : msg);
      toast.error(err instanceof Error ? err.message : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Subject" : "Add Subject"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the subject details." : "Create a new subject under a course. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="course">Course *</Label>
              <Select value={courseId} onValueChange={(value) => { if (value) setCourseId(value); }} required>
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
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Data Structures"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                    setDescription(e.target.value);
                  }
                }}
                placeholder="Optional description"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border"
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !courseId}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
