export const ERRORS = {
  LIMIT_REACHED: {
    key: "LIMIT_REACHED",
    status: 403,
    message: "LIMIT_REACHED",
  },
  USER_NOT_FOUND: {
    key: "USER_NOT_FOUND",
    status: 404,
    message: "USER_NOT_FOUND",
  },
  UNAUTHORIZED: {
    key: "UNAUTHORIZED",
    status: 401,
    message: "UNAUTHORIZED",
  },
  UNSUPPORTED_ACTION: {
    key: "UNSUPPORTED_ACTION",
    status: 403,
    message: "UNSUPPORTED_ACTION",
  },
  NOT_SUBSCRIBED: {
    key: "NOT_SUBSCRIBED",
    status: 403,
    message: "NOT_SUBSCRIBED",
  },
};
// 🔑 Enum-like type automatically from ERRORS
export type ErrorKey = keyof typeof ERRORS;
// "LIMIT_REACHED" | "REMINDER_NOT_FOUND" | "USER_NOT_FOUND" | "UNAUTHORIZED"

// 🔑 Enum-like values (the `key` fields)
export type ErrorCode = (typeof ERRORS)[ErrorKey]["key"];
// "LIMIT_REACHED" | "REMINDER_NOT_FOUND" | "USER_NOT_FOUND" | "UNAUTHORIZED"

// 🔑 (Optional) runtime helper so you can do ERRORS_KEYS.UNAUTHORIZED
export const ERROR_KEYS: Record<ErrorKey, ErrorCode> = Object.fromEntries(
  Object.entries(ERRORS).map(([k, v]) => [k, v.key])
) as Record<ErrorKey, ErrorCode>;
