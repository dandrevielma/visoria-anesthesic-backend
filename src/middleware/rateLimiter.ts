// rateLimiter.ts
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import type { Request, Response } from "express";

export const verifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3, // 5 attempts per window
  standardHeaders: "draft-8", // combined RateLimit header
  legacyHeaders: false,
  // Safely key per-user, else per-IP (IPv6-safe)
  keyGenerator: (req: Request, res: Response) => {
    if ((req as any).user_id) return `u:${(req as any).user_id}`;
    return ipKeyGenerator(req.ip as string);
  },
  message: { error: "Too many verification attempts. Try again later." },
});
