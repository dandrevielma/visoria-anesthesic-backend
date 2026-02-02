/**
 * Type definitions for Form Answers
 * Maps question IDs to their respective answer formats
 */

/**
 * Answer type for yes/no questions
 */
export interface YesNoAnswer {
  answer: 'yes' | 'no';
  details?: string; // Optional details when answer is 'yes'
}

/**
 * Answer type for text input questions
 */
export type TextAnswer = string;

/**
 * Answer type for numeric input questions
 */
export type NumberAnswer = number;

/**
 * Answer type for date input questions
 */
export type DateAnswer = string; // ISO 8601 format

/**
 * Answer type for single selection questions
 */
export type SelectAnswer = string;

/**
 * Answer type for multiple selection questions
 */
export type MultipleAnswer = string[];

/**
 * Union type for all possible answer types
 */
export type QuestionAnswer =
  | YesNoAnswer
  | TextAnswer
  | NumberAnswer
  | DateAnswer
  | SelectAnswer
  | MultipleAnswer;

/**
 * PARTE 1: Patient Pre-Anesthesia Questionnaire Answers
 * This defines the structure of the record_specific_answers JSONB column in patient_record_form table
 */
export interface PreAnesthesiaFormAnswers {
  // Antecedentes Anestésicos
  has_previous_anesthesia: YesNoAnswer;
  previous_anesthesia_intervention?: TextAnswer;
  previous_anesthesia_year?: TextAnswer;
  previous_anesthesia_type?: TextAnswer;
  anesthesia_complications: YesNoAnswer;
  family_anesthesia_problems: YesNoAnswer;

  // Medicamentos y Alergias
  takes_medications: YesNoAnswer;
  has_allergies: YesNoAnswer;

  // Estilo de Vida - Tabaquismo
  smoking_history: YesNoAnswer;
  smoking_current_status?: SelectAnswer; // 'current' | 'quit'
  smoking_daily_quantity?: NumberAnswer;
  smoking_duration_years?: NumberAnswer;
  smoking_quit_timing?: TextAnswer;

  // Estilo de Vida - Alcohol
  alcohol_consumption: YesNoAnswer;
  alcohol_type?: TextAnswer;
  alcohol_frequency?: SelectAnswer; // 'daily' | 'weekly' | 'monthly' | 'occasional'
  alcohol_quantity?: TextAnswer;

  // Tratamientos Especiales
  radiotherapy_or_chemotherapy: YesNoAnswer;

  // Información Física
  has_prosthetics: YesNoAnswer;
  limited_neck_mobility: YesNoAnswer;
  limited_mouth_opening: YesNoAnswer;
  recent_weight_changes: YesNoAnswer;

  // Condiciones Neurológicas
  has_seizures: YesNoAnswer;
  mental_health_treatment: YesNoAnswer;

  // Información Adicional
  dietary_regimen: YesNoAnswer;
}

/**
 * PARTE 2: Doctor Evaluation Answers
 * This defines the structure of the evaluation_data JSONB column in doctor_evaluation table
 */
export interface DoctorEvaluationAnswers {
  // Datos de Identificación
  patient_sex: SelectAnswer; // 'M' | 'F'
  patient_age: NumberAnswer;
  patient_weight: NumberAnswer;
  patient_height: NumberAnswer;
  patient_bmi?: NumberAnswer;
  diagnosis: TextAnswer;
  proposed_intervention: TextAnswer;
  treating_doctor: TextAnswer;

  // Antecedentes
  previous_anesthesia_count: NumberAnswer;
  previous_anesthesia_complications_details?: TextAnswer;
  medication_allergy: YesNoAnswer;
  has_hypertension: YesNoAnswer;
  hypertension_treatment?: TextAnswer;
  has_diabetes: YesNoAnswer;
  diabetes_type?: SelectAnswer; // 'type1' | 'type2'
  diabetes_treatment?: TextAnswer;
  antiplatelet_suspended: YesNoAnswer;

  // Examen Físico - Signos Vitales
  blood_pressure: TextAnswer; // e.g., "120/80"
  respiratory_rate: NumberAnswer;
  heart_rate: NumberAnswer;
  temperature: NumberAnswer;

  // Examen Físico - General
  skin_appearance: SelectAnswer; // 'normal' | 'pale' | 'cyanotic' | 'icteric'
  consciousness_temporal: YesNoAnswer;
  consciousness_personal: YesNoAnswer;
  consciousness_spatial: YesNoAnswer;
  head_neck_normocephalic: YesNoAnswer;
  spine_visible: YesNoAnswer;
  spine_palpable: YesNoAnswer;
  pulmonary_eupneic: YesNoAnswer;
  pulmonary_spirometry?: TextAnswer;
  abdomen_examination: TextAnswer;

