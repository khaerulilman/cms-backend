import { HTTP_STATUS } from "../constants/http.js";

export const errorMiddleware = (err, req, res, next) => {
  console.error("Error:", {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
  });

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { error: err.stack }),
  });
};

export default errorMiddleware;
