import { z } from "zod";

const questionTypeEnum = z.enum(["mcq", "descriptive"]);

export const createQuestionSchema = z
  .object({
    type: questionTypeEnum,
    question: z.string().min(1, "Question text is required"),
    choices: z
      .array(z.string().min(1))
      .min(2, "MCQ must have at least 2 choices")
      .max(5, "MCQ can have at most 5 choices")
      .optional(),
    correctAnswer: z.string().min(1, "Correct answer is required"),
    explanation: z.string().optional(),
    videoUrl: z.string().url("Invalid URL format").optional(),
    topic_id: z.string().uuid("Invalid topic ID format"),
    subject_id: z.string().uuid("Invalid subject ID format"),
    faculty_id: z.string().uuid("Invalid faculty ID format"),
  })
  .refine(
    (data) => {
      if (data.type === "mcq") {
        return data.choices && data.choices.length >= 2 && data.choices.length <= 5;
      }
      return true;
    },
    { message: "MCQ must have 2-5 choices", path: ["choices"] }
  )
  .refine(
    (data) => {
      if (data.type === "mcq" && data.choices) {
        return data.choices.includes(data.correctAnswer);
      }
      return true;
    },
    { message: "Correct answer must match one of the choices", path: ["correctAnswer"] }
  )
  .refine(
    (data) => {
      if (data.type === "descriptive") {
        return !data.choices;
      }
      return true;
    },
    { message: "Choices are not allowed for descriptive questions", path: ["choices"] }
  );

export const updateQuestionSchema = z
  .object({
    type: questionTypeEnum.optional(),
    question: z.string().min(1).optional(),
    choices: z
      .array(z.string().min(1))
      .min(2)
      .max(5)
      .optional(),
    correctAnswer: z.string().min(1).optional(),
    explanation: z.string().optional(),
    videoUrl: z.string().url().optional().nullable(),
    topic_id: z.string().uuid().optional(),
    subject_id: z.string().uuid().optional(),
    faculty_id: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "mcq" && data.choices) {
        if (data.correctAnswer) {
          return data.choices.includes(data.correctAnswer);
        }
      }
      return true;
    },
    { message: "Correct answer must match one of the choices", path: ["correctAnswer"] }
  );

export const questionIdParamSchema = z.object({
  id: z.string().uuid("Invalid question ID format"),
});

export const searchQuestionsSchema = z.object({
  q: z.string().min(1, "Search query is required"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const getQuestionsByTopicSchema = z.object({
  topicId: z.string().uuid("Invalid topic ID format"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const getAllQuestionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type QuestionIdParam = z.infer<typeof questionIdParamSchema>;
export type SearchQuestionsInput = z.infer<typeof searchQuestionsSchema>;
export type GetQuestionsByTopicInput = z.infer<typeof getQuestionsByTopicSchema>;
export type GetAllQuestionsInput = z.infer<typeof getAllQuestionsSchema>;
