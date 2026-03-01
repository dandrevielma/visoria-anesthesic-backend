import { Router, Request, Response } from "express";
import { db } from "@/lib/db";
import { expressTryCatch } from "@/middleware/globalTryCatch";
import { authMiddleware } from "@/middleware/authMiddleware";
import crypto from "crypto";

const router = Router();

/**
 * GET /api/records/:recordId/consent
 * Returns consent status for a record
 * PUBLIC ROUTE - No authentication required
 */
router.get(
  "/:recordId/consent",
  expressTryCatch(async (req: Request, res: Response) => {
    const { recordId } = req.params;

    console.log("[records/consent] requested", { recordId });

    if (!recordId) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Se requiere el ID de la consulta",
      });
    }

    const record = await db
      .selectFrom("record")
      .select(["id", "consent_accepted"])
      .where("id", "=", recordId)
      .executeTakeFirst();

    if (!record) {
      return res.status(404).json({
        error: "Record not found",
        message: "No se encontró la consulta",
      });
    }

    res.json({
      recordId: record.id,
      consentAccepted: record.consent_accepted,
    });
  })
);

/**
 * POST /api/records/:recordId/consent
 * Accepts informed consent for a record (cannot be undone)
 * PUBLIC ROUTE - No authentication required
 */
router.post(
  "/:recordId/consent",
  expressTryCatch(async (req: Request, res: Response) => {
    const { recordId } = req.params;

    if (!recordId) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Se requiere el ID de la consulta",
      });
    }

    // Get record
    const record = await db
      .selectFrom("record")
      .select(["id", "consent_accepted"])
      .where("id", "=", recordId)
      .executeTakeFirst();

    if (!record) {
      return res.status(404).json({
        error: "Record not found",
        message: "No se encontró la consulta",
      });
    }

    // Check if already accepted
    if (record.consent_accepted) {
      return res.status(409).json({
        error: "Consent already accepted",
        message: "El consentimiento ya ha sido aceptado",
      });
    }

    // Update consent_accepted to true
    await db
      .updateTable("record")
      .set({ consent_accepted: true })
      .where("id", "=", recordId)
      .execute();

    res.json({
      recordId: record.id,
      consentAccepted: true,
      message: "Consentimiento aceptado exitosamente",
    });
  })
);

/**
 * GET /api/records/:recordId/medical-report
 * Returns existing medical report for a record
 * PUBLIC ROUTE - No authentication required (for now, could be protected later)
 */
router.get(
  "/:recordId/medical-report",
  expressTryCatch(async (req: Request, res: Response) => {
    const { recordId } = req.params;

    if (!recordId) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Se requiere el ID de la consulta",
      });
    }

    const medicalReport = await db
      .selectFrom("medical_report")
      .selectAll()
      .where("record_id", "=", recordId)
      .executeTakeFirst();

    if (!medicalReport) {
      return res.status(404).json({
        error: "Medical report not found",
        message: "No se encontró informe médico para esta consulta",
      });
    }

    res.json({
      id: medicalReport.id,
      recordId: medicalReport.record_id,
      content: medicalReport.content,
      createdAt: medicalReport.created_at,
      updatedAt: medicalReport.updated_at,
    });
  })
);

/**
 * POST /api/records/:recordId/medical-report
 * Create or update medical report for a record
 * PUBLIC ROUTE - No authentication required (for now, could be protected later)
 */
router.post(
  "/:recordId/medical-report",
  authMiddleware,
  expressTryCatch(async (req: Request, res: Response) => {
    const { recordId } = req.params;
    const { content } = req.body;

    if (!recordId) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Se requiere el ID de la consulta",
      });
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid request",
        message: "El contenido del informe es requerido",
      });
    }

    // Check if record exists
    const record = await db
      .selectFrom("record")
      .select(["id", "type"])
      .where("id", "=", recordId)
      .executeTakeFirst();

    if (!record) {
      return res.status(404).json({
        error: "Record not found",
        message: "La consulta no existe",
      });
    }

    const currentUserId = (req as any).user?.id;

    // Check if medical report already exists
    const existingReport = await db
      .selectFrom("medical_report")
      .select("id")
      .where("record_id", "=", recordId)
      .executeTakeFirst();

    let medicalReport;

    if (existingReport) {
      // Update existing report
      medicalReport = await db
        .updateTable("medical_report")
        .set({
          content: content.trim(),
          updated_at: new Date(),
        })
        .where("record_id", "=", recordId)
        .returningAll()
        .executeTakeFirst();
    } else {
      // Create new report
      medicalReport = await db
        .insertInto("medical_report")
        .values({
          record_id: recordId,
          content: content.trim(),
        })
        .returningAll()
        .executeTakeFirst();
    }

    if ((record as any).type === "sedation" && currentUserId) {
      await db
        .updateTable("record")
        .set({
          assigned_doctor_id: currentUserId,
          updated_at: new Date(),
        })
        .where("id", "=", recordId)
        .execute();
    }

    res.json({
      id: medicalReport!.id,
      recordId: medicalReport!.record_id,
      content: medicalReport!.content,
      createdAt: medicalReport!.created_at,
      updatedAt: medicalReport!.updated_at,
    });
  })
);

