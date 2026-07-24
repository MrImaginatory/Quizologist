"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const { courses: allCourses, isLoading: allCoursesLoading } = useCourses({ limit: 100 });
  // Fetch subjects filtered by selected course (not all subjects)
  const { subjects: courseSubjects, isLoading: courseSubjectsLoading } = useSubjects({
    limit: 100,
    courseId: courseId || undefined,
  });
  const { topics: allTopics, isLoading: allTopicsLoading } = useTopics({ limit: 100 });
  const { courses: teacherCourses, subjects: teacherSubjects, isLoading: teachingLoading } = useTeachingCoursesAndSubjects();

  // For teachers, use only their assigned courses; for admins, use all
  const courses = isTeacher ? teacherCourses : allCourses;
  const isLoadingCourses = isTeacher ? teachingLoading : allCoursesLoading;

  // For subjects: if teacher, filter course subjects by their assigned subjects
  const subjects = isTeacher && courseId
    ? courseSubjects.filter((s) => teacherSubjects.some((ts) => ts.id === s.id))
    : courseSubjects;
  const isLoadingSubjects = isTeacher ? teachingLoading : courseSubjectsLoading;

  // Filter topics based on selected subject (or all teacher's subjects for teachers)
  const topics = isTeacher
    ? allTopics.filter((t) => {
        if (subjectId) {
          return t.subject_id === subjectId;
        }
        const teacherSubjectIds = teacherSubjects.map((s) => s.id);
        return teacherSubjectIds.includes(t.subject_id);
      })
    : allTopics;
  const isLoadingTopics = isTeacher ? teachingLoading : allTopicsLoading;

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
        <Select value={courseId || "all"} onValueChange={(value) => {
          setCourseId(value === "all" ? "" : (value ?? ""));
          setSubjectId("");
          setTopicId("");
        }}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {selectedCourse ? capitalize(selectedCourse.name) : isLoadingCourses ? "Loading..." : "All Courses"}
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
      </div>

      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
          Subject
        </Label>
        <Select value={subjectId || "all"} onValueChange={(value) => {
          setSubjectId(value === "all" ? "" : (value ?? ""));
          setTopicId("");
        }} disabled={!courseId}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {selectedSubject ? capitalize(selectedSubject.name) : !courseId ? "Select course first" : isLoadingSubjects ? "Loading..." : "All Subjects"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {capitalize(subject.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="topic" className="text-sm font-medium mb-2 block">
          Topic
        </Label>
        <Select value={topicId || "all"} onValueChange={(value) => {
          setTopicId(value === "all" ? "" : (value ?? ""));
        }} disabled={!subjectId}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {selectedTopic ? capitalize(selectedTopic.name) : !subjectId ? "Select subject first" : isLoadingTopics ? "Loading..." : "All Topics"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {capitalize(topic.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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