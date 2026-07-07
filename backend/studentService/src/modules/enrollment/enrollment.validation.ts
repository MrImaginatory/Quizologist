import { z } from "zod";

export const createEnrollmentSchema = z.object({
  faculty_id: z.string().uuid("Invalid faculty ID format"),
  subject_id: z.string().uuid("Invalid subject ID format").optional(),
  topic_id: z.string().uuid("Invalid topic ID format").optional(),
});

export const enrollmentIdParamSchema = z.object({
  id: z.string().uuid("Invalid enrollment ID format"),
});

export const getAllEnrollmentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type EnrollmentIdParam = z.infer<typeof enrollmentIdParamSchema>;
export type GetAllEnrollmentsInput = z.infer<typeof getAllEnrollmentsSchema>;
