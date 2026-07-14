import { Request } from "express";
import { JwtPayload } from "../utils/jwtToken";

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
  topic_id: string;
  subject_id: string;
  course_id: string;
  questionAddedBy: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
