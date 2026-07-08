import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export type TestStatus = "pending" | "in_progress" | "completed" | "abandoned";
