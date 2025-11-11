import { Kysely, sql } from "kysely";

/**
 * Doctor Evaluation
 * - Doctor fills this per consulta
 * - Includes auto-save functionality
 */

export async function up(db: Kysely<any>): Promise<void> {
  // Doctor Evaluation (per consulta, with auto-save)
  await db.schema
    .createTable("doctor_evaluation")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("consulta_id", "uuid", (col) =>
      col.references("consulta.id").onDelete("cascade").notNull().unique()
    )
    .addColumn("doctor_id", "text", (col) =>
      col.references("user.id").onDelete("restrict").notNull()
    )
    
    // All evaluation data in JSONB for flexibility
    .addColumn("evaluation_data", "jsonb", (col) => col.defaultTo(sql`'{}'::jsonb`))
    /* Structure example:
    {
      patient_name: string,
      sex: string,
      age: number,
      weight: number,
      height: number,
      bmi: number,
      diagnosis: string,
      proposed_intervention: string,
      treating_doctor: string,
      physical_exam: {
        vital_signs: { bp, hr, rr, temp, spo2 },
        airway_assessment: { mallampati, mouth_opening },
        cardiovascular: string,
        respiratory: string,
        neurological: string
      },
      risk_assessment: {
        asa_classification: string,
        cardiac_risk: string,
        pulmonary_risk: string
      },
      anesthetic_plan: {
        technique: string,
        monitoring: [],
        special_considerations: string
      },
      clearance: {
        cleared_for_procedure: boolean,
        conditions: string,
        recommendations: string
      }
    }
    */
    
    .addColumn("is_draft", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("is_complete", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("completed_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createIndex("doctor_evaluation_consulta_id_idx")
    .on("doctor_evaluation")
    .column("consulta_id")
    .execute();

  await db.schema
    .createIndex("doctor_evaluation_doctor_id_idx")
    .on("doctor_evaluation")
    .column("doctor_id")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("doctor_evaluation").execute();
}
