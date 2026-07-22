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
import { useSubjects } from "@/hooks/use-subjects";
import { topicsApi, Topic } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";

const MAX_DESCRIPTION_LENGTH = 1024;

interface AddTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTopic?: Topic | null;
  onSuccess?: () => void;
}

export function AddTopicDialog({ open, onOpenChange, editTopic, onSuccess }: AddTopicDialogProps) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { subjects, isLoading: isLoadingSubjects } = useSubjects({ limit: 100 });

  const isEditing = !!editTopic;
  const selectedSubject = subjects.find((s) => s.id === subjectId);

  useEffect(() => {
    if (editTopic && open) {
      setName(editTopic.name);
      setDescription(editTopic.description || "");
      setSubjectId(editTopic.subject_id);
    } else if (!open) {
      setName("");
      setDescription("");
      setSubjectId("");
      setError("");
    }
  }, [editTopic, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = { name: name.trim(), description: description.trim() || undefined, subject_id: subjectId };

      if (isEditing) {
        await topicsApi.update(editTopic.id, payload, token || undefined);
        toast.success("Topic updated successfully!");
      } else {
        await topicsApi.create(payload, token || undefined);
        toast.success("Topic created successfully!");
      }

      setName("");
      setDescription("");
      setSubjectId("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const msg = isEditing ? "Failed to update topic" : "Failed to create topic";
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
          <DialogTitle>{isEditing ? "Edit Topic" : "Add Topic"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the topic details." : "Create a new topic under a subject. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={subjectId} onValueChange={(value) => { if (value) setSubjectId(value); }} required>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {selectedSubject ? capitalize(selectedSubject.name) : isLoadingSubjects ? "Loading..." : "Select subject"}
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
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Binary Trees"
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
            <Button type="submit" disabled={isLoading || !subjectId}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
