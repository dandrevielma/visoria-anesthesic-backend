import { ERRORS } from "@/utils/errors";
import { NextFunction, Request, Response } from "express";

export async function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error = ERRORS[err.message as keyof typeof ERRORS];
  console.log(err);
  console.log(error);
  if (error) {
    return res.status(error.status).json({ error: error.message });
  }
  return res.status(500).json({ error: "Internal server error" });
}
