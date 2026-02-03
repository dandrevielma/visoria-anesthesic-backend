import { Kysely, sql } from "kysely";

/**
 * Migration: medical_report table
 * Creates table for storing doctor's medical evaluation reports
 */
export async function up(db: Kysely<any>): Promise<void> {
  // Create medical_report table
  await db.schema
    .createTable("medical_report")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("record_id", "uuid", (col) =>
      col.references("record.id").onDelete("cascade").notNull()
    )
    .addColumn("content", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Create index for record_id lookup
  await db.schema
    .createIndex("medical_report_record_id_idx")
    .on("medical_report")
    .column("record_id")
    .execute();

  console.log("✅ Migration 008_medical_report.ts completed");
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("medical_report").execute();
  console.log("✅ Migration 008_medical_report.ts rolled back");
}
