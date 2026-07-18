import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "3005", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "5432", 10),
  DB_NAME: process.env.DB_NAME || "quizologist_database",
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "root",
  DB_ALTER_TABLES: process.env.DB_ALTER_TABLES === "true",
  DB_DROP_TABLES: process.env.DB_DROP_TABLES === "true",

  JWT_SECRET: process.env.JWT_SECRET || "default_secret",

  // Predefined test validation (in minutes)
  PREDEFINED_TEST_MIN_STUDENT_ASSIGN_MINUTES: parseInt(process.env.PREDEFINED_TEST_MIN_STUDENT_ASSIGN_MINUTES || "15", 10),
  PREDEFINED_TEST_MIN_DEACTIVATE_MINUTES: parseInt(process.env.PREDEFINED_TEST_MIN_DEACTIVATE_MINUTES || "15", 10),
};
