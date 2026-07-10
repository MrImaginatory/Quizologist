import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  JWT_SECRET: process.env.JWT_SECRET || "default_secret",

  USER_SERVICE_URL: process.env.USER_SERVICE_URL || "http://localhost:3001",
  CONTENT_SERVICE_URL: process.env.CONTENT_SERVICE_URL || "http://localhost:3002",
  QUESTION_SERVICE_URL: process.env.QUESTION_SERVICE_URL || "http://localhost:3003",
  STUDENT_SERVICE_URL: process.env.STUDENT_SERVICE_URL || "http://localhost:3004",
  TEST_SERVICE_URL: process.env.TEST_SERVICE_URL || "http://localhost:3005",
  TEACHER_SERVICE_URL: process.env.TEACHER_SERVICE_URL || "http://localhost:3006",
};
