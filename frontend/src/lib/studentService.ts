import { getToken } from "./auth";

export interface Student {
  id: string;
  fname: string;
  lname: string;
  email: string;
  mobilenumber: string;
  role: "student";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Enrollment {
  id: string;
  student_id: string;
  faculty_id: string;
  subject_id: string | null;
  topic_id: string | null;
  faculty?: { id: string; name: string };
  subject?: { id: string; name: string };
  topic?: { id: string; name: string };
}

export interface StudentWithEnrollments extends Student {
  enrollments?: Enrollment[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface GetStudentsResponse {
  success: boolean;
  message: string;
  data: {
    users: Student[];
    pagination: Pagination;
  };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

class StudentService {
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

  async getStudents(page = 1, limit = 10): Promise<GetStudentsResponse> {
    const response = await fetch(
      `${BACKEND_URL}/api/user/role/student?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );
    return response.json();
  }

  async getStudentById(id: string) {
    const response = await fetch(`${BACKEND_URL}/api/user/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }
}

export const studentService = new StudentService();
