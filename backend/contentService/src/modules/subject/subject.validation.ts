import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z
    .string()
    .min(1, "Subject name is required")
    .max(100, "Subject name must be at most 100 characters"),
  description: z.string().max(1024, "Description must be at most 1024 characters").optional(),
  course_id: z.string().uuid("Invalid course ID format"),
});

export const updateSubjectSchema = z.object({
  name: z
    .string()
    .min(1, "Subject name is required")
    .max(100, "Subject name must be at most 100 characters")
    .optional(),
  description: z.string().max(1024, "Description must be at most 1024 characters").optional(),
  course_id: z.string().uuid("Invalid course ID format").optional(),
});

export const subjectIdParamSchema = z.object({
  id: z.string().uuid("Invalid subject ID format"),
});

export const getSubjectsByCourseSchema = z.object({
  courseId: z.string().uuid("Invalid course ID format"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const getAllSubjectsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type SubjectIdParam = z.infer<typeof subjectIdParamSchema>;
export type GetSubjectsByCourseInput = z.infer<typeof getSubjectsByCourseSchema>;
export type GetAllSubjectsInput = z.infer<typeof getAllSubjectsSchema>;
