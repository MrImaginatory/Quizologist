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

interface Course {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  course_id: string;
}

interface TestFiltersProps {
  status: string;
  dateFrom: string;
  dateTo: string;
  studentId: string;
  courseId?: string;
  subjectId?: string;
  students: Student[];
  courses?: Course[];
  subjects?: Subject[];
  studentsLoading?: boolean;
  coursesLoading?: boolean;
  subjectsLoading?: boolean;
  showStudentFilter?: boolean;
  showCourseFilter?: boolean;
  showSubjectFilter?: boolean;
  onStatusChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onStudentChange: (value: string) => void;
  onCourseChange?: (value: string) => void;
  onSubjectChange?: (value: string) => void;
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
  courseId,
  subjectId,
  students,
  courses = [],
  subjects = [],
  studentsLoading = false,
  coursesLoading = false,
  subjectsLoading = false,
  showStudentFilter = true,
  showCourseFilter = false,
  showSubjectFilter = false,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onStudentChange,
  onCourseChange,
  onSubjectChange,
  onClear,
}: TestFiltersProps) {
  const hasFilters = status || dateFrom || dateTo || studentId || courseId || subjectId;

  const getStudentDisplay = () => {
    if (!studentId || studentId === "all") return null;
    const student = students.find((s) => s.id === studentId);
    return student ? `${capitalize(student.fname)} ${capitalize(student.lname)}` : null;
  };

  const getCourseDisplay = () => {
    if (!courseId || courseId === "all") return null;
    const course = courses.find((c) => c.id === courseId);
    return course ? capitalize(course.name) : null;
  };

  const getSubjectDisplay = () => {
    if (!subjectId || subjectId === "all") return null;
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? capitalize(subject.name) : null;
  };

  const studentDisplay = getStudentDisplay();
  const courseDisplay = getCourseDisplay();
  const subjectDisplay = getSubjectDisplay();

  const filteredSubjects = courseId && courseId !== "all"
    ? subjects.filter((s) => s.course_id === courseId)
    : subjects;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {showCourseFilter && (
        <Select
          value={courseId || "all"}
          onValueChange={(value) => onCourseChange?.(value && value !== "all" ? value : "")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue>
              {courseDisplay || (coursesLoading ? "Loading courses..." : "All Courses")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {capitalize(course.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showSubjectFilter && (
        <Select
          value={subjectId || "all"}
          onValueChange={(value) => onSubjectChange?.(value && value !== "all" ? value : "")}
          disabled={!courseId || courseId === "all"}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue>
              {subjectDisplay || (subjectsLoading ? "Loading subjects..." : !courseId || courseId === "all" ? "Select course first" : "All Subjects")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {filteredSubjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {capitalize(subject.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showStudentFilter && (
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
      )}

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
