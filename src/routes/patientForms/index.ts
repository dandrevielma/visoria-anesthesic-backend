/**
 * Patient Forms Routes
 * Handles patient questionnaire (PARTE 1) submission and retrieval
 */

import express, { Request, Response } from 'express';
import { db } from '../../lib/db';
import { expressTryCatch } from '../../middleware/globalTryCatch';
import { PRE_ANESTHESIA_QUESTIONS } from '../../forms/preAnesthesiaQuestions';
import { PreAnesthesiaFormAnswers } from '../../forms/types';
import { sendPatientQuestionnaireCompletedEmail } from '../../lib/resend';

const router = express.Router();

async function sendCompletionEmailIfNeeded({
  recordId,
  isDraft,
  wasDraftBefore,
}: {
  recordId: string;
  isDraft: boolean;
  wasDraftBefore: boolean;
}) {
  if (isDraft || !wasDraftBefore) {
    return;
  }

  const patientData = await db
    .selectFrom('record')
    .innerJoin('patient', 'record.patient_id', 'patient.id')
    .select([
      'patient.email as email',
      'patient.first_name as first_name',
      'patient.last_name as last_name',
    ])
    .where('record.id', '=', recordId)
    .executeTakeFirst();

  if (!patientData?.email) {
    return;
  }

  const fullName = `${patientData.first_name} ${patientData.last_name}`.trim() || 'Paciente';

  try {
    await sendPatientQuestionnaireCompletedEmail({
      email: patientData.email,
      name: fullName,
    });
  } catch (error) {
    console.error('Error sending patient questionnaire completion email:', error);
  }
}

/**
 * GET /api/records/:recordId/patient-form/questions
 * Returns the list of questions for the patient form
 */
router.get(
  '/:recordId/patient-form/questions',
  expressTryCatch(async (req: Request, res: Response) => {
    const { recordId } = req.params;

    // Return questions
    res.json({
      recordId,
      questions: PRE_ANESTHESIA_QUESTIONS,
    });
  })
);

/**
 * GET /api/records/:recordId/patient-form
 * Returns existing patient form answers if available
 */
router.get(
  '/:recordId/patient-form',
  expressTryCatch(async (req: Request, res: Response) => {
    const { recordId } = req.params;

    if (!recordId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Se requiere el ID de la consulta',
      });
    }

    // Get existing form
    const form = await db
      .selectFrom('patient_record_form')
      .selectAll()
      .where('record_id', '=', recordId)
      .executeTakeFirst();

    if (!form) {
      return res.status(404).json({
        error: 'Form not found',
        message: 'No se encontró formulario para esta consulta',
      });
    }

    res.json({
      id: form.id,
      recordId: form.record_id,
      answers: form.record_specific_answers,
      isDraft: form.is_draft,
      completedAt: form.completed_at,
      createdAt: form.created_at,
      updatedAt: form.updated_at,
    });
  })
);

/**
 * POST /api/records/:recordId/patient-form
 * Creates or updates patient form answers
 */
router.post(
  '/:recordId/patient-form',
  expressTryCatch(async (req: Request, res: Response) => {
    const { recordId } = req.params;
    const { answers, isDraft = true } = req.body as {
      answers: Partial<PreAnesthesiaFormAnswers>;
      isDraft?: boolean;
    };

    if (!recordId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Se requiere el ID de la consulta',
      });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Se requieren respuestas válidas',
      });
    }

    // Check if form already exists
    const existingForm = await db
      .selectFrom('patient_record_form')
      .selectAll()
      .where('record_id', '=', recordId)
      .executeTakeFirst();

    const wasDraftBefore = existingForm ? existingForm.is_draft : true;
    const completedAt = !isDraft ? (existingForm?.completed_at ?? new Date()) : null;

    let form;

    if (existingForm) {
      // Update existing form
      form = await db
        .updateTable('patient_record_form')
        .set({
          record_specific_answers: JSON.stringify(answers) as any,
          is_draft: isDraft,
          completed_at: completedAt,
          updated_at: new Date(),
        })
        .where('record_id', '=', recordId)
        .returningAll()
        .executeTakeFirst();
    } else {
      // Create new form
      form = await db
        .insertInto('patient_record_form')
        .values({
          record_id: recordId,
          record_specific_answers: JSON.stringify(answers) as any,
          is_draft: isDraft,
          completed_at: completedAt,
        })
        .returningAll()
        .executeTakeFirst();
    }

    if (!isDraft) {
      const record = await db
        .selectFrom('record')
        .select(['id', 'type'])
        .where('id', '=', recordId)
        .executeTakeFirst();

      if (record?.type === 'sedation') {
        await db
          .updateTable('record')
          .set({
            status: 'completed',
            updated_at: new Date(),
          })
          .where('id', '=', recordId)
          .execute();
      }
    }

    await sendCompletionEmailIfNeeded({
      recordId,
      isDraft,
      wasDraftBefore,
    });

    res.json({
      id: form!.id,
      recordId: form!.record_id,
      answers: form!.record_specific_answers,
      isDraft: form!.is_draft,
      completedAt: form!.completed_at,
      createdAt: form!.created_at,
      updatedAt: form!.updated_at,
    });
  })
);

/**
 * PUT /api/records/:recordId/patient-form
 * Updates existing patient form answers (for auto-save)
 */
router.put(
  '/:recordId/patient-form',
  expressTryCatch(async (req: Request, res: Response) => {
    const { recordId } = req.params;
    const { answers, isDraft = true } = req.body as {
      answers: Partial<PreAnesthesiaFormAnswers>;
      isDraft?: boolean;
    };

    if (!recordId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Se requiere el ID de la consulta',
      });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Se requieren respuestas válidas',
      });
    }

    // Get existing form
    const existingForm = await db
      .selectFrom('patient_record_form')
      .selectAll()
      .where('record_id', '=', recordId)
      .executeTakeFirst();

    if (!existingForm) {
      return res.status(404).json({
        error: 'Form not found',
        message: 'No se encontró formulario para actualizar',
      });
    }

    const wasDraftBefore = existingForm.is_draft;
    const completedAt = !isDraft ? (existingForm.completed_at ?? new Date()) : null;

    // Update form
    const form = await db
      .updateTable('patient_record_form')
      .set({
        record_specific_answers: JSON.stringify(answers) as any,
        is_draft: isDraft,
        completed_at: completedAt,
        updated_at: new Date(),
      })
      .where('record_id', '=', recordId)
      .returningAll()
      .executeTakeFirst();

    if (!isDraft) {
      const record = await db
        .selectFrom('record')
        .select(['id', 'type'])
        .where('id', '=', recordId)
        .executeTakeFirst();

      if (record?.type === 'sedation') {
        await db
          .updateTable('record')
          .set({
            status: 'completed',
            updated_at: new Date(),
          })
          .where('id', '=', recordId)
          .execute();
      }
    }

    await sendCompletionEmailIfNeeded({
      recordId,
      isDraft,
      wasDraftBefore,
    });

    res.json({
      id: form!.id,
      recordId: form!.record_id,
      answers: form!.record_specific_answers,
      isDraft: form!.is_draft,
      completedAt: form!.completed_at,
      createdAt: form!.created_at,
      updatedAt: form!.updated_at,
    });
  })
);

export default router;
