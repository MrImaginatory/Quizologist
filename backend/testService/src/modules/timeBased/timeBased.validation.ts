import { z } from "zod";

const selectionSchema = z.object({
  course_id: z.string().uuid("Invalid course ID format"),
  subject_id: z.string().uuid("Invalid subject ID format").optional(),
  topic_id: z.string().uuid("Invalid topic ID format").optional(),
});

export const startTimeBasedSchema = z.object({
  duration_minutes: z.number().int().min(1, "Duration must be at least 1 minute").max(90, "Max duration is 90 minutes"),
  selections: z
    .array(selectionSchema)
    .min(1, "At least one selection is required")
    .max(200, "Maximum 200 selections allowed"),
});

export type StartTimeBasedInput = z.infer<typeof startTimeBasedSchema>;
