/**
 * PARTE 2: Evaluación Pre-Anestésica (Uso del Departamento)
 * Form filled by the anesthesiologist during patient evaluation
 */

export type DoctorQuestionType = 
  | 'text'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'textarea'
  | 'radio'
  | 'multiple-checkboxes';

export interface DoctorQuestionOption {
  value: string;
  label: string;
}

export interface DoctorFormField {
  id: string;
  section: string;
  label: string;
  type: DoctorQuestionType;
  required: boolean;
  options?: DoctorQuestionOption[];
  placeholder?: string;
  unit?: string; // For measurements like "mmHg", "kg", etc.
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

/**
 * Doctor Evaluation Form Structure
 */
export const DOCTOR_EVALUATION_FIELDS: DoctorFormField[] = [
  // Datos de Identificación
  {
    id: 'patient_sex',
    section: 'Datos de Identificación',
    label: 'Sexo',
    type: 'radio',
    required: true,
    options: [
      { value: 'M', label: 'M' },
      { value: 'F', label: 'F' },
    ],
  },
  {
    id: 'patient_age',
    section: 'Datos de Identificación',
    label: 'Edad',
    type: 'number',
    required: true,
    unit: 'años',
  },
  {
    id: 'patient_weight',
    section: 'Datos de Identificación',
    label: 'Peso',
    type: 'number',
    required: true,
    unit: 'kg',
  },
  {
    id: 'patient_height',
    section: 'Datos de Identificación',
    label: 'Talla',
    type: 'number',
    required: true,
    unit: 'cm',
  },
  {
    id: 'patient_bmi',
    section: 'Datos de Identificación',
    label: 'IMC',
    type: 'number',
    required: true,
    placeholder: 'Calculado automáticamente',
  },
  {
    id: 'diagnosis',
    section: 'Datos de Identificación',
    label: 'Diagnóstico',
    type: 'text',
    required: true,
  },
  {
    id: 'proposed_intervention',
    section: 'Datos de Identificación',
    label: 'Intervención Propuesta',
    type: 'text',
    required: true,
  },
  {
    id: 'treating_doctor',
    section: 'Datos de Identificación',
    label: 'Médico Tratante',
    type: 'text',
    required: true,
  },

  // Antecedentes
  {
    id: 'previous_anesthesia',
    section: 'Antecedentes',
    label: 'Anestesias previas',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'anesthesia_complications',
    section: 'Antecedentes',
    label: 'Complicaciones',
    type: 'text',
    required: false,
  },
  {
    id: 'medication_allergy',
    section: 'Antecedentes',
    label: 'Alergia a medicamentos',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'has_hypertension',
    section: 'Antecedentes',
    label: 'Hipertensión arterial sistémica',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'hypertension_treatment',
    section: 'Antecedentes',
    label: 'Tratamiento',
    type: 'text',
    required: false,
  },
  {
    id: 'diabetes_type',
    section: 'Antecedentes',
    label: 'Diabetes tipo',
    type: 'radio',
    required: false,
    options: [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: 'none', label: 'No' },
    ],
  },
  {
    id: 'diabetes_treatment',
    section: 'Antecedentes',
    label: 'Tratamiento diabetes',
    type: 'text',
    required: false,
  },
  {
    id: 'antiplatelet_suspended',
    section: 'Antecedentes',
    label: 'Antiagregante suspendido hace',
    type: 'text',
    required: false,
    placeholder: 'Días',
  },

