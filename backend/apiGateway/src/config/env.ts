import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "5001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  JWT_SECRET: process.env.JWT_SECRET || "default_secret",

  USER_SERVICE_URL: process.env.USER_SERVICE_URL || "http://localhost:3011",
  CONTENT_SERVICE_URL: process.env.CONTENT_SERVICE_URL || "http://localhost:3012",
  QUESTION_SERVICE_URL: process.env.QUESTION_SERVICE_URL || "http://localhost:3013",
  STUDENT_SERVICE_URL: process.env.STUDENT_SERVICE_URL || "http://localhost:3014",
  TEST_SERVICE_URL: process.env.TEST_SERVICE_URL || "http://localhost:3015",
  TEACHER_SERVICE_URL: process.env.TEACHER_SERVICE_URL || "http://localhost:3016",
  DASHBOARD_SERVICE_URL: process.env.DASHBOARD_SERVICE_URL || "http://localhost:3017",
};
