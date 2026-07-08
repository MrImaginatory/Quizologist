import { z } from "zod";

const enrollmentItemSchema = z.object({
  faculty_id: z.string().uuid("Invalid faculty ID format"),
  subject_id: z.string().uuid("Invalid subject ID format").optional(),
  topic_id: z.string().uuid("Invalid topic ID format").optional(),
});

export const createEnrollmentSchema = z.object({
  enrollments: z
    .array(enrollmentItemSchema)
    .min(1, "At least one enrollment is required")
    .max(50, "Maximum 50 enrollments per request"),
});

export const enrollmentIdParamSchema = z.object({
  id: z.string().uuid("Invalid enrollment ID format"),
});

export const studentIdParamSchema = z.object({
  studentId: z.string().uuid("Invalid student ID format"),
});

export const getAllEnrollmentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type EnrollmentItemInput = z.infer<typeof enrollmentItemSchema>;
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type EnrollmentIdParam = z.infer<typeof enrollmentIdParamSchema>;
export type StudentIdParam = z.infer<typeof studentIdParamSchema>;
export type GetAllEnrollmentsInput = z.infer<typeof getAllEnrollmentsSchema>;
