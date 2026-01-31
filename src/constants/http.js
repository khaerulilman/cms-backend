export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const ERROR_MESSAGES = {
  // Auth errors
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_ALREADY_EXISTS: "Email already exists. Please use a different email or login instead",
  INVALID_TOKEN: "Invalid or expired token",
  NO_TOKEN_PROVIDED: "No token provided",
  INVALID_REFRESH_TOKEN: "Invalid refresh token",

  // Validation errors
  EMAIL_REQUIRED: "Email is required",
  PASSWORD_REQUIRED: "Password is required",
  NAME_REQUIRED: "Name is required",
  EMAIL_INVALID: "Invalid email format",
  PASSWORD_WEAK: "Password must be at least 8 characters long",
  NAME_TOO_SHORT: "Name must be at least 2 characters",
  NAME_TOO_LONG: "Name must not exceed 100 characters",
  VALIDATION_ERROR: "Validation error",

  // API Key errors
  API_KEY_NOT_FOUND: "API key not found",

  // Server errors
  DATABASE_ERROR: "Database error",
  INTERNAL_SERVER_ERROR: "Internal server error",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Resource not found",
};

export const SUCCESS_MESSAGES = {
  USER_REGISTERED: "User registered successfully",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  PROFILE_RETRIEVED: "Profile retrieved successfully",
  TOKEN_REFRESHED: "Token refreshed successfully",

  // API Key messages
  API_KEY_GENERATED: "API key generated successfully",
  API_KEYS_RETRIEVED: "API keys retrieved successfully",
  API_KEY_DELETED: "API key deleted successfully",
};

export default {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
