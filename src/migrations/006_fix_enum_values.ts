import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Fix record_status enum values
  // First drop the default
  await sql`ALTER TABLE record ALTER COLUMN status DROP DEFAULT`.execute(db);
  
  await sql`ALTER TYPE record_status RENAME TO record_status_old`.execute(db);

  await sql`CREATE TYPE record_status AS ENUM ('pending', 'completed')`.execute(db);

  await sql`
    ALTER TABLE record 
    ALTER COLUMN status TYPE record_status 
    USING (
      CASE status::text
        WHEN 'pendiente' THEN 'pending'::record_status
        WHEN 'completado' THEN 'completed'::record_status
      END
    )
  `.execute(db);

  // Re-add the default with new value
  await sql`ALTER TABLE record ALTER COLUMN status SET DEFAULT 'pending'::record_status`.execute(db);

  await sql`DROP TYPE record_status_old`.execute(db);

  // Fix record_type enum values
  await sql`ALTER TYPE record_type RENAME TO record_type_old`.execute(db);

  await sql`CREATE TYPE record_type AS ENUM ('pre_anesthesia', 'post_anesthesia')`.execute(db);

  await sql`
    ALTER TABLE record 
    ALTER COLUMN type TYPE record_type 
    USING (
      CASE type::text
        WHEN 'sedacion' THEN 'pre_anesthesia'::record_type
        WHEN 'quirurgico' THEN 'post_anesthesia'::record_type
      END
    )
  `.execute(db);

  await sql`DROP TYPE record_type_old`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Revert record_status enum values
  await sql`ALTER TABLE record ALTER COLUMN status DROP DEFAULT`.execute(db);
  
  await sql`ALTER TYPE record_status RENAME TO record_status_old`.execute(db);

  await sql`CREATE TYPE record_status AS ENUM ('pendiente', 'completado')`.execute(db);

  await sql`
    ALTER TABLE record 
    ALTER COLUMN status TYPE record_status 
    USING (
      CASE status::text
        WHEN 'pending' THEN 'pendiente'::record_status
        WHEN 'completed' THEN 'completado'::record_status
      END
    )
  `.execute(db);

  await sql`ALTER TABLE record ALTER COLUMN status SET DEFAULT 'pendiente'::record_status`.execute(db);

  await sql`DROP TYPE record_status_old`.execute(db);

  // Revert record_type enum values
  await sql`ALTER TYPE record_type RENAME TO record_type_old`.execute(db);

  await sql`CREATE TYPE record_type AS ENUM ('sedacion', 'quirurgico')`.execute(db);

  await sql`
    ALTER TABLE record 
    ALTER COLUMN type TYPE record_type 
    USING (
      CASE type::text
        WHEN 'pre_anesthesia' THEN 'sedacion'::record_type
        WHEN 'post_anesthesia' THEN 'quirurgico'::record_type
      END
    )
  `.execute(db);

  await sql`DROP TYPE record_type_old`.execute(db);
}
