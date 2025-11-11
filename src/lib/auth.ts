import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { db } from "./db";
import { sendResetPasswordEmail, sendVerifyEmail } from "./resend";
import { openAPI } from "better-auth/plugins";
export const auth = betterAuth({
  baseURL: process.env.BASE_URL!,
  database: {
    db: db,
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
    sendOnSignIn: true,
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
  trustedOrigins: [
    "localhost:3000",
    "http://localhost:3000"
  ],
  plugins: [openAPI()],
});
