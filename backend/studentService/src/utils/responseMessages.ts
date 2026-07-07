export const RESPONSE_MESSAGES = {
  SUCCESS: {
    ENROLLED: "Enrolled successfully",
    UNENROLLED: "Unenrolled successfully",
    ENROLLMENT_FOUND: "Enrollment retrieved successfully",
    ENROLLMENTS_FOUND: "Enrollments retrieved successfully",
  },
  ERROR: {
    ENROLLMENT_NOT_FOUND: "Enrollment not found",
    ENROLLMENT_EXISTS: "Already enrolled in this combination",
    FACULTY_NOT_FOUND: "Faculty not found or has been deleted",
    SUBJECT_NOT_FOUND: "Subject not found or has been deleted",
    TOPIC_NOT_FOUND: "Topic not found or has been deleted",
    SUBJECT_FACULTY_MISMATCH: "Subject does not belong to the specified faculty",
    TOPIC_SUBJECT_MISMATCH: "Topic does not belong to the specified subject",
    VALIDATION_ERROR: "Validation failed",
    INTERNAL_ERROR: "Internal server error",
  },
} as const;