/**
 * GET /api/records/:recordId/recipe
 * Returns existing recipe for a record
 * PUBLIC ROUTE - No authentication required (for now, could be protected later)
 */
router.get(
  "/:recordId/recipe",
  expressTryCatch(async (req: Request, res: Response) => {
    const { recordId } = req.params;

    if (!recordId) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Se requiere el ID de la consulta",
      });
    }

    const recipe = await db
      .selectFrom("recipe")
      .selectAll()
      .where("record_id", "=", recordId)
      .executeTakeFirst();

    if (!recipe) {
      return res.status(404).json({
        error: "Recipe not found",
        message: "No se encontró recipe para esta consulta",
      });
    }

    res.json({
      id: recipe.id,
      recordId: recipe.record_id,
      content: recipe.content,
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
    });
  })
);

/**
 * POST /api/records/:recordId/recipe
 * Create or update recipe for a record
 * PUBLIC ROUTE - No authentication required (for now, could be protected later)
 */
router.post(
  "/:recordId/recipe",
  expressTryCatch(async (req: Request, res: Response) => {
    const { recordId } = req.params;
    const { content } = req.body;

    if (!recordId) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Se requiere el ID de la consulta",
      });
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid request",
        message: "El contenido del recipe es requerido",
      });
    }

    // Check if record exists
    const record = await db
      .selectFrom("record")
      .select("id")
      .where("id", "=", recordId)
      .executeTakeFirst();

    if (!record) {
      return res.status(404).json({
        error: "Record not found",
        message: "La consulta no existe",
      });
    }

    // Check if recipe already exists
    const existingRecipe = await db
      .selectFrom("recipe")
      .select("id")
      .where("record_id", "=", recordId)
      .executeTakeFirst();

    let recipe;

    if (existingRecipe) {
      // Update existing recipe
      recipe = await db
        .updateTable("recipe")
        .set({
          content: content.trim(),
          updated_at: new Date(),
        })
        .where("record_id", "=", recordId)
        .returningAll()
        .executeTakeFirst();
    } else {
      // Create new recipe
      recipe = await db
        .insertInto("recipe")
        .values({
          record_id: recordId,
          content: content.trim(),
        })
        .returningAll()
        .executeTakeFirst();
    }

    res.json({
      id: recipe!.id,
      recordId: recipe!.record_id,
      content: recipe!.content,
      createdAt: recipe!.created_at,
      updatedAt: recipe!.updated_at,
    });
  })
);

/**
 * GET /api/records/:recordId/doctor-evaluation
 * Returns existing doctor evaluation for a record
 * PUBLIC ROUTE - No authentication required (for now, could be protected later)
 */
router.get(
  "/:recordId/doctor-evaluation",
  expressTryCatch(async (req: Request, res: Response) => {
    const { recordId } = req.params;

    if (!recordId) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Se requiere el ID de la consulta",
      });
    }

    const doctorEvaluation = await db
      .selectFrom("doctor_evaluation")
      .leftJoin("user", "user.id", "doctor_evaluation.doctor_id")
      .select([
        "doctor_evaluation.id",
        "doctor_evaluation.record_id",
        "doctor_evaluation.doctor_id",
        "doctor_evaluation.evaluation_data",
        "doctor_evaluation.is_draft",
        "doctor_evaluation.created_at",
        "doctor_evaluation.updated_at",
        "user.name as doctor_name",
      ])
      .where("doctor_evaluation.record_id", "=", recordId)
      .executeTakeFirst();

    if (!doctorEvaluation) {
      return res.status(404).json({
        error: "Doctor evaluation not found",
        message: "No se encontró evaluación médica para esta consulta",
      });
    }

    res.json({
      id: doctorEvaluation.id,
      recordId: doctorEvaluation.record_id,
      doctorId: doctorEvaluation.doctor_id,
      answers: doctorEvaluation.evaluation_data,
      isDraft: doctorEvaluation.is_draft,
      createdAt: doctorEvaluation.created_at,
      updatedAt: doctorEvaluation.updated_at,
      doctorName: doctorEvaluation.doctor_name,
    });
  })
);

