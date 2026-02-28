import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { db } from "./db";
import { sendResetPasswordEmail, sendVerifyEmail } from "./resend";
import { openAPI } from "better-auth/plugins";

const defaultTrustedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://visoria-anesthesic-frontend.vercel.app",
  "https://visoria-anesthesic-frontend-production.up.railway.app",
  "https://anestesiologos.visoriaconsulting.com",
];

const envTrustedOrigins = (process.env.TRUSTED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const trustedOrigins = Array.from(
  new Set([...defaultTrustedOrigins, ...envTrustedOrigins]),
);

export const auth = betterAuth({
  baseURL: process.env.BASE_URL!,
  database: {
    db: db,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendResetPasswordEmail({
        email: user.email,
        url: `${process.env.WEBSITE_URL}/reset-password?token=${token}`,
        name: user.name,
      });
    },
    onPasswordReset: async ({ user }, request) => {},
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: false, // Disable email verification on sign-in for now
    sendVerificationEmail: async ({ token, url, user }, request) => {
      const newUrl = new URL(url);
      newUrl.searchParams.set(
        "callbackURL",
        `${process.env.WEBSITE_URL}/verify-email`
      );
      await sendVerifyEmail({
        email: user.email,
        url: newUrl.toString(),
        name: user.name,
      });
    },
  },

  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //     redirectUri: `${process.env.BASE_URL}/api/auth/callback/google`,
  //     prompt: "select_account",
  //   },
  //   discord: {
  //     clientId: process.env.DISCORD_CLIENT_ID!,
  //     clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  //     redirectUri: `${process.env.BASE_URL}/api/auth/callback/discord`,
  //   },
  //   apple: {
  //     clientId: process.env.APPLE_CLIENT_ID!,
  //     clientSecret: process.env.APPLE_CLIENT_SECRET!,
  //     redirectURI: `${process.env.BASE_URL}/api/auth/callback/apple`,
  //   },
  // },
  trustedOrigins,
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production", // Only in production
    cookieOptions: {
      sameSite: "lax", // Changed to lax since we're using proxy (same-site)
      secure: process.env.NODE_ENV === "production", // Only secure in production
      httpOnly: true, // Prevent XSS attacks
      path: "/", // Available on all paths
    },
  },
  plugins: [openAPI()],
});
