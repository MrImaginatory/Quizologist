import { getToken } from "./auth";

export interface Student {
  id: string;
  fname: string;
  lname: string;
  email: string;
  mobileNumber: string;
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

export interface GetFilteredStudentsResponse {
  success: boolean;
  message: string;
  data: {
    students: Student[];
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

  async getStudentsWithFilters(
    page = 1,
    limit = 10,
    filters?: { faculty_id?: string; subject_id?: string; topic_id?: string }
  ): Promise<GetFilteredStudentsResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters?.faculty_id) queryParams.append("faculty_id", filters.faculty_id);
    if (filters?.subject_id) queryParams.append("subject_id", filters.subject_id);
    if (filters?.topic_id) queryParams.append("topic_id", filters.topic_id);

    const response = await fetch(
      `${BACKEND_URL}/api/student/list?${queryParams.toString()}`,
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
