export const RESPONSE_MESSAGES = {
  SUCCESS: {
    FACULTY_CREATED: "Faculty created successfully",
    FACULTY_UPDATED: "Faculty updated successfully",
    FACULTY_DELETED: "Faculty deleted successfully",
    FACULTY_FOUND: "Faculty retrieved successfully",
    FACULTIES_FOUND: "Faculties retrieved successfully",

    SUBJECT_CREATED: "Subject created successfully",
    SUBJECT_UPDATED: "Subject updated successfully",
    SUBJECT_DELETED: "Subject deleted successfully",
    SUBJECT_FOUND: "Subject retrieved successfully",
    SUBJECTS_FOUND: "Subjects retrieved successfully",

    TOPIC_CREATED: "Topic created successfully",
    TOPIC_UPDATED: "Topic updated successfully",
    TOPIC_DELETED: "Topic deleted successfully",
    TOPIC_FOUND: "Topic retrieved successfully",
    TOPICS_FOUND: "Topics retrieved successfully",
  },
  ERROR: {
    FACULTY_EXISTS: "Faculty with this name already exists",
    FACULTY_NOT_FOUND: "Faculty not found or has been deleted",
    FACULTY_HAS_SUBJECTS: "Cannot delete faculty — subjects are still linked to it",

    SUBJECT_EXISTS: "Subject with this name already exists in this faculty",
    SUBJECT_NOT_FOUND: "Subject not found or has been deleted",
    SUBJECT_HAS_TOPICS: "Cannot delete subject — topics are still linked to it",

    TOPIC_EXISTS: "Topic with this name already exists in this subject",
    TOPIC_NOT_FOUND: "Topic not found or has been deleted",
    TOPIC_HAS_QUESTIONS: "Cannot delete topic — questions are still linked to it",

    VALIDATION_ERROR: "Validation failed",
    INTERNAL_ERROR: "Internal server error",
  },
} as const;
