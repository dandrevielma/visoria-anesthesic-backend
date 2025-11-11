import { Kysely, sql } from "kysely";

/**
 * Rename tables to English and remove unnecessary ones
 * - consulta -> record
 * - consulta_activity_log -> removed (unnecessary audit trail)
 * - email_log -> removed (emails handled by external functions)
 * - patient_consulta_form -> patient_record_form
 */

export async function up(db: Kysely<any>): Promise<void> {
  // Drop unnecessary tables first
  await db.schema.dropTable("email_log").execute();
  await db.schema.dropType("email_type").execute();
  
  await db.schema.dropTable("consulta_activity_log").execute();

  // Rename consulta to record
  await sql`ALTER TABLE consulta RENAME TO record`.execute(db);
  
  // Rename related tables
  await sql`ALTER TABLE patient_consulta_form RENAME TO patient_record_form`.execute(db);
  
  // Rename foreign key columns in patient_record_form
  await sql`ALTER TABLE patient_record_form RENAME COLUMN consulta_id TO record_id`.execute(db);
  await sql`ALTER TABLE patient_record_form RENAME COLUMN consulta_specific_answers TO record_specific_answers`.execute(db);
  
  // Rename foreign key columns in other tables
  await sql`ALTER TABLE consent RENAME COLUMN consulta_id TO record_id`.execute(db);
  await sql`ALTER TABLE doctor_evaluation RENAME COLUMN consulta_id TO record_id`.execute(db);
  await sql`ALTER TABLE patient_file RENAME COLUMN consulta_id TO record_id`.execute(db);
  
  // Rename indexes
  await sql`ALTER INDEX consulta_patient_id_idx RENAME TO record_patient_id_idx`.execute(db);
  await sql`ALTER INDEX consulta_status_idx RENAME TO record_status_idx`.execute(db);
  await sql`ALTER INDEX consulta_assigned_doctor_idx RENAME TO record_assigned_doctor_idx`.execute(db);
  await sql`ALTER INDEX consulta_token_idx RENAME TO record_token_idx`.execute(db);
  
  await sql`ALTER INDEX patient_consulta_form_consulta_id_idx RENAME TO patient_record_form_record_id_idx`.execute(db);
  await sql`ALTER INDEX consent_consulta_id_idx RENAME TO consent_record_id_idx`.execute(db);
  await sql`ALTER INDEX doctor_evaluation_consulta_id_idx RENAME TO doctor_evaluation_record_id_idx`.execute(db);
  await sql`ALTER INDEX patient_file_consulta_id_idx RENAME TO patient_file_record_id_idx`.execute(db);
  
  // Rename types
  await sql`ALTER TYPE consulta_type RENAME TO record_type`.execute(db);
  await sql`ALTER TYPE consulta_status RENAME TO record_status`.execute(db);
  
  // Update column in record table to use new type names
  await sql`ALTER TABLE record RENAME COLUMN consulta_number TO record_number`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Reverse the changes
  await sql`ALTER TABLE record RENAME COLUMN record_number TO consulta_number`.execute(db);
  
  await sql`ALTER TYPE record_status RENAME TO consulta_status`.execute(db);
  await sql`ALTER TYPE record_type RENAME TO consulta_type`.execute(db);
  
  await sql`ALTER INDEX patient_file_consulta_id_idx RENAME TO patient_file_consulta_id_idx`.execute(db);
  await sql`ALTER INDEX doctor_evaluation_record_id_idx RENAME TO doctor_evaluation_consulta_id_idx`.execute(db);
  await sql`ALTER INDEX consent_record_id_idx RENAME TO consent_consulta_id_idx`.execute(db);
  await sql`ALTER INDEX patient_record_form_record_id_idx RENAME TO patient_consulta_form_consulta_id_idx`.execute(db);
  
  await sql`ALTER INDEX record_token_idx RENAME TO consulta_token_idx`.execute(db);
  await sql`ALTER INDEX record_assigned_doctor_idx RENAME TO consulta_assigned_doctor_idx`.execute(db);
  await sql`ALTER INDEX record_status_idx RENAME TO consulta_status_idx`.execute(db);
  await sql`ALTER INDEX record_patient_id_idx RENAME TO consulta_patient_id_idx`.execute(db);
  
  await sql`ALTER TABLE patient_file RENAME COLUMN record_id TO consulta_id`.execute(db);
  await sql`ALTER TABLE doctor_evaluation RENAME COLUMN record_id TO consulta_id`.execute(db);
  await sql`ALTER TABLE consent RENAME COLUMN record_id TO consulta_id`.execute(db);
  
  await sql`ALTER TABLE patient_record_form RENAME COLUMN record_specific_answers TO consulta_specific_answers`.execute(db);
  await sql`ALTER TABLE patient_record_form RENAME COLUMN record_id TO consulta_id`.execute(db);
  
  await sql`ALTER TABLE patient_record_form RENAME TO patient_consulta_form`.execute(db);
  await sql`ALTER TABLE record RENAME TO consulta`.execute(db);
  
  // Recreate dropped tables
  await db.schema
    .createTable("consulta_activity_log")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("consulta_id", "uuid", (col) => col.references("consulta.id").onDelete("cascade").notNull())
    .addColumn("user_id", "text", (col) => col.references("user.id").onDelete("set null"))
    .addColumn("action", "text", (col) => col.notNull())
    .addColumn("old_value", "jsonb")
    .addColumn("new_value", "jsonb")
    .addColumn("ip_address", "text")
    .addColumn("user_agent", "text")
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createType("email_type")
    .asEnum(["form_link", "reminder", "other"])
    .execute();

  await db.schema
    .createTable("email_log")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("consulta_id", "uuid", (col) => col.references("consulta.id").onDelete("cascade").notNull())
    .addColumn("type", sql`email_type`, (col) => col.notNull())
    .addColumn("recipient_email", "text", (col) => col.notNull())
    .addColumn("subject", "text", (col) => col.notNull())
    .addColumn("sent_by", "text", (col) => col.references("user.id").onDelete("set null"))
    .addColumn("provider_message_id", "text")
    .addColumn("sent_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("delivered_at", "timestamptz")
    .addColumn("error_message", "text")
    .execute();
}
