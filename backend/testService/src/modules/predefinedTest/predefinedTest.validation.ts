import { z } from "zod";

const uuidSchema = z.string().uuid("Invalid UUID format");

// Create predefined test schema
export const createPredefinedTestSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be at most 255 characters"),
  description: z.string().max(1000, "Description must be at most 1000 characters").optional(),
  is_scheduled: z.boolean().default(false),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  timezone: z.string().default("UTC"),
  duration_minutes: z.number().int().min(15).max(120),
  question_limit: z.number().int().min(1).max(200),
  difficulty: z.enum(["beginner", "normal", "mid", "hard", "expert", "mixed"]).default("normal"),
  difficulty_ratio: z.object({
    beginner: z.number().min(0).max(100).optional(),
    normal: z.number().min(0).max(100).optional(),
    mid: z.number().min(0).max(100).optional(),
    hard: z.number().min(0).max(100).optional(),
    expert: z.number().min(0).max(100).optional(),
  }).optional(),
  use_fixed_questions: z.boolean().default(false),
  use_specific_students: z.boolean().default(false),
  max_attempts: z.number().int().min(1).max(10).default(1),
  course_ids: z.array(uuidSchema).min(1, "At least one course is required"),
  subject_ids: z.array(uuidSchema).optional(),
  topic_ids: z.array(uuidSchema).optional(),
  fixed_question_ids: z.array(uuidSchema).optional(),
  student_ids: z.array(uuidSchema).optional(),
}).refine(
  (data) => {
    if (data.is_scheduled) {
      return data.start_time && data.end_time;
    }
    return true;
  },
  { message: "start_time and end_time are required when is_scheduled is true" }
).refine(
  (data) => {
    if (data.is_scheduled && data.start_time && data.end_time) {
      return new Date(data.start_time) < new Date(data.end_time);
    }
    return true;
  },
  { message: "start_time must be before end_time" }
).refine(
  (data) => {
    if (data.difficulty_ratio) {
      const values = Object.values(data.difficulty_ratio).filter((v) => v !== undefined);
      const total = values.reduce((sum, v) => sum + (v || 0), 0);
      return total === 100 || total === 0;
    }
    return true;
  },
  { message: "difficulty_ratio percentages must sum to 100" }
);

// Update predefined test schema
export const updatePredefinedTestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  is_scheduled: z.boolean().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  timezone: z.string().optional(),
  duration_minutes: z.number().int().min(15).max(120).optional(),
  question_limit: z.number().int().min(1).max(200).optional(),
  difficulty: z.enum(["beginner", "normal", "mid", "hard", "expert", "mixed"]).optional(),
  difficulty_ratio: z.object({
    beginner: z.number().min(0).max(100).optional(),
    normal: z.number().min(0).max(100).optional(),
    mid: z.number().min(0).max(100).optional(),
    hard: z.number().min(0).max(100).optional(),
    expert: z.number().min(0).max(100).optional(),
  }).optional(),
  use_fixed_questions: z.boolean().optional(),
  use_specific_students: z.boolean().optional(),
  max_attempts: z.number().int().min(1).max(10).optional(),
  course_ids: z.array(uuidSchema).min(1).optional(),
  subject_ids: z.array(uuidSchema).optional(),
  topic_ids: z.array(uuidSchema).optional(),
  fixed_question_ids: z.array(uuidSchema).optional(),
  student_ids: z.array(uuidSchema).optional(),
});

// ID param schema
export const predefinedTestIdParamSchema = z.object({
  id: uuidSchema,
});

// Query schema for listing
export const predefinedTestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["draft", "active", "inactive", "archived"]).optional(),
  course_id: uuidSchema.optional(),
});

// Start test schema
export const startPredefinedTestSchema = z.object({
  test_link_token: z.string().optional(),
});

// Token param schema
export const predefinedTestTokenParamSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export type CreatePredefinedTestInput = z.infer<typeof createPredefinedTestSchema>;
export type UpdatePredefinedTestInput = z.infer<typeof updatePredefinedTestSchema>;
export type PredefinedTestIdParam = z.infer<typeof predefinedTestIdParamSchema>;
export type PredefinedTestQueryInput = z.infer<typeof predefinedTestQuerySchema>;
export type StartPredefinedTestInput = z.infer<typeof startPredefinedTestSchema>;
export type PredefinedTestTokenParam = z.infer<typeof predefinedTestTokenParamSchema>;
