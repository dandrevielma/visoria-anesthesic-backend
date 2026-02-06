import { auth } from "@/lib/auth";
import { NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { Request, Response } from "express";
import { User } from "@/types";
import { getUser } from "@/db/user";
import { ERROR_KEYS } from "@/utils/errors";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await auth.api.getSession({
    headers: {
      ...fromNodeHeaders(req.headers),
      // Ensure cookies are included
      cookie: req.headers.cookie || '',
    },
  });

  if (!session) {
    return next(new Error("UNAUTHORIZED"));
  }

  req.user_id = session.user.id as string;
  const user = await getUser(req.user_id);
  if (!user) return next(new Error(ERROR_KEYS.USER_NOT_FOUND));
  req.user = user;
  next();
};
