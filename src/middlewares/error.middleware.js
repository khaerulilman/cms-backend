import { HTTP_STATUS, ERROR_MESSAGES } from "../constants/http.js";
import * as ErrorClasses from "../utils/errors.js";

export const errorMiddleware = (err, req, res, next) => {
  // Prevent sending response if already sent
  if (res.headersSent) {
    return next(err);
  }

  // Handle custom error classes
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

  if (err instanceof ErrorClasses.AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "JsonWebTokenError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = ERROR_MESSAGES.INVALID_TOKEN;
  } else if (err.name === "TokenExpiredError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = ERROR_MESSAGES.INVALID_TOKEN;
  } else if (err.name === "ValidationError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = err.message;
  } else if (err.message) {
    message = err.message;
  }

  const response = {
    success: false,
    message,
  };

  // Only include stack trace in development mode, but in a cleaner format
  if (process.env.NODE_ENV === "development" && err.details) {
    response.details = err.details;
  }

  return res.status(statusCode).json(response);
};

export default errorMiddleware;
