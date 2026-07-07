import { Request } from "express";
import { JwtPayload } from "../utils/jwtToken";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type QuestionType = "mcq" | "descriptive";

export interface QuestionAttributes {
  id: string;
  type: QuestionType;
  question: string;
  choices: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  videoUrl: string | null;
  topic_id: string;
  subject_id: string;
  faculty_id: string;
  questionAddedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
