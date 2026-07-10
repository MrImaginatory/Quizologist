import { api } from "./api";
import { getToken } from "./auth";

// Types
export interface Faculty {
  id: string;
  name: string;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  faculty_id: string;
  faculty?: {
    id: string;
    name: string;
  };
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  subject_id: string;
  subject?: {
    id: string;
    name: string;
    faculty?: {
      id: string;
      name: string;
    };
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    [key: string]: T[] | Pagination | any;
    pagination: Pagination;
  };
}

// Ensure api can accept token if we need to call it manually
class ContentService {
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

  // Faculty
  async getFaculties(page = 1, limit = 10): Promise<PaginatedResponse<Faculty>> {
    return this.request(`/api/content/faculty?page=${page}&limit=${limit}`);
  }

  async createFaculty(name: string, description?: string) {
    return this.request("/api/content/faculty", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
  }

  async updateFaculty(id: string, name: string, description?: string) {
    return this.request(`/api/content/faculty/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, description }),
    });
  }

  async deleteFaculty(id: string) {
    return this.request(`/api/content/faculty/${id}`, {
      method: "DELETE",
    });
  }

  // Subject
  async getSubjects(page = 1, limit = 10): Promise<PaginatedResponse<Subject>> {
    return this.request(`/api/content/subject?page=${page}&limit=${limit}`);
  }

  async getSubjectsByFaculty(facultyId: string, page = 1, limit = 100): Promise<PaginatedResponse<Subject>> {
    return this.request(`/api/content/subject/faculty/${facultyId}?page=${page}&limit=${limit}`);
  }

  async createSubject(name: string, faculty_id: string, description?: string) {
    return this.request("/api/content/subject", {
      method: "POST",
      body: JSON.stringify({ name, faculty_id, description }),
    });
  }

  async updateSubject(id: string, name: string, faculty_id: string, description?: string) {
    return this.request(`/api/content/subject/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, faculty_id, description }),
    });
  }

  async deleteSubject(id: string) {
    return this.request(`/api/content/subject/${id}`, {
      method: "DELETE",
    });
  }

  // Topic
  async getTopics(page = 1, limit = 10): Promise<PaginatedResponse<Topic>> {
    return this.request(`/api/content/topic?page=${page}&limit=${limit}`);
  }

  async getTopicsBySubject(subjectId: string, page = 1, limit = 100): Promise<PaginatedResponse<Topic>> {
    return this.request(`/api/content/topic/subject/${subjectId}?page=${page}&limit=${limit}`);
  }

  async createTopic(name: string, subject_id: string, description?: string) {
    return this.request("/api/content/topic", {
      method: "POST",
      body: JSON.stringify({ name, subject_id, description }),
    });
  }

  async updateTopic(id: string, name: string, subject_id: string, description?: string) {
    return this.request(`/api/content/topic/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, subject_id, description }),
    });
  }

  async deleteTopic(id: string) {
    return this.request(`/api/content/topic/${id}`, {
      method: "DELETE",
    });
  }
}

export const contentService = new ContentService();
