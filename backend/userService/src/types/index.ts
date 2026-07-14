import { Request } from "express";
import { JwtPayload } from "../utils/jwtToken";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type UserRole = "admin" | "student" | "teacher";

export interface LocationAttributes {
  id: string;
  address_line_1: string;
  address_line_2: string | null;
  landmark: string | null;
  city: string;
  pincode: string;
  state: string;
  country: string;
  is_central: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface UserAttributes {
  id: string;
  fname: string;
  lname: string;
  role: UserRole;
  email: string;
  mobileNumber: string;
  password: string;
  location_id: string | null;
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
