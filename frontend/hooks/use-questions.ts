"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { questionsApi, Question } from "@/lib/api";

interface UseQuestionsOptions {
  page?: number;
  limit?: number;
  courseId?: string;
  subjectId?: string;
  topicId?: string;
}

interface UseQuestionsResult {
  questions: Question[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string;
  refetch: () => void;
}

export function useQuestions({
  page = 1,
  limit = 10,
  courseId,
  subjectId,
  topicId,
}: UseQuestionsOptions = {}): UseQuestionsResult {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await questionsApi.filter(
        {
          course_id: courseId,
          subject_id: subjectId,
          topic_id: topicId,
          page,
          limit,
        },
        token || undefined
      );
      setQuestions(response.data.questions);
      setTotal(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch questions");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, subjectId, topicId, page, limit, token]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { questions, total, totalPages, isLoading, error, refetch: fetchQuestions };
}
