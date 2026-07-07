import { Request } from "express";
import { JwtPayload } from "../utils/jwtToken";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface FacultyAttributes {
  id: string;
  name: string;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface SubjectAttributes {
  id: string;
  name: string;
  description: string | null;
  faculty_id: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface TopicAttributes {
  id: string;
  name: string;
  description: string | null;
  subject_id: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
