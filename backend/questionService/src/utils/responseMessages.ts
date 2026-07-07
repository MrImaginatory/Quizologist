export const RESPONSE_MESSAGES = {
  SUCCESS: {
    QUESTION_CREATED: "Question created successfully",
    QUESTION_UPDATED: "Question updated successfully",
    QUESTION_DELETED: "Question deleted successfully",
    QUESTION_FOUND: "Question retrieved successfully",
    QUESTIONS_FOUND: "Questions retrieved successfully",
  },
  ERROR: {
    QUESTION_NOT_FOUND: "Question not found",
    INVALID_QUESTION_TYPE: "Invalid question type",
    INVALID_CHOICES: "MCQ must have 2-5 choices",
    CHOICES_REQUIRED: "Choices are required for MCQ questions",
    CHOICES_NOT_ALLOWED: "Choices are not allowed for descriptive questions",
    CORRECT_ANSWER_REQUIRED: "Correct answer is required",
    CORRECT_ANSWER_NOT_IN_CHOICES: "Correct answer must match one of the choices",
    TOPIC_NOT_FOUND: "Topic not found",
    SUBJECT_NOT_FOUND: "Subject not found",
    FACULTY_NOT_FOUND: "Faculty not found",
    VALIDATION_ERROR: "Validation failed",
    INTERNAL_ERROR: "Internal server error",
    FORBIDDEN: "You do not have permission to perform this action",
  },
} as const;
