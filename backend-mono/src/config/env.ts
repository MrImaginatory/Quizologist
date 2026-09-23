import dotenv from "dotenv";
dotenv.config();

/**
 * Every environment variable the application reads.
 * If any of these is missing (or empty) from the environment / .env file,
 * validation below throws and the server refuses to start.
 */
const REQUIRED_ENV_VARS = [
  "PORT",
  "NODE_ENV",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "DB_ALTER_TABLES",
  "DB_DROP_TABLES",
  "DB_POOL_MAX",
  "DB_POOL_MIN",
  "DB_POOL_ACQUIRE",
  "DB_POOL_IDLE",
  "CORS_ALLOWED_ORIGINS",
  "REDIS_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "BCRYPT_SALT_ROUNDS",
  "MIN_ATTEMPTS",
  "PREDEFINED_TEST_MIN_DEACTIVATE_MINUTES",
  "LOG_LEVEL",
] as const;

const MIN_JWT_SECRET_LENGTH = 32;

function validateEnv(): void {
  const problems: string[] = [];

  // Loop over every required variable and collect ALL missing/empty ones
  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];
    if (value === undefined || value.trim() === "") {
      problems.push(`${key} is missing or empty`);
    }
  }

  // CRIT-01: never allow a weak/short JWT secret — otherwise tokens can be forged
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.trim().length < MIN_JWT_SECRET_LENGTH) {
    problems.push(
      `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters (got ${jwtSecret.trim().length})`
    );
  }

  if (problems.length > 0) {
    throw new Error(
      [
        "Environment validation failed — the server will NOT start:",
        ...problems.map((p) => `  - ${p}`),
        `Fix these in backend-mono/.env (or the process environment) and restart.`,
      ].join("\n")
    );
  }
}

validateEnv();

// MED-03: development/tunnel origins must never be the production allowlist —
// warn loudly (the real fix is swapping them for your live domain in .env).
if ((process.env.NODE_ENV ?? "").toLowerCase() === "production") {
  const origins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const devOrigins = origins.filter(
    (o) =>
      /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(o) ||
      /\.trycloudflare\.com$/i.test(o)
  );
  if (devOrigins.length > 0) {
    console.warn(
      [
        "[security] MED-03: CORS_ALLOWED_ORIGINS contains development/tunnel origins while NODE_ENV=production:",
        ...devOrigins.map((o) => `         - ${o}`),
        "         Replace them with your real domain(s) before public deployment.",
      ].join("\n")
    );
  }
}

export const env = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  NODE_ENV: process.env.NODE_ENV as string,

  DB_HOST: process.env.DB_HOST as string,
  DB_PORT: parseInt(process.env.DB_PORT || "5432", 10),
  DB_NAME: process.env.DB_NAME as string,
  DB_USER: process.env.DB_USER as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  DB_ALTER_TABLES: process.env.DB_ALTER_TABLES === "true",
  DB_DROP_TABLES: process.env.DB_DROP_TABLES === "true",

  DB_POOL_MAX: parseInt(process.env.DB_POOL_MAX || "20", 10),
  DB_POOL_MIN: parseInt(process.env.DB_POOL_MIN || "5", 10),
  DB_POOL_ACQUIRE: parseInt(process.env.DB_POOL_ACQUIRE || "30000", 10),
  DB_POOL_IDLE: parseInt(process.env.DB_POOL_IDLE || "10000", 10),

  REDIS_URL: process.env.REDIS_URL as string,

  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as string,

  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS as string, 10),
  MIN_ATTEMPTS: parseInt(process.env.MIN_ATTEMPTS as string, 10),
  PREDEFINED_TEST_MIN_DEACTIVATE_MINUTES: parseInt(
    process.env.PREDEFINED_TEST_MIN_DEACTIVATE_MINUTES as string,
    10
  ),

  CORS_ALLOWED_ORIGINS: (process.env.CORS_ALLOWED_ORIGINS as string)
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
};
