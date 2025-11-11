import { RequestHandler } from "express";

export const expressTryCatch =
  (
    fn: (...args: Parameters<RequestHandler>) => Promise<unknown>
  ): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
