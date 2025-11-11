import { Kysely, sql } from "kysely";

/**
 * Patient Forms and Files
 * - Patient consulta form (per consulta)
 * - Patient files (reusable across consultas)
 * - Consent (per consulta)
 */

export async function up(db: Kysely<any>): Promise<void> {
  // Patient Consulta Form (per consulta, with auto-save)
  await db.schema
    .createTable("patient_consulta_form")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("consulta_id", "uuid", (col) =>
      col.references("consulta.id").onDelete("cascade").notNull().unique()
    )
    .addColumn("used_medical_profile_version", "integer")
    
    // Consulta-specific answers (JSONB)
    .addColumn("consulta_specific_answers", "jsonb", (col) => 
      col.defaultTo(sql`'{}'::jsonb`)
    )
    // { last_meal_time: timestamp, pregnancy_status: string, specific_questions: {} }
    
    .addColumn("is_draft", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("completed_at", "timestamptz")
    .addColumn("ip_address", "text")
    .addColumn("user_agent", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createIndex("patient_consulta_form_consulta_id_idx")
    .on("patient_consulta_form")
    .column("consulta_id")
    .execute();

  // File Type Enum
  await db.schema
    .createType("file_type")
    .asEnum([
      "prescription",
      "lab_result",
      "imaging",
      "ecg",
      "medical_report",
      "other",
    ])
    .execute();

  // Patient Files (linked to patient, reusable across consultas)
  await db.schema
    .createTable("patient_file")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("patient_id", "uuid", (col) =>
      col.references("patient.id").onDelete("cascade").notNull()
    )
    .addColumn("consulta_id", "uuid", (col) =>
      col.references("consulta.id").onDelete("set null")
    ) // Track which consulta uploaded it
    .addColumn("file_type", sql`file_type`, (col) => col.notNull())
    .addColumn("file_name", "text", (col) => col.notNull())
    .addColumn("file_size", "integer", (col) => col.notNull())
    .addColumn("mime_type", "text", (col) => col.notNull())
    .addColumn("storage_path", "text", (col) => col.notNull())
    .addColumn("storage_url", "text")
    .addColumn("description", "text")
    .addColumn("uploaded_by", "text", (col) =>
      col.references("user.id").onDelete("set null")
    ) // null if uploaded by patient
    .addColumn("uploaded_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("is_deleted", "boolean", (col) => col.defaultTo(false).notNull())
    .addColumn("deleted_at", "timestamptz")
    .execute();

  await db.schema
    .createIndex("patient_file_patient_id_idx")
    .on("patient_file")
    .column("patient_id")
    .execute();

  await db.schema
    .createIndex("patient_file_consulta_id_idx")
    .on("patient_file")
    .column("consulta_id")
    .execute();

  // Consent (per consulta)
  await db.schema
    .createTable("consent")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("consulta_id", "uuid", (col) =>
      col.references("consulta.id").onDelete("cascade").notNull().unique()
    )
    .addColumn("consent_text", "text", (col) => col.notNull()) // Snapshot of consent at signing
    .addColumn("is_accepted", "boolean", (col) => col.notNull())
    .addColumn("signature_data", "text") // Base64 signature image
    .addColumn("patient_name", "text", (col) => col.notNull())
    .addColumn("patient_age", "integer")
    .addColumn("patient_id_number", "text", (col) => col.notNull())
    .addColumn("patient_phone", "text")
    .addColumn("signed_at", "timestamptz")
    .addColumn("ip_address", "text")
    .addColumn("user_agent", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createIndex("consent_consulta_id_idx")
    .on("consent")
    .column("consulta_id")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("consent").execute();
  await db.schema.dropTable("patient_file").execute();
  await db.schema.dropType("file_type").execute();
  await db.schema.dropTable("patient_consulta_form").execute();
}
