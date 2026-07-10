const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        success: false,
        message: data.message || "An error occurred",
        status: response.status,
        data: data.data || data.errors,
      };
    }

    return data;
  }

  async signup(input: import("../types").SignupInput) {
    return this.request("/api/user/signup", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async login(input: import("../types").LoginInput) {
    return this.request("/api/user/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
}

export const api = new ApiClient(BACKEND_URL);
