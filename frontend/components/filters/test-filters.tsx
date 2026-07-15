"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { X } from "lucide-react";
import { capitalize } from "@/lib/utils";

interface Student {
  id: string;
  fname: string;
  lname: string;
  email: string;
}

interface TestFiltersProps {
  status: string;
  dateFrom: string;
  dateTo: string;
  studentId: string;
  students: Student[];
  studentsLoading?: boolean;
  onStatusChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onStudentChange: (value: string) => void;
  onClear: () => void;
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  abandoned: "Abandoned",
};

export function TestFilters({
  status,
  dateFrom,
  dateTo,
  studentId,
  students,
  studentsLoading = false,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onStudentChange,
  onClear,
}: TestFiltersProps) {
  const hasFilters = status || dateFrom || dateTo || studentId;

  const getStudentDisplay = () => {
    if (!studentId || studentId === "all") return null;
    const student = students.find((s) => s.id === studentId);
    return student ? `${capitalize(student.fname)} ${capitalize(student.lname)}` : null;
  };

  const studentDisplay = getStudentDisplay();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={studentId} onValueChange={(value) => onStudentChange(value || "")}>
        <SelectTrigger className="w-[200px]">
          <SelectValue>
            {studentDisplay || (studentsLoading ? "Loading students..." : "All Students")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Students</SelectItem>
          {students.map((student) => (
            <SelectItem key={student.id} value={student.id}>
              {capitalize(student.fname)} {capitalize(student.lname)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(value) => onStatusChange(value || "")}>
        <SelectTrigger className="w-[160px]">
          <SelectValue>
            {status && status !== "all" ? statusLabels[status] || capitalize(status) : "All Status"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="abandoned">Abandoned</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <DatePicker
          value={dateFrom}
          onChange={onDateFromChange}
          placeholder="From date"
        />
        <span className="text-muted-foreground">to</span>
        <DatePicker
          value={dateTo}
          onChange={onDateToChange}
          placeholder="To date"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
