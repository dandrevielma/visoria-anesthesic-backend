import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Update record_type enum from pre_anesthesia/post_anesthesia to sedation/surgical
  await sql`ALTER TYPE record_type RENAME TO record_type_old`.execute(db);
  
  await sql`CREATE TYPE record_type AS ENUM ('sedation', 'surgical')`.execute(db);
  
  await sql`
    ALTER TABLE record 
    ALTER COLUMN type TYPE record_type 
    USING (
      CASE type::text
        WHEN 'pre_anesthesia' THEN 'sedation'::record_type
        WHEN 'post_anesthesia' THEN 'surgical'::record_type
        ELSE 'sedation'::record_type
      END
    )
  `.execute(db);
  
  await sql`DROP TYPE record_type_old`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Revert record_type enum back to pre_anesthesia/post_anesthesia
  await sql`ALTER TYPE record_type RENAME TO record_type_old`.execute(db);
  
  await sql`CREATE TYPE record_type AS ENUM ('pre_anesthesia', 'post_anesthesia')`.execute(db);
  
  await sql`
    ALTER TABLE record 
    ALTER COLUMN type TYPE record_type 
    USING (
      CASE type::text
        WHEN 'sedation' THEN 'pre_anesthesia'::record_type
        WHEN 'surgical' THEN 'post_anesthesia'::record_type
        ELSE 'pre_anesthesia'::record_type
      END
    )
  `.execute(db);
  
  await sql`DROP TYPE record_type_old`.execute(db);
}
