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
import { Loader2 } from "lucide-react";
import { coursesApi, Course } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

const MAX_DESCRIPTION_LENGTH = 1024;

interface AddCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCourse?: Course | null;
  onSuccess?: () => void;
}

export function AddCourseDialog({ open, onOpenChange, editCourse, onSuccess }: AddCourseDialogProps) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editCourse;

  useEffect(() => {
    if (editCourse && open) {
      setName(editCourse.name);
      setDescription(editCourse.description || "");
    } else if (!open) {
      setName("");
      setDescription("");
      setError("");
    }
  }, [editCourse, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = { name: name.trim(), description: description.trim() || undefined };

      if (isEditing) {
        await coursesApi.update(editCourse.id, payload, token || undefined);
        toast.success("Course updated successfully!");
      } else {
        await coursesApi.create(payload, token || undefined);
        toast.success("Course created successfully!");
      }

      setName("");
      setDescription("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const msg = isEditing ? "Failed to update course" : "Failed to create course";
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
          <DialogTitle>{isEditing ? "Edit Course" : "Add Course"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the course details." : "Create a new course. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Computer Science"
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
