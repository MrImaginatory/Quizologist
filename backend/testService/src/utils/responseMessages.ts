export const RESPONSE_MESSAGES = {
  SUCCESS: {
    TEST_STARTED: "Test started successfully",
    TEST_FOUND: "Test retrieved successfully",
    TESTS_FOUND: "Tests retrieved successfully",
    RESULT_FOUND: "Result retrieved successfully",
    TEST_SUBMITTED: "Test submitted successfully",
  },
  ERROR: {
    TEST_NOT_FOUND: "Test not found",
    TEST_NOT_COMPLETED: "Test has not been completed yet",
    TEST_ALREADY_ACTIVE: "You already have an active test",
    TEST_RATE_LIMITED: "Please wait before creating another test",
    NO_ENROLLMENT: "You are not enrolled in this subject/topic",
    NO_QUESTIONS: "No questions found for the selected scope",
    VALIDATION_ERROR: "Validation failed",
    INTERNAL_ERROR: "Internal server error",
  },
} as const;
