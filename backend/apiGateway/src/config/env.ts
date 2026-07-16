import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT!, 10),
  NODE_ENV: process.env.NODE_ENV!,

  JWT_SECRET: process.env.JWT_SECRET!,

  USER_SERVICE_URL: process.env.USER_SERVICE_URL!,
  CONTENT_SERVICE_URL: process.env.CONTENT_SERVICE_URL!,
  QUESTION_SERVICE_URL: process.env.QUESTION_SERVICE_URL!,
  STUDENT_SERVICE_URL: process.env.STUDENT_SERVICE_URL!,
  TEST_SERVICE_URL: process.env.TEST_SERVICE_URL!,
  TEACHER_SERVICE_URL: process.env.TEACHER_SERVICE_URL!,
  DASHBOARD_SERVICE_URL: process.env.DASHBOARD_SERVICE_URL!,
};
