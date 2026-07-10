import { getToken } from "./auth";

export type QuestionType = "mcq" | "descriptive";
export type Difficulty = "beginner" | "normal" | "mid" | "hard" | "expert";

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  choices?: string[];
  correctAnswer: string;
  explanation?: string;
  videoUrl?: string;
  difficulty: Difficulty;
  topic_id: string;
  subject_id: string;
  faculty_id: string;
  questionAddedBy?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedQuestionResponse {
  success: boolean;
  message: string;
  data: {
    questions: Question[];
    pagination: Pagination;
  };
}

class QuestionService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      throw {
        success: false,
        message: data.message || "An error occurred",
        status: response.status,
      };
    }
    return data;
  }

  async getQuestions(page = 1, limit = 10): Promise<PaginatedQuestionResponse> {
    return this.request(`/api/question?page=${page}&limit=${limit}`);
  }

  async getQuestionsByTopic(topicId: string, page = 1, limit = 10): Promise<PaginatedQuestionResponse> {
    return this.request(`/api/question/topic/${topicId}?page=${page}&limit=${limit}`);
  }

  async filterQuestions(params: { faculty_id?: string; subject_id?: string; topic_id?: string; page?: number; limit?: number }): Promise<PaginatedQuestionResponse> {
    const query = new URLSearchParams();
    if (params.faculty_id) query.append("faculty_id", params.faculty_id);
    if (params.subject_id) query.append("subject_id", params.subject_id);
    if (params.topic_id) query.append("topic_id", params.topic_id);
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    
    return this.request(`/api/question/filter?${query.toString()}`);
  }

  async createQuestion(payload: Omit<Question, "id" | "questionAddedBy">) {
    return this.request("/api/question", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateQuestion(id: string, payload: Partial<Omit<Question, "id" | "questionAddedBy">>) {
    return this.request(`/api/question/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteQuestion(id: string) {
    return this.request(`/api/question/${id}`, {
      method: "DELETE",
    });
  }
}

export const questionService = new QuestionService();
