"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { teachersApi } from "@/lib/api";

interface TeachingCourse {
  id: string;
  name: string;
}

interface TeachingSubject {
  id: string;
  name: string;
  course_id: string;
}

export function useTeachingCoursesAndSubjects() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<TeachingCourse[]>([]);
  const [subjects, setSubjects] = useState<TeachingSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await teachersApi.getTeachingCoursesAndSubjects(token || undefined);
        setCourses(response.data?.courses || []);
        setSubjects(response.data?.subjects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch teaching courses and subjects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return { courses, subjects, isLoading, error };
}
