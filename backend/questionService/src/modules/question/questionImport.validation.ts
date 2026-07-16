import { z } from "zod";

const bulkQuestionSchema = z.object({
  type: z.literal("mcq"),
  question: z.string().min(1, "Question text is required"),
  choices: z
    .array(z.string())
    .min(2, "At least 2 options are required")
    .max(5, "At most 5 options allowed"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional(),
  videoUrl: z.string().optional(),
  difficulty: z.string().optional(),
  topic_id: z.string().uuid("Invalid topic ID format"),
  subject_id: z.string().uuid("Invalid subject ID format"),
  course_id: z.string().uuid("Invalid course ID format"),
  questionAddedBy: z.string().optional(),
});

export const bulkQuestionsSchema = z.object({
  questions: z
    .array(bulkQuestionSchema)
    .min(1, "At least one question is required")
    .max(500, "Maximum 500 questions per import"),
});

export type BulkQuestionInput = z.infer<typeof bulkQuestionSchema>;
export type BulkQuestionsInput = z.infer<typeof bulkQuestionsSchema>;
