import { Router, Request, Response } from "express";
import { db } from "@/lib/db";
import { expressTryCatch } from "@/middleware/globalTryCatch";
import { authMiddleware } from "@/middleware/authMiddleware";

const router = Router();

// All patient routes require authentication
router.use(authMiddleware);

/**
 * GET /api/patients
 * List all patients with optional search
 */
router.get(
  "/",
  expressTryCatch(async (req: Request, res: Response) => {
    const { search, limit = "50", offset = "0" } = req.query;

    let query = db.selectFrom("patient").selectAll();

    // Search by identification number, name, or email
    if (search && typeof search === "string") {
      query = query.where((eb) =>
        eb.or([
          eb("identification_number", "ilike", `%${search}%`),
          eb("first_name", "ilike", `%${search}%`),
          eb("last_name", "ilike", `%${search}%`),
          eb("email", "ilike", `%${search}%`),
        ])
      );
    }

    const patients = await query
      .limit(Number(limit))
      .offset(Number(offset))
      .orderBy("created_at", "desc")
      .execute();

    res.json(patients);
  })
);

/**
 * GET /api/patients/:id
 * Get a single patient by ID
 */
router.get(
  "/:id",
  expressTryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;

    const patient = await db
      .selectFrom("patient")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(patient);
  })
);

/**
 * GET /api/patients/identification/:idNumber
 * Find patient by identification number
 */
router.get(
  "/identification/:idNumber",
  expressTryCatch(async (req: Request, res: Response) => {
    const { idNumber } = req.params;

    const patient = await db
      .selectFrom("patient")
      .selectAll()
      .where("identification_number", "=", idNumber)
      .executeTakeFirst();

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(patient);
  })
);

/**
 * POST /api/patients
 * Create a new patient
 */
router.post(
  "/",
  expressTryCatch(async (req: Request, res: Response) => {
    const {
      identification_number,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
    } = req.body;

    // Validate required fields
    if (!identification_number || !first_name || !last_name) {
      return res.status(400).json({
        error: "identification_number, first_name, and last_name are required",
      });
    }

    // Check if patient already exists
    const existing = await db
      .selectFrom("patient")
      .select("id")
      .where("identification_number", "=", identification_number)
      .executeTakeFirst();

    if (existing) {
      return res.status(400).json({
        error: "Patient with this identification number already exists",
      });
    }

    // Create patient
    const newPatient = await db
      .insertInto("patient")
      .values({
        identification_number,
        first_name,
        last_name,
        email: email || null,
        phone: phone || null,
        date_of_birth: date_of_birth || null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    res.status(201).json(newPatient);
  })
);

/**
 * PUT /api/patients/:id
 * Update a patient
 */
router.put(
  "/:id",
  expressTryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      identification_number,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
    } = req.body;

    // Check if patient exists
    const existing = await db
      .selectFrom("patient")
      .select("id")
      .where("id", "=", id)
      .executeTakeFirst();

    if (!existing) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // If changing identification number, check it's not taken
    if (identification_number) {
      const duplicate = await db
        .selectFrom("patient")
        .select("id")
        .where("identification_number", "=", identification_number)
        .where("id", "!=", id)
        .executeTakeFirst();

      if (duplicate) {
        return res.status(400).json({
          error: "Another patient with this identification number already exists",
        });
      }
    }

    // Update patient
    const updated = await db
      .updateTable("patient")
      .set({
        ...(identification_number && { identification_number }),
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
        ...(email !== undefined && { email: email || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(date_of_birth !== undefined && { date_of_birth: date_of_birth || null }),
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();

    res.json(updated);
  })
);

/**
 * DELETE /api/patients/:id
 * Delete a patient (soft delete or hard delete based on records)
 */
router.delete(
  "/:id",
  expressTryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if patient has records
    const hasRecords = await db
      .selectFrom("record")
      .select("id")
      .where("patient_id", "=", id)
      .executeTakeFirst();

    if (hasRecords) {
      return res.status(400).json({
        error: "Cannot delete patient with existing records",
      });
    }

    // Delete patient
    const deleted = await db
      .deleteFrom("patient")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    if (!deleted) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({
      message: "Patient deleted successfully",
      patient: deleted,
    });
  })
);

export const patientsRouter = router;
