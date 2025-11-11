// Mock better-auth before any imports
jest.mock("better-auth", () => ({
  betterAuth: jest.fn(() => ({
    handler: jest.fn(),
    api: {
      getSession: jest.fn(),
    },
  })),
}));

jest.mock("better-auth/node", () => ({
  fromNodeHeaders: jest.fn(),
}));

jest.mock("better-auth/plugins", () => ({
  openAPI: jest.fn(),
}));

// Mock authMiddleware to bypass authentication in tests
jest.mock("@/middleware/authMiddleware", () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    // Mock user for tests
    req.user = {
      id: "test-user-id",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    req.user_id = "test-user-id";
    next();
  },
}));

// Test setup file
import { db } from "@/lib/db";

// Clean up database connections after all tests
afterAll(async () => {
  await db.destroy();
});

// Increase timeout for database operations
jest.setTimeout(30000);