  // Datos Positivos del Examen Físico
  {
    id: 'blood_pressure',
    section: 'Examen Físico',
    label: 'TA',
    type: 'text',
    required: true,
    unit: 'mmHg',
    placeholder: '120/80',
  },
  {
    id: 'respiratory_rate',
    section: 'Examen Físico',
    label: 'F.r.',
    type: 'number',
    required: true,
    unit: 'rpm',
  },
  {
    id: 'heart_rate',
    section: 'Examen Físico',
    label: 'FcX\'',
    type: 'number',
    required: true,
    unit: 'lpm',
  },
  {
    id: 'temperature',
    section: 'Examen Físico',
    label: 'Temp.',
    type: 'number',
    required: true,
    unit: '°C',
  },
  {
    id: 'skin_appearance',
    section: 'Examen Físico',
    label: 'Aspecto de la Piel: Sin lesiones evidentes',
    type: 'radio',
    required: true,
    options: [
      { value: 'S', label: 'S' },
      { value: 'N', label: 'N' },
    ],
  },
  {
    id: 'consciousness_temporal',
    section: 'Examen Físico',
    label: 'Edo. de Conciencia: Orientad@ Temporal',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'consciousness_personal',
    section: 'Examen Físico',
    label: 'Edo. de Conciencia: Orientad@ Personal',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'consciousness_spatial',
    section: 'Examen Físico',
    label: 'Edo. de Conciencia: Orientad@ Espacial',
    type: 'checkbox',
    required: true,
  },
  {
    id: 'head_normocephalic',
    section: 'Examen Físico',
    label: 'Cabeza-Cuello: Normocéfalo',
    type: 'radio',
    required: true,
    options: [
      { value: 'S', label: 'S' },
      { value: 'N', label: 'N' },
    ],
  },
  {
    id: 'head_no_lesions',
    section: 'Examen Físico',
    label: 'Cabeza-Cuello: Sin lesiones evidentes',
    type: 'radio',
    required: true,
    options: [
      { value: 'S', label: 'S' },
      { value: 'N', label: 'N' },
    ],
  },
  {
    id: 'spine_visible',
    section: 'Examen Físico',
    label: 'Columna Vertebral: Apófisis espinosas Visibles',
    type: 'radio',
    required: true,
    options: [
      { value: 'S', label: 'S' },
      { value: 'N', label: 'N' },
    ],
  },
  {
    id: 'spine_palpable',
    section: 'Examen Físico',
    label: 'Columna Vertebral: Apófisis espinosas Palpables',
    type: 'radio',
    required: true,
    options: [
      { value: 'S', label: 'S' },
      { value: 'N', label: 'N' },
    ],
  },
  {
    id: 'eupneic_at_rest',
    section: 'Examen Físico',
    label: 'Evaluación Pulmonar: Eupneic@ en reposo',
    type: 'radio',
    required: true,
    options: [
      { value: 'S', label: 'S' },
      { value: 'N', label: 'N' },
    ],
  },
  {
    id: 'spirometry',
    section: 'Examen Físico',
    label: 'Espirometría',
    type: 'text',
    required: false,
  },
  {
    id: 'abdomen_no_lesions',
    section: 'Examen Físico',
    label: 'Abdomen / Osteo-Muscular: Sin lesiones evidentes',
    type: 'radio',
    required: true,
    options: [
      { value: 'S', label: 'S' },
      { value: 'N', label: 'N' },
    ],
  },

  // Laboratorio y Paraclínicos
  {
    id: 'lab_hb',
    section: 'Laboratorio y Paraclínicos',
    label: 'Hb',
    type: 'number',
    required: false,
    unit: 'g/dL',
  },
  {
    id: 'lab_hto',
    section: 'Laboratorio y Paraclínicos',
    label: 'Hto',
    type: 'number',
    required: false,
    unit: '%',
  },
  {
    id: 'lab_glucose',
    section: 'Laboratorio y Paraclínicos',
    label: 'Glic.',
    type: 'number',
    required: false,
    unit: 'mg/dL',
  },
  {
    id: 'lab_platelets',
    section: 'Laboratorio y Paraclínicos',
    label: 'Plaq.',
    type: 'number',
    required: false,
  },
  {
    id: 'lab_wbc',
    section: 'Laboratorio y Paraclínicos',
    label: 'G.B.',
    type: 'number',
    required: false,
  },
  {
    id: 'lab_pt',
    section: 'Laboratorio y Paraclínicos',
    label: 'PT',
    type: 'number',
    required: false,
    unit: 'seg',
  },
  {
    id: 'lab_ptt',
    section: 'Laboratorio y Paraclínicos',
    label: 'PTT',
    type: 'number',
    required: false,
    unit: 'seg',
  },
  {
    id: 'lab_fibrinogen',
    section: 'Laboratorio y Paraclínicos',
    label: 'Fibri',
    type: 'number',
    required: false,
  },
  {
    id: 'lab_hiv',
    section: 'Laboratorio y Paraclínicos',
    label: 'H.I.V.',
    type: 'text',
    required: false,
  },
  {
    id: 'lab_vdrl',
    section: 'Laboratorio y Paraclínicos',
    label: 'VDRL',
    type: 'text',
    required: false,
  },
  {
    id: 'lab_creatinine',
    section: 'Laboratorio y Paraclínicos',
    label: 'Creat.',
    type: 'number',
    required: false,
    unit: 'mg/dL',
  },
  {
    id: 'lab_urea',
    section: 'Laboratorio y Paraclínicos',
    label: 'Urea',
    type: 'number',
    required: false,
    unit: 'mg/dL',
  },
  {
    id: 'lab_total_proteins',
    section: 'Laboratorio y Paraclínicos',
    label: 'Proteínas Totales',
    type: 'number',
    required: false,
    unit: 'g/dL',
  },
  {
    id: 'lab_albumin',
    section: 'Laboratorio y Paraclínicos',
    label: 'Albúmina',
    type: 'number',
    required: false,
    unit: 'g/dL',
  },

