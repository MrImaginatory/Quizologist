import { z } from "zod";

export const createFacultySchema = z.object({
  name: z
    .string()
    .min(1, "Faculty name is required")
    .max(100, "Faculty name must be at most 100 characters"),
  description: z.string().max(1024, "Description must be at most 1024 characters").optional(),
});

export const updateFacultySchema = z.object({
  name: z
    .string()
    .min(1, "Faculty name is required")
    .max(100, "Faculty name must be at most 100 characters")
    .optional(),
  description: z.string().max(1024, "Description must be at most 1024 characters").optional(),
});

export const facultyIdParamSchema = z.object({
  id: z.string().uuid("Invalid faculty ID format"),
});

export const getAllFacultySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateFacultyInput = z.infer<typeof createFacultySchema>;
export type UpdateFacultyInput = z.infer<typeof updateFacultySchema>;
export type FacultyIdParam = z.infer<typeof facultyIdParamSchema>;
export type GetAllFacultyInput = z.infer<typeof getAllFacultySchema>;
