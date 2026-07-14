import { z } from "zod";

// Duration limits configuration
export const DURATION_LIMITS: Record<number, { min: number; max: number }> = {
  15: { min: 15, max: 30 },
  20: { min: 20, max: 40 },
  25: { min: 25, max: 50 },
  30: { min: 30, max: 60 },
  40: { min: 30, max: 80 },
  45: { min: 40, max: 120 },
};

export const ALLOWED_DURATIONS = Object.keys(DURATION_LIMITS).map(Number);

// Selection schema for each course/subject/topic selection
const selectionSchema = z.object({
  course_id: z.string().uuid("Invalid course ID format"),
  subject_id: z.string().uuid("Invalid subject ID format").optional(),
  topic_id: z.string().uuid("Invalid topic ID format").optional(),
});

// Updated start test schema
export const startTestSchema = z.object({
  duration_minutes: z
    .number()
    .int()
    .refine((val) => ALLOWED_DURATIONS.includes(val), {
      message: `Duration must be one of: ${ALLOWED_DURATIONS.join(", ")}`,
    }),
  question_limit: z.number().int().min(1, "Question limit must be at least 1"),
  selections: z
    .array(selectionSchema)
    .min(1, "At least one selection is required")
    .max(200, "Maximum 200 selections allowed"),
});

export const testIdParamSchema = z.object({
  testId: z.string().min(1, "Test ID is required"),
});

export const getTestsByStudentSchema = z.object({
  studentId: z.string().uuid("Invalid student ID format"),
});

export const getAllTestsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["pending", "in_progress", "completed", "abandoned"]).optional(),
  subjectId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Helper to validate question limit against duration
export function validateQuestionLimit(
  durationMinutes: number,
  questionLimit: number
): { valid: boolean; message?: string } {
  const limits = DURATION_LIMITS[durationMinutes];
  if (!limits) {
    return { valid: false, message: "Invalid duration" };
  }
  if (questionLimit < limits.min || questionLimit > limits.max) {
    return {
      valid: false,
      message: `Question limit must be between ${limits.min} and ${limits.max} for ${durationMinutes} minutes`,
    };
  }
  return { valid: true };
}

export type StartTestInput = z.infer<typeof startTestSchema>;
export type TestIdParam = z.infer<typeof testIdParamSchema>;
export type GetTestsByStudentInput = z.infer<typeof getTestsByStudentSchema>;
export type GetAllTestsInput = z.infer<typeof getAllTestsSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
