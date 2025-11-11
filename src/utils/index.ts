import crypto from "crypto";
import { RequestHandler } from "express";
import { DateTime } from "luxon";
import jwt from "jsonwebtoken";
import { Selectable } from "kysely";
import { User } from "@/types";

export const expressTryCatch =
  (
    fn: (...args: Parameters<RequestHandler>) => Promise<unknown>
  ): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

export function formatTime(time: string, tz: string) {
  return DateTime.fromSQL(time, { zone: tz }).toFormat("hh:mm a");
}
export function formatDay(day: string, tz: string) {
  return DateTime.fromISO(day, { zone: tz }).toLocaleString(DateTime.DATE_MED);
}

// 128-bit opaque code, URL-safe, not for humans to type
export function generateOpaqueCode(bytes = 16) {
  return crypto.randomBytes(bytes).toString("base64url"); // ~22 chars
}

// Hash the code for DB storage (HMAC with server secret)
export function hashCode(code: string) {
  return crypto
    .createHmac("sha256", process.env.PHONE_SECRET!)
    .update(code)
    .digest("base64url");
}

export function safeEqual(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

export function generateUnsubscribeToken(
  user: Selectable<User>,
  type: "reminders" | "global",
  expiresIn: number = 3 * 24 * 60 * 60
) {
  return jwt.sign({ u: user.id, type: type }, process.env.EMAIL_SECRET!, {
    algorithm: "HS256",
    expiresIn: expiresIn,
  });
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function batchAndExecute<T>(
  items: T[],
  batchSize: number,
  delayMs: number,
  fn: (batch: T[]) => Promise<{ data: any; error: Error | null }>
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await fn(batch);
    if (i + batchSize < items.length) {
      await sleep(delayMs);
    }
  }
}
