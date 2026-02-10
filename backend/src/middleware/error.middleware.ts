import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Factory functions for common errors
export const NotFoundError = (message = "Resource not found") =>
  new ApiError(404, "NOT_FOUND", message);

export const ValidationError = (message: string) =>
  new ApiError(400, "VALIDATION_ERROR", message);

export const InternalError = (message = "Internal server error") =>
  new ApiError(500, "INTERNAL_ERROR", message);

// 404 handler for unmatched routes
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

// Global error handler
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log error details
  if (process.env.NODE_ENV === "development") {
    logger.error("Error occurred:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  } else {
    logger.error("Error occurred:", { message: err.message });
  }

  // Handle known API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}
