import type { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  status?: number;
  extra?: unknown;
}

interface ErrorOptions {
  message?: string | { message?: string };
  status?: number;
  extra?: unknown;
}

export const errorResponse = ({
  message = "An error occurred",
  status = 400,
  extra = undefined,
}: ErrorOptions): never => {
  const errorMessage = typeof message === "string" ? message : message?.message || "An error occurred";
  const error: CustomError = new Error(errorMessage);

  error.status = status;
  error.extra = extra;
  throw error;
};

export const BadRequestException = (message = "Bad Request", extra?: unknown) =>
  errorResponse({ message, status: 400, extra });

export const ConflictException = (message = "Conflict", extra?: unknown) =>
  errorResponse({ message, status: 409, extra });

export const NotFoundException = (message = "Not Found", extra?: unknown) =>
  errorResponse({ message, status: 404, extra });

export const UnauthorizedException = (message = "Unauthorized", extra?: unknown) =>
  errorResponse({ message, status: 401, extra });

export const ForbiddenException = (message = "Forbidden", extra?: unknown) =>
  errorResponse({ message, status: 403, extra });

export const TooManyRequestsException = (message = "Too Many Requests", extra?: unknown) =>
  errorResponse({ message, status: 429, extra });

export const globalErrorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: err.stack || undefined,
    statusCode,
    extra: err.extra || undefined,
  });
};
