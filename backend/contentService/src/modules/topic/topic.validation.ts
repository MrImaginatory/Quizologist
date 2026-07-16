import { z } from "zod";

export const createTopicSchema = z.object({
  name: z
    .string()
    .min(1, "Topic name is required")
    .max(100, "Topic name must be at most 100 characters"),
  description: z.string().max(1024, "Description must be at most 1024 characters").optional(),
  subject_id: z.string().uuid("Invalid subject ID format"),
});

export const updateTopicSchema = z.object({
  name: z
    .string()
    .min(1, "Topic name is required")
    .max(100, "Topic name must be at most 100 characters")
    .optional(),
  description: z.string().max(1024, "Description must be at most 1024 characters").optional(),
  subject_id: z.string().uuid("Invalid subject ID format").optional(),
});

export const topicIdParamSchema = z.object({
  id: z.string().uuid("Invalid topic ID format"),
});

export const getTopicsBySubjectSchema = z.object({
  subjectId: z.string().uuid("Invalid subject ID format"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
});

export const getAllTopicsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type TopicIdParam = z.infer<typeof topicIdParamSchema>;
export type GetTopicsBySubjectInput = z.infer<typeof getTopicsBySubjectSchema>;
export type GetAllTopicsInput = z.infer<typeof getAllTopicsSchema>;
