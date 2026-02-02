/**
 * Forms Module
 * Central export for all form-related types and questions
 */

// Patient form (PARTE 1)
export * from './preAnesthesiaQuestions';

// Doctor form (PARTE 2)
export * from './doctorEvaluationQuestions';

// Answer types
export * from './types';

// Re-export commonly used types for convenience
export type {
  FormQuestion,
  QuestionType,
  QuestionOption,
} from './preAnesthesiaQuestions';

export type {
  DoctorFormField,
  DoctorQuestionType,
  DoctorQuestionOption,
} from './doctorEvaluationQuestions';

export type {
  PreAnesthesiaFormAnswers,
  PatientRecordForm,
  YesNoAnswer,
  QuestionAnswer,
} from './types';
