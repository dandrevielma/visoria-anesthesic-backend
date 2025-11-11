import { Kysely, sql } from "kysely";

/**
 * Core tables for Pre-Anesthesia Application
 * - User roles (admin/doctor)
 * - Patients (basic info)
 * - Patient medical profile (reusable across consultas)
 * - Consultas (main entity - one per procedure)
 */

export async function up(db: Kysely<any>): Promise<void> {
  // User Roles
  await db.schema
    .createTable("user_role")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("user_id", "text", (col) =>
      col.references("user.id").onDelete("cascade").notNull()
    )
    .addColumn("role", "text", (col) =>
      col.notNull().check(sql`role IN ('admin', 'doctor')`)
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createIndex("user_role_user_id_role_idx")
    .on("user_role")
    .columns(["user_id", "role"])
    .unique()
    .execute();

  // Patients
  await db.schema
    .createTable("patient")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("identification_number", "text", (col) => col.notNull().unique())
    .addColumn("first_name", "text", (col) => col.notNull())
    .addColumn("last_name", "text", (col) => col.notNull())
    .addColumn("email", "text")
    .addColumn("phone", "text")
    .addColumn("date_of_birth", "date")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createIndex("patient_identification_number_idx")
    .on("patient")
    .column("identification_number")
    .execute();

  // Patient Medical Profile (Reusable)
  await db.schema
    .createTable("patient_medical_profile")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("patient_id", "uuid", (col) =>
      col.references("patient.id").onDelete("cascade").notNull()
    )
    .addColumn("version", "integer", (col) => col.notNull().defaultTo(1))
    .addColumn("is_current", "boolean", (col) => col.notNull().defaultTo(true))
    
    // Medical information (JSONB for flexibility)
    .addColumn("allergies", "jsonb", (col) => col.defaultTo(sql`'[]'::jsonb`))
    // [{ allergen: string, reaction: string, severity: string }]
    
    .addColumn("medications", "jsonb", (col) => col.defaultTo(sql`'[]'::jsonb`))
    // [{ name: string, dose: string, frequency: string, prescribed_by: string }]
    
    .addColumn("medical_history", "jsonb", (col) => col.defaultTo(sql`'{}'::jsonb`))
    // { diabetes: bool, hypertension: bool, cardiac_disease: bool, asthma: bool, etc. }
    
    .addColumn("surgical_history", "jsonb", (col) => col.defaultTo(sql`'[]'::jsonb`))
    // [{ surgery: string, date: string, complications: string }]
    
    .addColumn("family_history", "jsonb", (col) => col.defaultTo(sql`'{}'::jsonb`))
    // { anesthesia_complications: string, details: string }
    
    .addColumn("lifestyle", "jsonb", (col) => col.defaultTo(sql`'{}'::jsonb`))
    // { smoking: string, alcohol: string, drugs: bool, drugs_details: string }
    
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createIndex("patient_medical_profile_patient_id_idx")
    .on("patient_medical_profile")
    .column("patient_id")
    .execute();

  await db.schema
    .createIndex("patient_medical_profile_current_idx")
    .on("patient_medical_profile")
    .columns(["patient_id", "is_current"])
    .execute();

  // Consulta Type and Status Enums
  await db.schema
    .createType("consulta_type")
    .asEnum(["sedacion", "quirurgico"])
    .execute();

  await db.schema
    .createType("consulta_status")
    .asEnum(["pendiente", "completado"])
    .execute();

  // Consultas (Main entity)
  await db.schema
    .createTable("consulta")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("consulta_number", "text", (col) => col.notNull().unique())
    .addColumn("patient_id", "uuid", (col) =>
      col.references("patient.id").onDelete("cascade").notNull()
    )
    .addColumn("type", sql`consulta_type`, (col) => col.notNull())
    .addColumn("status", sql`consulta_status`, (col) =>
      col.notNull().defaultTo(sql`'pendiente'::consulta_status`)
    )
    .addColumn("assigned_doctor_id", "text", (col) =>
      col.references("user.id").onDelete("set null")
    )
    .addColumn("created_by", "text", (col) =>
      col.references("user.id").onDelete("set null").notNull()
    )
    .addColumn("scheduled_date", "date")
    .addColumn("notes", "text")
    .addColumn("form_link_token", "text", (col) => col.notNull().unique())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createIndex("consulta_patient_id_idx")
    .on("consulta")
    .column("patient_id")
    .execute();

  await db.schema
    .createIndex("consulta_status_idx")
    .on("consulta")
    .column("status")
    .execute();

  await db.schema
    .createIndex("consulta_assigned_doctor_idx")
    .on("consulta")
    .column("assigned_doctor_id")
    .execute();

  await db.schema
    .createIndex("consulta_token_idx")
    .on("consulta")
    .column("form_link_token")
    .execute();

  // Consulta Activity Log (Audit trail)
  await db.schema
    .createTable("consulta_activity_log")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("consulta_id", "uuid", (col) =>
      col.references("consulta.id").onDelete("cascade").notNull()
    )
    .addColumn("user_id", "text", (col) =>
      col.references("user.id").onDelete("set null")
    )
    .addColumn("action", "text", (col) => col.notNull())
    .addColumn("old_value", "jsonb")
    .addColumn("new_value", "jsonb")
    .addColumn("ip_address", "text")
    .addColumn("user_agent", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createIndex("consulta_activity_log_consulta_id_idx")
    .on("consulta_activity_log")
    .column("consulta_id")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("consulta_activity_log").execute();
  await db.schema.dropTable("consulta").execute();
  await db.schema.dropType("consulta_status").execute();
  await db.schema.dropType("consulta_type").execute();
  await db.schema.dropTable("patient_medical_profile").execute();
  await db.schema.dropTable("patient").execute();
  await db.schema.dropTable("user_role").execute();
}
