"use client";

import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
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
      <CustomSelect
        value={courseId || "all"}
        onChange={(value) => onCourseChange(value && value !== "all" ? value : "")}
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

      <CustomSelect
        value={subjectId || "all"}
        onChange={(value) => onSubjectChange(value && value !== "all" ? value : "")}
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

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
