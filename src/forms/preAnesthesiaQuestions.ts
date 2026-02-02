/**
 * Pre-Anesthesia Evaluation Form Questions
 * These questions are static and will be answered by patients before their procedure
 */

export type QuestionType = 
  | 'yes-no'           // Simple yes/no with optional details
  | 'yes-no-details'   // Yes/no that requires details if yes
  | 'text'             // Short text input
  | 'textarea'         // Long text input
  | 'number'           // Numeric input
  | 'date'             // Date picker
  | 'select'           // Dropdown/single choice
  | 'multiple'         // Multiple choice (checkboxes)
  | 'radio';           // Radio buttons

export interface QuestionOption {
  value: string;
  label: string;
}

export interface FormQuestion {
  id: string;
  section: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditionalOn?: {
    questionId: string;
    value: string | string[];
  };
  subQuestions?: FormQuestion[];
}

/**
 * PARTE 1: Evaluación Pre-Anestésica (Para el Paciente)
 * Based on the official form used by the anesthesiology department
 */
export const PRE_ANESTHESIA_QUESTIONS: FormQuestion[] = [
  // Question 1: Previous Anesthesia with sub-questions
  {
    id: 'has_previous_anesthesia',
    section: 'Antecedentes Anestésicos',
    text: '¿Ha recibido Ud. anestesia anteriormente?',
    type: 'yes-no',
    required: true,
    subQuestions: [
      {
        id: 'previous_anesthesia_intervention',
        section: 'Antecedentes Anestésicos',
        text: 'Intervención',
        type: 'text',
        required: false,
        placeholder: 'Nombre de la intervención',
      },
      {
        id: 'previous_anesthesia_year',
        section: 'Antecedentes Anestésicos',
        text: 'Año',
        type: 'text',
        required: false,
        placeholder: 'Año de la intervención',
      },
      {
        id: 'previous_anesthesia_type',
        section: 'Antecedentes Anestésicos',
        text: 'Tipo de Anestesia',
        type: 'text',
        required: false,
        placeholder: 'Tipo de anestesia utilizada',
      },
    ],
  },

  // Question 2: Complications
  {
    id: 'anesthesia_complications',
    section: 'Antecedentes Anestésicos',
    text: '¿Han habido complicaciones o situaciones desagradables durante o después de los actos anestésicos?',
    type: 'yes-no-details',
    required: true,
    placeholder: 'Describa las complicaciones',
  },

  // Question 3: Family history
  {
    id: 'family_anesthesia_problems',
    section: 'Antecedentes Anestésicos',
    text: '¿Tiene conocimiento de algún miembro de su familia que haya tenido problemas graves con la anestesia?',
    type: 'yes-no-details',
    required: true,
    placeholder: 'Especifique el familiar y el problema',
  },

  // Question 4: Current medications
  {
    id: 'takes_medications',
    section: 'Medicamentos y Alergias',
    text: '¿Toma Ud. en forma rutinaria alguna(s) medicina(s), adaptógenos, vitaminas o anticonceptivos, etc.?',
    type: 'yes-no-details',
    required: true,
    placeholder: 'Liste los medicamentos, dosis y frecuencia',
  },

  // Question 5: Allergies
  {
    id: 'has_allergies',
    section: 'Medicamentos y Alergias',
    text: '¿Es Ud. alérgico(a) a algún medicamento u otra sustancia?',
    type: 'yes-no-details',
    required: true,
    placeholder: 'Liste las alergias',
  },

  // Question 6: Smoking with sub-questions
  {
    id: 'smoking_history',
    section: 'Estilo de Vida',
    text: '¿Fumaba o fuma Ud. actualmente?',
    type: 'yes-no',
    required: true,
    subQuestions: [
      {
        id: 'smoking_current_status',
        section: 'Estilo de Vida',
        text: 'Estado actual',
        type: 'select',
        required: false,
        options: [
          { value: 'current', label: 'Fumador actual' },
          { value: 'quit', label: 'Dejó de fumar' },
        ],
      },
      {
        id: 'smoking_daily_quantity',
        section: 'Estilo de Vida',
        text: '¿Cantidad diaria?',
        type: 'number',
        required: false,
        placeholder: 'Número de cigarrillos al día',
      },
      {
        id: 'smoking_duration_years',
        section: 'Estilo de Vida',
        text: '¿Desde hace cuánto tiempo?',
        type: 'number',
        required: false,
        placeholder: 'Años fumando',
      },
      {
        id: 'smoking_quit_timing',
        section: 'Estilo de Vida',
        text: '¿Cuándo dejó de fumar?',
        type: 'text',
        required: false,
        placeholder: 'Hace cuánto tiempo dejó de fumar',
      },
    ],
  },

  // Question 7: Alcohol with sub-questions
  {
    id: 'alcohol_consumption',
    section: 'Estilo de Vida',
    text: '¿Consume bebidas alcohólicas?',
    type: 'yes-no',
    required: true,
    subQuestions: [
      {
        id: 'alcohol_type',
        section: 'Estilo de Vida',
        text: '¿Qué tipo?',
        type: 'text',
        required: false,
        placeholder: 'Cerveza, vino, licor, etc.',
      },
      {
        id: 'alcohol_frequency',
        section: 'Estilo de Vida',
        text: '¿Con qué frecuencia?',
        type: 'select',
        required: false,
        options: [
          { value: 'daily', label: 'Diariamente' },
          { value: 'weekly', label: 'Semanalmente' },
          { value: 'monthly', label: 'Mensualmente' },
          { value: 'occasional', label: 'Ocasionalmente' },
        ],
      },
      {
        id: 'alcohol_quantity',
        section: 'Estilo de Vida',
        text: '¿Qué cantidad?',
        type: 'text',
        required: false,
        placeholder: 'Cantidad por ocasión',
      },
    ],
  },

  // Question 8: Radio/Chemotherapy
  {
    id: 'radiotherapy_or_chemotherapy',
    section: 'Tratamientos Especiales',
    text: '¿Ha sido sometido a tratamiento con radioterapia o quimioterapia?',
    type: 'yes-no-details',
    required: true,
    placeholder: 'Especifique el tratamiento y cuándo',
  },

  // Question 9: Prosthetics
  {
    id: 'has_prosthetics',
    section: 'Información Física',
    text: '¿Usa prótesis dentales, auditivas, oculares u otras?',
    type: 'yes-no-details',
    required: true,
    placeholder: 'Especifique qué tipo de prótesis',
  },

  // Question 10: Neck mobility
  {
    id: 'limited_neck_mobility',
    section: 'Información Física',
    text: '¿Tiene limitación para mover el cuello?',
    type: 'yes-no-details',
    required: true,
    placeholder: 'Describa la limitación',
  },

  // Question 11: Mouth opening
  {
    id: 'limited_mouth_opening',
    section: 'Información Física',
    text: '¿Tiene dificultad para abrir la boca?',
    type: 'yes-no-details',
    required: true,
    placeholder: 'Describa la dificultad',
  },

  // Question 12: Weight changes
  {
    id: 'recent_weight_changes',
    section: 'Información Física',
    text: '¿Ha tenido cambios de peso importantes recientemente?',
    type: 'yes-no-details',
    required: true,
    placeholder: 'Especifique cuánto peso ganó o perdió',
  },

  // Question 13: Seizures
  {
    id: 'has_seizures',
    section: 'Condiciones Neurológicas',
    text: '¿Sufre o ha sufrido de convulsiones?',
    type: 'yes-no-details',
    required: true,
    placeholder: 'Especifique frecuencia y tratamiento',
  },

  // Question 14: Mental health
  {
    id: 'mental_health_treatment',
    section: 'Condiciones Neurológicas',
    text: '¿Está bajo tratamiento psiquiátrico o psicológico?',
    type: 'yes-no-details',
    required: true,
    placeholder: 'Especifique el tratamiento',
  },

  // Question 15: Dietary regimen
  {
    id: 'dietary_regimen',
    section: 'Información Adicional',
    text: '¿Sigue algún régimen alimenticio especial?',
    type: 'yes-no-details',
    required: true,
    placeholder: 'Especifique el tipo de dieta',
  },
];

/**
 * Helper function to get questions by section
 */
export function getQuestionsBySection(section: string): FormQuestion[] {
  return PRE_ANESTHESIA_QUESTIONS.filter(q => q.section === section);
}

/**
 * Helper function to get all sections
 */
export function getAllSections(): string[] {
  const sections = new Set<string>();
  PRE_ANESTHESIA_QUESTIONS.forEach(q => sections.add(q.section));
  return Array.from(sections);
}

