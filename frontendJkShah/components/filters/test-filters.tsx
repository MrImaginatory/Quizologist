"use client";

import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
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
        <CustomSelect
          value={courseId || "all"}
          onChange={(value) => onCourseChange?.(value && value !== "all" ? value : "")}
          placeholder={coursesLoading ? "Loading courses..." : "All Courses"}
          className="w-[200px]"
          options={[
            { value: "all", label: "All Courses" },
            ...courses.map((course) => ({
              value: course.id,
              label: capitalize(course.name),
            })),
          ]}
        />
      )}

      {showSubjectFilter && (
        <CustomSelect
          value={subjectId || "all"}
          onChange={(value) => onSubjectChange?.(value && value !== "all" ? value : "")}
          disabled={!courseId || courseId === "all"}
          placeholder={subjectsLoading ? "Loading subjects..." : !courseId || courseId === "all" ? "Select course first" : "All Subjects"}
          className="w-[200px]"
          options={[
            { value: "all", label: "All Subjects" },
            ...filteredSubjects.map((subject) => ({
              value: subject.id,
              label: capitalize(subject.name),
            })),
          ]}
        />
      )}

      {showStudentFilter && (
        <CustomSelect
          value={studentId || "all"}
          onChange={(value) => onStudentChange(value && value !== "all" ? value : "")}
          placeholder={studentsLoading ? "Loading students..." : "All Students"}
          className="w-[200px]"
          options={[
            { value: "all", label: "All Students" },
            ...students.map((student) => ({
              value: student.id,
              label: `${capitalize(student.fname)} ${capitalize(student.lname)}`,
            })),
          ]}
        />
      )}

      <CustomSelect
        value={status || "all"}
        onChange={(value) => onStatusChange(value && value !== "all" ? value : "")}
        className="w-[160px]"
        options={[
          { value: "all", label: "All Status" },
          { value: "pending", label: "Pending" },
          { value: "in_progress", label: "In Progress" },
          { value: "completed", label: "Completed" },
          { value: "abandoned", label: "Abandoned" },
        ]}
      />

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
