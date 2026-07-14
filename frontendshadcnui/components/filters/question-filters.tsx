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

  const { courses, isLoading: isLoadingCourses } = useCourses({ limit: 100 });
  const { subjects, isLoading: isLoadingSubjects } = useSubjects({ limit: 100 });
  const { topics, isLoading: isLoadingTopics } = useTopics({ limit: 100 });

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
        <Select value={courseId} onValueChange={(value) => {
          if (value) {
            setCourseId(value);
            setSubjectId("");
            setTopicId("");
          }
        }}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {selectedCourse ? capitalize(selectedCourse.name) : isLoadingCourses ? "Loading..." : "All Courses"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
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
        <Select value={subjectId} onValueChange={(value) => {
          if (value) {
            setSubjectId(value);
            setTopicId("");
          }
        }} disabled={!courseId}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {selectedSubject ? capitalize(selectedSubject.name) : !courseId ? "Select course first" : isLoadingSubjects ? "Loading..." : "All Subjects"}
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

      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="topic" className="text-sm font-medium mb-2 block">
          Topic
        </Label>
        <Select value={topicId} onValueChange={(value) => { if (value) setTopicId(value); }} disabled={!subjectId}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {selectedTopic ? capitalize(selectedTopic.name) : !subjectId ? "Select subject first" : isLoadingTopics ? "Loading..." : "All Topics"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
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