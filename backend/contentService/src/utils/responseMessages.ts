export const RESPONSE_MESSAGES = {
  SUCCESS: {
    COURSE_CREATED: "Course created successfully",
    COURSE_UPDATED: "Course updated successfully",
    COURSE_DELETED: "Course deleted successfully",
    COURSE_FOUND: "Course retrieved successfully",
    COURSES_FOUND: "Courses retrieved successfully",

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
    COURSE_EXISTS: "Course with this name already exists",
    COURSE_NOT_FOUND: "Course not found or has been deleted",
    COURSE_HAS_SUBJECTS: "Cannot delete course — subjects are still linked to it",

    SUBJECT_EXISTS: "Subject with this name already exists in this course",
    SUBJECT_NOT_FOUND: "Subject not found or has been deleted",
    SUBJECT_HAS_TOPICS: "Cannot delete subject — topics are still linked to it",

    TOPIC_EXISTS: "Topic with this name already exists in this subject",
    TOPIC_NOT_FOUND: "Topic not found or has been deleted",
    TOPIC_HAS_QUESTIONS: "Cannot delete topic — questions are still linked to it",

    VALIDATION_ERROR: "Validation failed",
    INTERNAL_ERROR: "Internal server error",
  },
} as const;
