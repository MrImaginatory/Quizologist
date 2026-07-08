import { z } from "zod";

export const startTestSchema = z.object({
  subject_id: z.string().uuid("Invalid subject ID format").optional(),
  topic_id: z.string().uuid("Invalid topic ID format").optional(),
});

export const testIdParamSchema = z.object({
  testId: z.string().uuid("Invalid test ID format"),
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

export type StartTestInput = z.infer<typeof startTestSchema>;
export type TestIdParam = z.infer<typeof testIdParamSchema>;
export type GetTestsByStudentInput = z.infer<typeof getTestsByStudentSchema>;
export type GetAllTestsInput = z.infer<typeof getAllTestsSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
