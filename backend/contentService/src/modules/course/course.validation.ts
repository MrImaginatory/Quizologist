import { z } from "zod";

export const createCourseSchema = z.object({
  name: z
    .string()
    .min(1, "Course name is required")
    .max(100, "Course name must be at most 100 characters"),
  description: z.string().max(1024, "Description must be at most 1024 characters").optional(),
});

export const updateCourseSchema = z.object({
  name: z
    .string()
    .min(1, "Course name is required")
    .max(100, "Course name must be at most 100 characters")
    .optional(),
  description: z.string().max(1024, "Description must be at most 1024 characters").optional(),
});

export const courseIdParamSchema = z.object({
  id: z.string().uuid("Invalid course ID format"),
});

export const getAllCourseSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseIdParam = z.infer<typeof courseIdParamSchema>;
export type GetAllCourseInput = z.infer<typeof getAllCourseSchema>;
