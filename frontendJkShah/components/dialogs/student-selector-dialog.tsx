"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { usersApi, User } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, X } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { toast } from "sonner";

interface StudentSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (studentIds: string[]) => void;
  selectedIds: string[];
}

export function StudentSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  selectedIds,
}: StudentSelectorDialogProps) {
  const { token } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [localSelected, setLocalSelected] = useState<Set<string>>(new Set(selectedIds));

  useEffect(() => {
    if (open) {
      setLocalSelected(new Set(selectedIds));
      fetchStudents();
    }
  }, [open, selectedIds]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.getByRole("student", 1, 100, token || undefined);
      setStudents(response.data?.users || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const lowerSearch = search.toLowerCase();
    return students.filter(
      (s) =>
        s.fname.toLowerCase().includes(lowerSearch) ||
        s.lname.toLowerCase().includes(lowerSearch) ||
        s.email.toLowerCase().includes(lowerSearch)
    );
  }, [students, search]);

  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(localSelected);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setLocalSelected(newSelected);
  };

  const toggleAll = () => {
    if (localSelected.size === filteredStudents.length) {
      setLocalSelected(new Set());
    } else {
      setLocalSelected(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const handleConfirm = () => {
    onSelect(Array.from(localSelected));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Students</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {localSelected.size} students selected
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Selected count and actions */}
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {localSelected.size} selected
            </Badge>
            <Button variant="ghost" size="sm" onClick={toggleAll}>
              {localSelected.size === filteredStudents.length ? "Deselect All" : "Select All"}
            </Button>
            {localSelected.size > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setLocalSelected(new Set())}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Students list */}
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found
              </div>
            ) : (
              <div className="space-y-1">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      localSelected.has(student.id)
                        ? "bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleStudent(student.id)}
                  >
                    <Checkbox
                      checked={localSelected.has(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {capitalize(student.fname)} {capitalize(student.lname)}
                      </p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Select {localSelected.size} Students
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
