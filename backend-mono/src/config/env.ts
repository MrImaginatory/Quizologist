import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "5432", 10),
  DB_NAME: process.env.DB_NAME || "quizologist_database",
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "root",
  DB_ALTER_TABLES: process.env.DB_ALTER_TABLES === "true",
  DB_DROP_TABLES: process.env.DB_DROP_TABLES === "true",

  DB_POOL_MAX: parseInt(process.env.DB_POOL_MAX || "20", 10),
  DB_POOL_MIN: parseInt(process.env.DB_POOL_MIN || "5", 10),
  DB_POOL_ACQUIRE: parseInt(process.env.DB_POOL_ACQUIRE || "30000", 10),
  DB_POOL_IDLE: parseInt(process.env.DB_POOL_IDLE || "10000", 10),

  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  JWT_SECRET: process.env.JWT_SECRET || "default_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  MIN_ATTEMPTS: parseInt(process.env.MIN_ATTEMPTS || "3", 10),
  PREDEFINED_TEST_MIN_DEACTIVATE_MINUTES: parseInt(process.env.PREDEFINED_TEST_MIN_DEACTIVATE_MINUTES || "5", 10),
};
