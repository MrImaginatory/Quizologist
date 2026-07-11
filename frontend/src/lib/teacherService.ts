import { getToken } from "./auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export interface TeacherAssignment {
  id: string;
  name: string; // Faculty name
  subjects: {
    id: string;
    name: string;
    assignment_id: string; // The assignment ID to remove this subject
  }[];
  assignment_id: string; // The assignment ID for the faculty itself
}

class TeacherService {
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

  async assignFaculty(teacherId: string, facultyId: string) {
    const response = await fetch(`${BACKEND_URL}/api/teacher/assign/faculty`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ teacher_id: teacherId, faculty_id: facultyId }),
    });
    return response.json();
  }

  async assignSubject(teacherId: string, facultyId: string, subjectId: string) {
    const response = await fetch(`${BACKEND_URL}/api/teacher/assign/subject`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ teacher_id: teacherId, faculty_id: facultyId, subject_id: subjectId }),
    });
    return response.json();
  }

  async removeAssignment(assignmentId: string) {
    const response = await fetch(`${BACKEND_URL}/api/teacher/${assignmentId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  async getTeacherAssignments(teacherId: string) {
    const response = await fetch(`${BACKEND_URL}/api/teacher/teacher/${teacherId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }
}

export const teacherService = new TeacherService();
