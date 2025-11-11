import { Router, Request, Response } from "express";
import { db } from "@/lib/db";
import { expressTryCatch } from "@/middleware/globalTryCatch";
import { authMiddleware } from "@/middleware/authMiddleware";

const router = Router();

// All role routes require authentication
router.use(authMiddleware);

/**
 * POST /api/roles
 * Assign a role to a user (admin only)
 */
router.post(
  "/",
  expressTryCatch(async (req: Request, res: Response) => {
    const { user_id, role } = req.body;

    // Validate input
    if (!user_id || !role) {
      return res.status(400).json({ 
        error: "user_id and role are required" 
      });
    }

    if (!["admin", "doctor"].includes(role)) {
      return res.status(400).json({ 
        error: "role must be 'admin' or 'doctor'" 
      });
    }

    // Check if user exists
    const user = await db
      .selectFrom("user")
      .select("id")
      .where("id", "=", user_id)
      .executeTakeFirst();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if role already exists
    const existingRole = await db
      .selectFrom("user_role")
      .select("id")
      .where("user_id", "=", user_id)
      .where("role", "=", role)
      .executeTakeFirst();

    if (existingRole) {
      return res.status(400).json({ 
        error: "User already has this role" 
      });
    }

    // Create role
    const newRole = await db
      .insertInto("user_role")
      .values({
        user_id,
        role,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    res.status(201).json(newRole);
  })
);

/**
 * GET /api/roles/:userId
 * Get all roles for a user
 */
router.get(
  "/:userId",
  expressTryCatch(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const roles = await db
      .selectFrom("user_role")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();

    res.json(roles);
  })
);

/**
 * GET /api/roles/user/:userId/check
 * Check if user has a specific role
 */
router.get(
  "/user/:userId/check",
  expressTryCatch(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role } = req.query;

    if (!role || typeof role !== "string") {
      return res.status(400).json({ error: "role query parameter is required" });
    }

    const userRole = await db
      .selectFrom("user_role")
      .select("id")
      .where("user_id", "=", userId)
      .where("role", "=", role)
      .executeTakeFirst();

    res.json({ 
      hasRole: !!userRole,
      role 
    });
  })
);

/**
 * DELETE /api/roles/:id
 * Remove a role from a user (admin only)
 */
router.delete(
  "/:id",
  expressTryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;

    const deletedRole = await db
      .deleteFrom("user_role")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    if (!deletedRole) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json({ 
      message: "Role removed successfully",
      role: deletedRole 
    });
  })
);

export const rolesRouter = router;
