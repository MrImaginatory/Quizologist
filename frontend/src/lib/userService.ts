import { getToken } from "./auth";

export interface User {
  id: string;
  fname: string;
  lname: string;
  email: string;
  mobileNumber: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface GetUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: Pagination;
  };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

class UserService {
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

  async getUsersByRole(role: string, page = 1, limit = 10): Promise<GetUsersResponse> {
    const response = await fetch(
      `${BACKEND_URL}/api/user/role/${role}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );
    return response.json();
  }

  async getAllUsers(page = 1, limit = 10): Promise<GetUsersResponse> {
    const response = await fetch(
      `${BACKEND_URL}/api/user?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );
    return response.json();
  }
}

export const userService = new UserService();