  // Laboratorio y Paraclínicos
  lab_hb?: NumberAnswer;
  lab_hto?: NumberAnswer;
  lab_glucose?: NumberAnswer;
  lab_platelets?: NumberAnswer;
  lab_wbc?: NumberAnswer;
  lab_pt?: NumberAnswer;
  lab_ptt?: NumberAnswer;
  lab_fibrinogen?: NumberAnswer;
  lab_hiv?: SelectAnswer; // 'positive' | 'negative' | 'not_tested'
  lab_vdrl?: SelectAnswer; // 'positive' | 'negative' | 'not_tested'
  lab_creatinine?: NumberAnswer;
  lab_urea?: NumberAnswer;
  lab_total_proteins?: NumberAnswer;
  lab_albumin?: NumberAnswer;

  // Evaluación Cardiovascular
  cardiovascular_eval_date?: DateAnswer;
  chest_xray?: TextAnswer;
  ekg?: TextAnswer;
  exercise_tolerance_mets?: SelectAnswer; // '<4' | '>4'

  // Vía Aérea
  mallampati_classification: SelectAnswer; // '1' | '2' | '3' | '4'
  thyromental_distance: NumberAnswer; // cm
  mouth_opening: NumberAnswer; // cm
  cervical_mobility: SelectAnswer; // 'normal' | 'limited'

  // Indicadores de Riesgo
  asa_classification: SelectAnswer; // 'I' | 'II' | 'III' | 'IV' | 'V' | 'IE' | 'IIE' | 'IIIE' | 'IVE' | 'VE'
  johns_hopkins_classification: SelectAnswer; // 'I' | 'II' | 'III' | 'IV' | 'V'
  airway_risk: SelectAnswer; // 'I' | 'II' | 'III' | 'IV' | 'V'
  bmi_calculation?: NumberAnswer;

  // Plan y Observaciones
  suggested_anesthetic_technique: TextAnswer;
  nebulization_premedication: YesNoAnswer;
  steroids_vev: YesNoAnswer;
  perioperative_glycemia: YesNoAnswer;
  sap_notes?: TextAnswer;
}

/**
 * Interface for the complete patient record form
 * This represents a row in the patient_record_form table
 */
export interface PatientRecordForm {
  id: string; // UUID
  patient_record_id: string; // UUID - foreign key to patient_record
  record_specific_answers: PreAnesthesiaFormAnswers;
  is_draft: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interface for the doctor evaluation
 * This represents a row in the doctor_evaluation table
 */
export interface DoctorEvaluation {
  id: string; // UUID
  patient_record_id: string; // UUID - foreign key to patient_record
  evaluation_data: DoctorEvaluationAnswers;
  is_draft: boolean;
  evaluated_by: string; // UUID - foreign key to user
  evaluated_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Helper function to create an empty patient form answers object
 */
export function createEmptyPatientFormAnswers(): Partial<PreAnesthesiaFormAnswers> {
  return {};
}

/**
 * Helper function to create an empty doctor evaluation answers object
 */
export function createEmptyDoctorEvaluationAnswers(): Partial<DoctorEvaluationAnswers> {
  return {};
}

/**
 * Helper function to validate if patient form is complete
 */
export function isPatientFormComplete(
  answers: Partial<PreAnesthesiaFormAnswers>
): boolean {
  const requiredFields: (keyof PreAnesthesiaFormAnswers)[] = [
    'has_previous_anesthesia',
    'anesthesia_complications',
    'family_anesthesia_problems',
    'takes_medications',
    'has_allergies',
    'smoking_history',
    'alcohol_consumption',
    'radiotherapy_or_chemotherapy',
    'has_prosthetics',
    'limited_neck_mobility',
    'limited_mouth_opening',
    'recent_weight_changes',
    'has_seizures',
    'mental_health_treatment',
    'dietary_regimen',
  ];

  return requiredFields.every((field) => answers[field] !== undefined);
}

/**
 * Helper function to validate if doctor evaluation is complete
 */
export function isDoctorEvaluationComplete(
  answers: Partial<DoctorEvaluationAnswers>
): boolean {
  const requiredFields: (keyof DoctorEvaluationAnswers)[] = [
    'patient_sex',
    'patient_age',
    'patient_weight',
    'patient_height',
    'diagnosis',
    'proposed_intervention',
    'treating_doctor',
    'previous_anesthesia_count',
    'medication_allergy',
    'has_hypertension',
    'has_diabetes',
    'antiplatelet_suspended',
    'blood_pressure',
    'respiratory_rate',
    'heart_rate',
    'temperature',
    'mallampati_classification',
    'thyromental_distance',
    'mouth_opening',
    'cervical_mobility',
    'asa_classification',
    'johns_hopkins_classification',
    'airway_risk',
    'suggested_anesthetic_technique',
    'nebulization_premedication',
    'steroids_vev',
    'perioperative_glycemia',
  ];

  return requiredFields.every((field) => answers[field] !== undefined);
}
