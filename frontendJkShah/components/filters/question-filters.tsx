"use client";

import { useEffect, useState } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useActiveFilters } from "@/hooks/use-active-filters";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import { useSubjects } from "@/hooks/use-subjects";
import { useTopics } from "@/hooks/use-topics";
import { useTeachingCoursesAndSubjects } from "@/hooks/use-teaching-courses-and-subjects";
import { useAuth } from "@/contexts/auth-context";
import { capitalize } from "@/lib/utils";

interface QuestionFiltersProps {
  onFilterChange: (filters: {
    courseId: string;
    subjectId: string;
    topicId: string;
  }) => void;
}

export function QuestionFilters({ onFilterChange }: QuestionFiltersProps) {
  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  const { activeFilters, isLoading: filtersLoading } = useActiveFilters();
  
  // Use limit: 10000 to get all available entities for filtering
  const { courses: allCourses, isLoading: allCoursesLoading } = useCourses({ limit: 10000 });
  const { subjects: courseSubjects, isLoading: courseSubjectsLoading } = useSubjects({ limit: 10000, courseId: courseId || undefined });
  const { topics: allTopics, isLoading: allTopicsLoading } = useTopics({ limit: 10000 });
  const { courses: teacherCourses, subjects: teacherSubjects, isLoading: teachingLoading } = useTeachingCoursesAndSubjects();

  // For teachers, use only their assigned courses; for admins, use all
  let courses = isTeacher ? teacherCourses : allCourses;
  const isLoadingCourses = (isTeacher ? teachingLoading : allCoursesLoading) || filtersLoading;

  let subjects = isTeacher && courseId
    ? courseSubjects.filter((s) => teacherSubjects.some((ts) => ts.id === s.id))
    : courseSubjects;
  const isLoadingSubjects = (isTeacher ? teachingLoading : courseSubjectsLoading) || filtersLoading;

  let topics = isTeacher
    ? allTopics.filter((t) => {
        if (subjectId) {
          return t.subject_id === subjectId;
        }
        const teacherSubjectIds = teacherSubjects.map((s) => s.id);
        return teacherSubjectIds.includes(t.subject_id);
      })
    : allTopics;
  const isLoadingTopics = (isTeacher ? teachingLoading : allTopicsLoading) || filtersLoading;
  
  // Apply Active Filters (only show those that have at least one question)
  courses = courses.filter(c => activeFilters.courseIds.includes(c.id));
  subjects = subjects.filter(s => activeFilters.subjectIds.includes(s.id));
  topics = topics.filter(t => activeFilters.topicIds.includes(t.id));

  const selectedCourse = courses.find((c) => c.id === courseId);
  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const selectedTopic = topics.find((t) => t.id === topicId);

  useEffect(() => {
    onFilterChange({ courseId, subjectId, topicId });
  }, [courseId, subjectId, topicId, onFilterChange]);

  const handleClearFilters = () => {
    setCourseId("");
    setSubjectId("");
    setTopicId("");
  };

  const hasFilters = courseId || subjectId || topicId;

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="course" className="text-sm font-medium mb-2 block">
          Course
        </Label>
        <SearchableSelect
          value={courseId}
          onValueChange={(value) => {
            setCourseId(value === "all" ? "" : (value ?? ""));
            setSubjectId("");
            setTopicId("");
          }}
          placeholder={isLoadingCourses ? "Loading..." : "All Courses"}
          options={courses.map(c => ({ value: c.id, label: capitalize(c.name) }))}
          disabled={isLoadingCourses}
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
          Subject
        </Label>
        <SearchableSelect
          value={subjectId}
          onValueChange={(value) => {
            setSubjectId(value === "all" ? "" : (value ?? ""));
            setTopicId("");
          }}
          placeholder={!courseId ? "Select course first" : isLoadingSubjects ? "Loading..." : "All Subjects"}
          options={subjects.map(s => ({ value: s.id, label: capitalize(s.name) }))}
          disabled={!courseId || isLoadingSubjects}
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="topic" className="text-sm font-medium mb-2 block">
          Topic
        </Label>
        <SearchableSelect
          value={topicId}
          onValueChange={(value) => {
            setTopicId(value === "all" ? "" : (value ?? ""));
          }}
          placeholder={!subjectId ? "Select subject first" : isLoadingTopics ? "Loading..." : "All Topics"}
          options={topics.map(t => ({ value: t.id, label: capitalize(t.name) }))}
          disabled={!subjectId || isLoadingTopics}
        />
      </div>

      {hasFilters && (
        <Button variant="outline" onClick={handleClearFilters} className="mb-0.5">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}