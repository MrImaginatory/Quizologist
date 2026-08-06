"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { capitalize } from "@/lib/utils";

interface Course {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  course_id: string;
}

interface StudentFiltersProps {
  courseId: string;
  subjectId: string;
  courses: Course[];
  subjects: Subject[];
  coursesLoading?: boolean;
  subjectsLoading?: boolean;
  onCourseChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onClear: () => void;
}

export function StudentFilters({
  courseId,
  subjectId,
  courses,
  subjects,
  coursesLoading = false,
  subjectsLoading = false,
  onCourseChange,
  onSubjectChange,
  onClear,
}: StudentFiltersProps) {
  const hasFilters = courseId || subjectId;

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

  const courseDisplay = getCourseDisplay();
  const subjectDisplay = getSubjectDisplay();

  const filteredSubjects = courseId && courseId !== "all"
    ? subjects.filter((s) => s.course_id === courseId)
    : subjects;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={courseId || "all"}
        onValueChange={(value) => onCourseChange(value && value !== "all" ? value : "")}
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

      <Select
        value={subjectId || "all"}
        onValueChange={(value) => onSubjectChange(value && value !== "all" ? value : "")}
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

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
