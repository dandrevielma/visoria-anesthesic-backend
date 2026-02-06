import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Add consent_accepted boolean field to record table
  await db.schema
    .alterTable("record")
    .addColumn("consent_accepted", "boolean", (col) =>
      col.notNull().defaultTo(false)
    )
    .execute();

  console.log("✅ Added consent_accepted column to record table");
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove consent_accepted column
  await db.schema
    .alterTable("record")
    .dropColumn("consent_accepted")
    .execute();

  console.log("✅ Removed consent_accepted column from record table");
}
