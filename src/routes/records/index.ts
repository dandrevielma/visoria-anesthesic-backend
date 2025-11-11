import { Router, Request, Response } from "express";
import { db } from "@/lib/db";
import { expressTryCatch } from "@/middleware/globalTryCatch";
import { authMiddleware } from "@/middleware/authMiddleware";
import crypto from "crypto";

const router = Router();

// All record routes require authentication
router.use(authMiddleware);

/**
 * GET /api/records
 * List all records with optional filters
 */
router.get(
  "/",
  expressTryCatch(async (req: Request, res: Response) => {
    const { 
      status, 
      patient_id, 
      assigned_doctor_id,
      limit = "50", 
      offset = "0" 
    } = req.query;

    let query = db
      .selectFrom("record")
      .leftJoin("patient", "record.patient_id", "patient.id")
      .select([
        "record.id",
        "record.record_number",
        "record.patient_id",
        "record.type",
        "record.status",
        "record.assigned_doctor_id",
        "record.created_by",
        "record.scheduled_date",
        "record.notes",
        "record.created_at",
        "record.updated_at",
        "patient.first_name as patient_first_name",
        "patient.last_name as patient_last_name",
        "patient.identification_number as patient_identification",
      ]);

    if (status && typeof status === "string") {
      query = query.where("record.status", "=", status as any);
    }

    if (patient_id && typeof patient_id === "string") {
      query = query.where("record.patient_id", "=", patient_id);
    }

    if (assigned_doctor_id && typeof assigned_doctor_id === "string") {
      query = query.where("record.assigned_doctor_id", "=", assigned_doctor_id);
    }

    const records = await query
      .limit(Number(limit))
      .offset(Number(offset))
      .orderBy("record.created_at", "desc")
      .execute();

    res.json(records);
  })
);

/**
 * GET /api/records/:id
 * Get a single record by ID with all related data
 */
router.get(
  "/:id",
  expressTryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Get record with patient info
    const record = await db
      .selectFrom("record")
      .leftJoin("patient", "record.patient_id", "patient.id")
      .selectAll("record")
      .select([
        "patient.first_name as patient_first_name",
        "patient.last_name as patient_last_name",
        "patient.identification_number as patient_identification",
        "patient.email as patient_email",
        "patient.phone as patient_phone",
        "patient.date_of_birth as patient_date_of_birth",
      ])
      .where("record.id", "=", id!)
      .executeTakeFirst();

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Get patient form if exists
    const patientForm = await db
      .selectFrom("patient_record_form")
      .selectAll()
      .where("record_id", "=", id!)
      .executeTakeFirst();

    // Get consent if exists
    const consent = await db
      .selectFrom("consent")
      .selectAll()
      .where("record_id", "=", id!)
      .executeTakeFirst();

    // Get doctor evaluation if exists
    const doctorEvaluation = await db
      .selectFrom("doctor_evaluation")
      .selectAll()
      .where("record_id", "=", id!)
      .executeTakeFirst();

    // Get patient files
    const files = await db
      .selectFrom("patient_file")
      .selectAll()
      .where("patient_id", "=", record.patient_id)
      .where("is_deleted", "=", false)
      .orderBy("uploaded_at", "desc")
      .execute();

    res.json({
      record,
      patient_form: patientForm || null,
      consent: consent || null,
      doctor_evaluation: doctorEvaluation || null,
      files,
    });
  })
);

/**
 * POST /api/records
 * Create a new record
 */
router.post(
  "/",
  expressTryCatch(async (req: Request, res: Response) => {
    const {
      patient_id,
      type,
      assigned_doctor_id,
      scheduled_date,
      notes,
    } = req.body;

    // Validate required fields
    if (!patient_id || !type) {
      return res.status(400).json({
        error: "patient_id and type are required",
      });
    }

    if (!["pre_anesthesia", "post_anesthesia"].includes(type)) {
      return res.status(400).json({
        error: "type must be 'pre_anesthesia' or 'post_anesthesia'",
      });
    }

    // Check if patient exists
    const patient = await db
      .selectFrom("patient")
      .select("id")
      .where("id", "=", patient_id)
      .executeTakeFirst();

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Generate unique record number (e.g., REC-2024-001)
    const year = new Date().getFullYear();
    const count = await db
      .selectFrom("record")
      .select(db.fn.count<number>("id").as("count"))
      .executeTakeFirstOrThrow();
    
    const recordNumber = `REC-${year}-${String(Number(count.count) + 1).padStart(4, "0")}`;

    // Generate unique token for patient form access
    const formToken = crypto.randomBytes(32).toString("hex");

    // Get user from session (authMiddleware should add this)
    const createdBy = (req as any).user?.id || "system";

    // Create record
    const newRecord = await db
      .insertInto("record")
      .values({
        patient_id,
        type,
        status: "pending",
        record_number: recordNumber,
        form_link_token: formToken,
        assigned_doctor_id: assigned_doctor_id || null,
        scheduled_date: scheduled_date || null,
        notes: notes || null,
        created_by: createdBy,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    res.status(201).json({
      ...newRecord,
      form_link: `${process.env.WEBSITE_URL}/patient-form/${formToken}`,
    });
  })
);

/**
 * PUT /api/records/:id
 * Update a record
 */
router.put(
  "/:id",
  expressTryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      status,
      assigned_doctor_id,
      scheduled_date,
      notes,
    } = req.body;

    // Check if record exists
    const existing = await db
      .selectFrom("record")
      .select("id")
      .where("id", "=", id!)
      .executeTakeFirst();

    if (!existing) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Validate status if provided
    if (status && !["pending", "completed"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Status must be 'pending' or 'completed'",
      });
    }

    // Update record
    const updated = await db
      .updateTable("record")
      .set({
        ...(status && { status }),
        ...(assigned_doctor_id !== undefined && { assigned_doctor_id: assigned_doctor_id || null }),
        ...(scheduled_date !== undefined && { scheduled_date: scheduled_date || null }),
        ...(notes !== undefined && { notes: notes || null }),
        updated_at: new Date(),
      })
      .where("id", "=", id!)
      .returningAll()
      .executeTakeFirstOrThrow();

    res.json(updated);
  })
);

/**
 * DELETE /api/records/:id
 * Delete a record (only if no forms submitted)
 */
router.delete(
  "/:id",
  expressTryCatch(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if patient form has been started
    const hasForm = await db
      .selectFrom("patient_record_form")
      .select("id")
      .where("record_id", "=", id!)
      .executeTakeFirst();

    if (hasForm) {
      return res.status(400).json({
        error: "Cannot delete record with patient form data",
      });
    }

    // Check if doctor evaluation exists
    const hasEvaluation = await db
      .selectFrom("doctor_evaluation")
      .select("id")
      .where("record_id", "=", id!)
      .executeTakeFirst();

    if (hasEvaluation) {
      return res.status(400).json({
        error: "Cannot delete record with doctor evaluation",
      });
    }

    // Delete record
    const deleted = await db
      .deleteFrom("record")
      .where("id", "=", id!)
      .returningAll()
      .executeTakeFirst();

    if (!deleted) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({
      message: "Record deleted successfully",
      record: deleted,
    });
  })
);

export const recordsRouter = router;