/**
 * POST /api/records/:recordId/doctor-evaluation
 * Create or update doctor evaluation for a record
 * PUBLIC ROUTE - No authentication required (for now, could be protected later)
 */
router.post(
  "/:recordId/doctor-evaluation",
  expressTryCatch(async (req: Request, res: Response) => {
    const { recordId } = req.params;
    const { answers, isDraft } = req.body;

    if (!recordId) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Se requiere el ID de la consulta",
      });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        error: "Invalid request",
        message: "Las respuestas de la evaluación son requeridas",
      });
    }

    // Check if record exists and get assigned_doctor_id
    const record = await db
      .selectFrom("record")
      .select(["id", "assigned_doctor_id"])
      .where("id", "=", recordId)
      .executeTakeFirst();

    if (!record) {
      return res.status(404).json({
        error: "Record not found",
        message: "La consulta no existe",
      });
    }

    // Check if doctor evaluation already exists
    const existingEvaluation = await db
      .selectFrom("doctor_evaluation")
      .select("id")
      .where("record_id", "=", recordId)
      .executeTakeFirst();

    let doctorEvaluation;

    if (existingEvaluation) {
      // Update existing evaluation
      doctorEvaluation = await db
        .updateTable("doctor_evaluation")
        .set({
          evaluation_data: JSON.stringify(answers) as any,
          is_draft: isDraft !== undefined ? isDraft : true,
          updated_at: new Date(),
        })
        .where("record_id", "=", recordId)
        .returningAll()
        .executeTakeFirst();
    } else {
      // Create new evaluation
      // Use assigned_doctor_id from record, or get from session, or get first available doctor
      let doctorId = record.assigned_doctor_id || (req as any).user?.id;
      
      if (!doctorId) {
        // Get first available doctor as fallback (via user_role table)
        const firstDoctor = await db
          .selectFrom("user_role")
          .select("user_id")
          .where("role", "=", "doctor")
          .limit(1)
          .executeTakeFirst();

        if (!firstDoctor) {
          // If no doctor role exists, just get any user
          const anyUser = await db
            .selectFrom("user")
            .select("id")
            .limit(1)
            .executeTakeFirst();

          if (!anyUser) {
            return res.status(500).json({
              error: "No users found",
              message: "No se pudo asignar un médico para la evaluación",
            });
          }
          doctorId = anyUser.id;
        } else {
          doctorId = firstDoctor.user_id;
        }
      }
      
      doctorEvaluation = await db
        .insertInto("doctor_evaluation")
        .values({
          record_id: recordId,
          doctor_id: doctorId,
          evaluation_data: JSON.stringify(answers) as any,
          is_draft: isDraft !== undefined ? isDraft : true,
        })
        .returningAll()
        .executeTakeFirst();
    }

    res.json({
      id: doctorEvaluation!.id,
      recordId: doctorEvaluation!.record_id,
      doctorId: doctorEvaluation!.doctor_id,
      answers: doctorEvaluation!.evaluation_data,
      isDraft: doctorEvaluation!.is_draft,
      createdAt: doctorEvaluation!.created_at,
      updatedAt: doctorEvaluation!.updated_at,
    });
  })
);

/**
 * GET /api/records/:recordId/files
 * Returns files linked to a record
 * PUBLIC ROUTE - No authentication required
 */
router.get(
  "/:recordId/files",
  expressTryCatch(async (req: Request, res: Response) => {
    const { recordId } = req.params;

    if (!recordId) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Se requiere el ID de la consulta",
      });
    }

    const files = await db
      .selectFrom("patient_file")
      .selectAll()
      .where("record_id", "=", recordId)
      .where("is_deleted", "=", false)
      .orderBy("uploaded_at", "desc")
      .execute();

    console.log("[records/files] response", {
      recordId,
      count: files.length,
    });

    res.json({ files });
  })
);

/**
 * GET /api/records
 * List all records with optional filters
 * PUBLIC ROUTE - No authentication required
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
      .leftJoin("user as assigned_doctor", "record.assigned_doctor_id", "assigned_doctor.id")
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
        "patient.date_of_birth as patient_date_of_birth",
        "assigned_doctor.name as assigned_doctor_name",
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

// All other record routes require authentication
router.use(authMiddleware);

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

    if (!["sedation", "surgical"].includes(type)) {
      return res.status(400).json({
        error: "type must be 'sedation' or 'surgical'",
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

    // Generate unique record number (incremental)
    const count = await db
      .selectFrom("record")
      .select(db.fn.count<number>("id").as("count"))
      .executeTakeFirstOrThrow();
    
    const recordNumber = String(Number(count.count) + 1);

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
