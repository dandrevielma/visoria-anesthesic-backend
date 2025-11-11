import { Kysely, sql } from "kysely";

/**
 * Email logging (simple)
 * - Track emails sent to patients
 */

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType("email_type")
    .asEnum(["form_link", "reminder", "other"])
    .execute();

  await db.schema
    .createTable("email_log")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("consulta_id", "uuid", (col) =>
      col.references("consulta.id").onDelete("cascade").notNull()
    )
    .addColumn("type", sql`email_type`, (col) => col.notNull())
    .addColumn("recipient_email", "text", (col) => col.notNull())
    .addColumn("subject", "text", (col) => col.notNull())
    .addColumn("sent_by", "text", (col) =>
      col.references("user.id").onDelete("set null")
    )
    .addColumn("provider_message_id", "text")
    .addColumn("sent_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("delivered_at", "timestamptz")
    .addColumn("error_message", "text")
    .execute();

  await db.schema
    .createIndex("email_log_consulta_id_idx")
    .on("email_log")
    .column("consulta_id")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("email_log").execute();
  await db.schema.dropType("email_type").execute();
}
