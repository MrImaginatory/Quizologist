import { getToken } from "./auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

class TestService {
  private getAuthHeaders(): HeadersInit {
    const token = getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async getHistory(page = 1, limit = 10) {
    const response = await fetch(
      `${BACKEND_URL}/api/test/history?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );
    return response.json();
  }

  async startTest(payload: {
    duration_minutes: number;
    question_limit: number;
    selections: { faculty_id: string; subject_id?: string; topic_id?: string }[];
  }) {
    const response = await fetch(`${BACKEND_URL}/api/test/start`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  async abandonTest(testId: string) {
    const response = await fetch(`${BACKEND_URL}/api/test/abandon/${testId}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  async getResult(testId: string) {
    const response = await fetch(`${BACKEND_URL}/api/test/result/${testId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  async getStudentResults(studentId: string, page = 1, limit = 10) {
    const response = await fetch(
      `${BACKEND_URL}/api/test/student/${studentId}/results?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );
    return response.json();
  }

  async getStudentResultSummary(studentId: string, page = 1, limit = 10) {
    const response = await fetch(
      `${BACKEND_URL}/api/test/student/${studentId}/summary?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );
    return response.json();
  }
}

export const testService = new TestService();
