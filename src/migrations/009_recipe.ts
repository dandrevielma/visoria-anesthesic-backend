import { Kysely, sql } from "kysely";

/**
 * Migration: recipe table
 * Creates table for storing medical prescriptions/recipes
 */
export async function up(db: Kysely<any>): Promise<void> {
  // Create recipe table
  await db.schema
    .createTable("recipe")
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
    .createIndex("recipe_record_id_idx")
    .on("recipe")
    .column("record_id")
    .execute();

  console.log("✅ Migration 009_recipe.ts completed");
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("recipe").execute();
  console.log("✅ Migration 009_recipe.ts rolled back");
}
