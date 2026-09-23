import { Request } from 'express';
import { JwtPayload } from '../utils/jwtToken';



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




export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type QuestionType = "mcq" | "descriptive";
export type DifficultyLevel = "beginner" | "normal" | "mid" | "hard" | "expert";

export interface QuestionAttributes {
  id: string;
  type: QuestionType;
  question: string;
  choices: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  videoUrl: string | null;
  difficulty: DifficultyLevel;
  difficulty_score: number;
  topic_id: string;
  subject_id: string;
  course_id: string;
  questionAddedBy: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}




export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface CourseAttributes {
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
  course_id: string;
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



export type TestStatus = "pending" | "in_progress" | "completed" | "abandoned";
