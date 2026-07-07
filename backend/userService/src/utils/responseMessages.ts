export const RESPONSE_MESSAGES = {
  SUCCESS: {
    USER_CREATED: "User registered successfully",
    LOGIN_SUCCESS: "Login successful",
    USER_FOUND: "User retrieved successfully",
    USERS_FOUND: "Users retrieved successfully",
    USER_UPDATED: "User updated successfully",
    USER_DELETED: "User deleted successfully",
    TOKEN_VALID: "Token is valid",
  },
  ERROR: {
    USER_EXISTS: "User with this email already exists",
    USER_NOT_FOUND: "User not found",
    INVALID_CREDENTIALS: "Invalid email or password",
    VALIDATION_ERROR: "Validation failed",
    UNAUTHORIZED: "Unauthorized access",
    TOKEN_MISSING: "Token is required",
    TOKEN_INVALID: "Invalid or expired token",
    INTERNAL_ERROR: "Internal server error",
    ACCOUNT_DEACTIVATED: "Account has been deactivated",
  },
} as const;
