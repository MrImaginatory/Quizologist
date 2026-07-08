export interface User {
  id: string;
  fname: string;
  lname: string;
  role: "student" | "teacher" | "admin";
  email: string;
  mobilenumber: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface SignupInput {
  fname: string;
  lname: string;
  role: "student" | "teacher";
  email: string;
  mobilenumber: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ApiError {
  success: boolean;
  message: string;
  data: null;
}
