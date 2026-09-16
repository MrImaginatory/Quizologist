"use client";

import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import { createFetcher, swrOptions } from "@/lib/swr-config";
import { API_ROUTES } from "@/lib/api-routes";
import type { QuestionsResponse } from "@/lib/api";

interface UseQuestionsOptions {
  page?: number;
  limit?: number;
  courseId?: string;
  subjectId?: string;
  topicId?: string;
  difficulty?: string;
}

interface UseQuestionsResult {
  questions: any[];
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
  difficulty,
}: UseQuestionsOptions = {}): UseQuestionsResult {
  const { token } = useAuth();
  const fetcher = createFetcher(token);
  
  const searchParams = new URLSearchParams();
  if (courseId) searchParams.set("course_id", courseId);
  if (subjectId) searchParams.set("subject_id", subjectId);
  if (topicId) searchParams.set("topic_id", topicId);
  if (difficulty) searchParams.set("difficulty", difficulty);
  searchParams.set("page", page.toString());
  searchParams.set("limit", limit.toString());
  
  const url = `${API_ROUTES.QUESTIONS.FILTER}?${searchParams.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<QuestionsResponse>(
    token ? url : null,
    fetcher,
    swrOptions
  );

  return {
    questions: data?.data?.questions || [],
    total: data?.data?.pagination?.total || 0,
    totalPages: data?.data?.pagination?.totalPages || 0,
    isLoading,
    error: error?.message || "",
    refetch: () => mutate(),
  };
}
