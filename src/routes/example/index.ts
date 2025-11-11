import { Router } from "express";
import { authMiddleware } from "@/middleware/authMiddleware";
import { Request, Response, NextFunction } from "express";
import { expressTryCatch } from "@/middleware/globalTryCatch";

export const exampleRouter: Router = Router();

exampleRouter.use(authMiddleware);

// List all reminders for a customer
exampleRouter.get(
  "/list",
  expressTryCatch(async (req: Request, res: Response) => {
    return res.status(200).json({ message: "Hello World" });
  })
);
