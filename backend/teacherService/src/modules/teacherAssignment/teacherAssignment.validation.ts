import { z } from "zod";

const uuidSchema = z.string().uuid("Invalid UUID format");

export const assignCourseSchema = z.object({
  teacher_id: uuidSchema,
  course_id: uuidSchema,
});

export const assignSubjectSchema = z.object({
  teacher_id: uuidSchema,
  course_id: uuidSchema,
  subject_id: uuidSchema,
});

export const bulkAssignSubjectsSchema = z.object({
  teacher_id: uuidSchema,
  course_id: uuidSchema,
  subject_ids: z.array(uuidSchema).optional(),
});

export const getAssignmentsSchema = z.object({
  teacher_id: uuidSchema.optional(),
  course_id: uuidSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const getTeacherAssignmentsSchema = z.object({
  teacherId: uuidSchema,
});

export const getTeachingStudentsSchema = z.object({
  course_id: uuidSchema.optional(),
  subject_id: uuidSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const getTeachingTestsSchema = z.object({
  course_id: uuidSchema.optional(),
  subject_id: uuidSchema.optional(),
  status: z.enum(["pending", "in_progress", "completed", "abandoned"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type AssignCourseInput = z.infer<typeof assignCourseSchema>;
export type AssignSubjectInput = z.infer<typeof assignSubjectSchema>;
export type BulkAssignSubjectsInput = z.infer<typeof bulkAssignSubjectsSchema>;
export type GetAssignmentsInput = z.infer<typeof getAssignmentsSchema>;
export type GetTeacherAssignmentsInput = z.infer<typeof getTeacherAssignmentsSchema>;
export type GetTeachingStudentsInput = z.infer<typeof getTeachingStudentsSchema>;
export type GetTeachingTestsInput = z.infer<typeof getTeachingTestsSchema>;
