import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Custom error class with status code.
 */
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

/**
 * Global error handler middleware.
 * Must be registered LAST in the middleware chain.
 */
export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ err: err.message, stack: err.stack }, "Unhandled error");

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Zod validation error
  if (err.name === "ZodError") {
    res.status(422).json({
      success: false,
      message: "Validasi gagal",
      errors: (err as any).issues,
    });
    return;
  }

  // Default 500
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
    stack: err.stack,
  });
}

/**
 * Async handler wrapper to catch async errors automatically.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
