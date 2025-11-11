import request from "supertest";
import { Express } from "express";
import express from "express";
import { rolesRouter } from "@/routes/roles";
import { db } from "@/lib/db";

// Create test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use("/api/roles", rolesRouter);
  return app;
};

describe("Roles API", () => {
  let app: Express;
  let testRoleId: string;
  let testUserId: string;

  beforeAll(async () => {
    app = createTestApp();
    
    // Create a test user in the database
    const testUser = await db
      .insertInto("user")
      .values({
        id: "test-user-for-role",
        email: `test-roles-${Date.now()}@example.com`,
        emailVerified: 0,
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning("id")
      .executeTakeFirst();
    
    testUserId = testUser!.id;
  });

  afterAll(async () => {
    // Clean up test roles
    if (testRoleId) {
      await db
        .deleteFrom("user_role")
        .where("id", "=", testRoleId)
        .execute();
    }
    
    // Clean up test user
    if (testUserId) {
      await db
        .deleteFrom("user")
        .where("id", "=", testUserId)
        .execute();
    }
  });

  describe("POST /api/roles", () => {
    it("should assign a role to a user", async () => {
      const roleAssignment = {
        user_id: "test-user-for-role",
        role: "doctor",
      };

      const response = await request(app)
        .post("/api/roles")
        .send(roleAssignment)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.user_id).toBe("test-user-for-role");
      expect(response.body.role).toBe("doctor");

      // Save for cleanup
      testRoleId = response.body.id;
    });

    it("should return 400 if required fields are missing", async () => {
      const invalidAssignment = {
        user_id: "test-user",
        // Missing role
      };

      const response = await request(app)
        .post("/api/roles")
        .send(invalidAssignment)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for invalid role", async () => {
      const invalidRole = {
        user_id: "test-user",
        role: "invalid_role",
      };

      const response = await request(app)
        .post("/api/roles")
        .send(invalidRole)
        .expect(400);

      expect(response.body.error).toContain("must be 'admin' or 'doctor'");
    });

    it("should return 404 if user does not exist", async () => {
      const roleAssignment = {
        user_id: "nonexistent-user-id",
        role: "admin",
      };

      const response = await request(app)
        .post("/api/roles")
        .send(roleAssignment)
        .expect(404);

      expect(response.body.error).toContain("User not found");
    });
  });

  describe("GET /api/roles/:userId", () => {
    it("should get all roles for a user", async () => {
      const userId = "test-user-for-role";

      const response = await request(app)
        .get(`/api/roles/${userId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /api/roles/user/:userId/check", () => {
    it("should return true if user has the role", async () => {
      const userId = "test-user-for-role";

      const response = await request(app)
        .get(`/api/roles/user/${userId}/check`)
        .query({ role: "doctor" })
        .expect(200);

      expect(response.body.hasRole).toBe(true);
    });

    it("should return false if user does not have the role", async () => {
      const response = await request(app)
        .get("/api/roles/user/nonexistent-user/check")
        .query({ role: "admin" })
        .expect(200);

      expect(response.body.hasRole).toBe(false);
    });
  });

  describe("DELETE /api/roles/:id", () => {
    it("should remove a role", async () => {
      // First create a role to delete
      const roleResponse = await request(app)
        .post("/api/roles")
        .send({
          user_id: "test-user-for-role",
          role: "admin",
        });

      const roleId = roleResponse.body.id;

      // Delete the role
      const response = await request(app)
        .delete(`/api/roles/${roleId}`)
        .expect(200);

      expect(response.body.message).toContain("removed successfully");
    });

    it("should return 404 if role not found", async () => {
      const response = await request(app)
        .delete("/api/roles/00000000-0000-0000-0000-000000000000")
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });
});
