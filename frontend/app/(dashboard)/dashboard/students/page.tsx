"use client";

import { useState, useCallback } from "react";
import { DataTable } from "@/components/data-table";
import { useTeachingStudents } from "@/hooks/use-teaching-students";
import { useCourses } from "@/hooks/use-courses";
import { useSubjects } from "@/hooks/use-subjects";
import { useTeachingCoursesAndSubjects } from "@/hooks/use-teaching-courses-and-subjects";
import { useAuth } from "@/contexts/auth-context";
import { TeachingStudent } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { StudentFilters } from "@/components/filters/student-filters";
import { capitalize } from "@/lib/utils";

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  const { courses: allCourses, isLoading: allCoursesLoading } = useCourses({ limit: 100 });
  const { subjects: allSubjects, isLoading: allSubjectsLoading } = useSubjects({ limit: 100 });
  const { courses: teacherCourses, subjects: teacherSubjects, isLoading: teachingLoading } = useTeachingCoursesAndSubjects();

  // For teachers, use only their assigned courses/subjects; for admins, use all
  const courses = isTeacher ? teacherCourses : allCourses;
  const subjects = isTeacher ? teacherSubjects : allSubjects;
  const coursesLoading = isTeacher ? teachingLoading : allCoursesLoading;
  const subjectsLoading = isTeacher ? teachingLoading : allSubjectsLoading;

  const { students, total, totalPages, isLoading, error, refetch } = useTeachingStudents({
    page,
    limit,
    course_id: courseId || undefined,
    subject_id: subjectId || undefined,
  });

  const handleClearFilters = useCallback(() => {
    setCourseId("");
    setSubjectId("");
    setPage(1);
  }, []);

  const handleCourseChange = useCallback((value: string) => {
    setCourseId(value);
    setSubjectId("");
    setPage(1);
  }, []);

  const handleSubjectChange = useCallback((value: string) => {
    setSubjectId(value);
    setPage(1);
  }, []);

  const columns = [
    { key: "sno", header: "#", render: (_t: TeachingStudent, index: number) => index + 1 },
    {
      key: "name",
      header: "Name",
      render: (t: TeachingStudent) => (
        <span className="font-medium">
          {capitalize(t.fname)} {capitalize(t.lname)}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (t: TeachingStudent) => (
        <span className="text-muted-foreground">{t.email}</span>
      ),
    },
    {
      key: "course_id",
      header: "Course",
      render: (t: TeachingStudent) => {
        const course = courses.find((c) => c.id === t.course_id);
        return course ? (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            {capitalize(course.name)}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      key: "subject_id",
      header: "Subject",
      render: (t: TeachingStudent) => {
        const subject = subjects.find((s) => s.id === t.subject_id);
        return subject ? (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            {capitalize(subject.name)}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          My Students
        </h1>
        <p className="text-muted-foreground">
          Students enrolled in your courses and subjects
        </p>
      </div>

      <StudentFilters
        courseId={courseId}
        subjectId={subjectId}
        courses={courses}
        subjects={subjects}
        coursesLoading={coursesLoading}
        subjectsLoading={subjectsLoading}
        onCourseChange={handleCourseChange}
        onSubjectChange={handleSubjectChange}
        onClear={handleClearFilters}
      />

      <DataTable
        title="Students"
        columns={columns}
        data={students}
        isLoading={isLoading}
        error={error}
        keyExtractor={(t) => t.id}
        pagination={{ page, totalPages, total, limit }}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
}
