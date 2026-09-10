import type { Response } from "express";

interface SuccessResponseOptions {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: Record<string, unknown>;
}

export const successResponse = ({ res, statusCode = 200, message = "Done", data = {} }: SuccessResponseOptions) => {
  return res.status(statusCode).json({ message, data });
};
