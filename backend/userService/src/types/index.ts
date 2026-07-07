import { Request } from "express";
import { JwtPayload } from "../utils/jwtToken";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type UserRole = "admin" | "student" | "teacher";

export interface UserAttributes {
  id: string;
  fname: string;
  lname: string;
  role: UserRole;
  email: string;
  mobileNumber: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateUserInput {
  fname: string;
  lname: string;
  role: UserRole;
  email: string;
  mobileNumber: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