  // Evaluación Cardiovascular
  {
    id: 'cardio_eval_date',
    section: 'Evaluación Cardiovascular',
    label: 'Fecha',
    type: 'text',
    required: false,
  },
  {
    id: 'chest_xray',
    section: 'Evaluación Cardiovascular',
    label: 'Rx. de Tórax',
    type: 'text',
    required: false,
  },
  {
    id: 'ekg',
    section: 'Evaluación Cardiovascular',
    label: 'EKG',
    type: 'text',
    required: false,
  },
  {
    id: 'exercise_tolerance_mets',
    section: 'Evaluación Cardiovascular',
    label: 'Tolerancia al ejercicio METS',
    type: 'radio',
    required: true,
    options: [
      { value: '<4', label: '<4' },
      { value: '>4', label: '>4' },
    ],
  },

  // Vía Aérea (Evaluación)
  {
    id: 'mallampati',
    section: 'Vía Aérea',
    label: 'Mallampati',
    type: 'radio',
    required: true,
    options: [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
    ],
  },
  {
    id: 'thyromental_distance',
    section: 'Vía Aérea',
    label: 'Distancia Tiromentoniana',
    type: 'number',
    required: true,
    unit: 'cm',
  },
  {
    id: 'mouth_opening',
    section: 'Vía Aérea',
    label: 'Apertura Oral',
    type: 'number',
    required: true,
    unit: 'cm',
  },
  {
    id: 'cervical_mobility',
    section: 'Vía Aérea',
    label: 'Movilidad Cervical',
    type: 'text',
    required: true,
  },

  // Indicadores de Riesgo (Escalas I al V)
  {
    id: 'asa_classification',
    section: 'Indicadores de Riesgo',
    label: 'A.S.A.',
    type: 'radio',
    required: true,
    options: [
      { value: 'I', label: 'I' },
      { value: 'II', label: 'II' },
      { value: 'III', label: 'III' },
      { value: 'IV', label: 'IV' },
      { value: 'V', label: 'V' },
      { value: 'E', label: 'E' },
    ],
  },
  {
    id: 'johns_hopkins',
    section: 'Indicadores de Riesgo',
    label: 'JOHNS HOPKINS',
    type: 'radio',
    required: true,
    options: [
      { value: 'I', label: 'I' },
      { value: 'II', label: 'II' },
      { value: 'III', label: 'III' },
      { value: 'IV', label: 'IV' },
      { value: 'V', label: 'V' },
    ],
  },
  {
    id: 'airway_risk',
    section: 'Indicadores de Riesgo',
    label: 'VÍA AÉREA',
    type: 'radio',
    required: true,
    options: [
      { value: 'I', label: 'I' },
      { value: 'II', label: 'II' },
      { value: 'III', label: 'III' },
      { value: 'IV', label: 'IV' },
      { value: 'V', label: 'V' },
    ],
  },
  {
    id: 'bmi_calculation',
    section: 'Indicadores de Riesgo',
    label: 'I.M.C. P(kilos) / A (en metros al cuadrado)',
    type: 'text',
    required: false,
    placeholder: 'Calculado automáticamente',
  },

  // Plan y Observaciones
  {
    id: 'suggested_anesthetic_technique',
    section: 'Plan y Observaciones',
    label: 'Técnica Anestésica Sugerida',
    type: 'textarea',
    required: true,
  },
  {
    id: 'nebulization',
    section: 'Plan y Observaciones',
    label: 'Medicación Pre-Anestésica: Nebulización',
    type: 'radio',
    required: false,
    options: [
      { value: 'S', label: 'S' },
      { value: 'N', label: 'N' },
    ],
  },
  {
    id: 'steroids_vev',
    section: 'Plan y Observaciones',
    label: 'Esteroides VEV',
    type: 'radio',
    required: false,
    options: [
      { value: 'S', label: 'S' },
      { value: 'N', label: 'N' },
    ],
  },
  {
    id: 'perioperative_glycemia',
    section: 'Plan y Observaciones',
    label: 'Glicemias perioperatorias',
    type: 'radio',
    required: false,
    options: [
      { value: 'S', label: 'S' },
      { value: 'N', label: 'N' },
    ],
  },
  {
    id: 'sap',
    section: 'Plan y Observaciones',
    label: 'S.A.P.',
    type: 'textarea',
    required: false,
  },
];

/**
 * Get fields by section for organized display
 */
export function getDoctorFieldsBySection(): Map<string, DoctorFormField[]> {
  const sections = new Map<string, DoctorFormField[]>();
  
  DOCTOR_EVALUATION_FIELDS.forEach(field => {
    const sectionFields = sections.get(field.section) || [];
    sectionFields.push(field);
    sections.set(field.section, sectionFields);
  });
  
  return sections;
}

/**
 * Calculate BMI helper
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(2));
}
