/**
 * Doctor Evaluation Questions
 * Structured questionnaire for pre-anesthesia medical evaluation
 */

export interface DoctorEvaluationQuestion {
  id: string
  section: string
  text: string
  type: 'yes-no' | 'yes-no-details' | 'text' | 'textarea' | 'number' | 'select' | 'select-multiple'
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  conditionalOn?: {
    questionId: string
    value: string | string[]
  }
}

export const DOCTOR_EVALUATION_QUESTIONS: DoctorEvaluationQuestion[] = [
  // Datos del Paciente
  {
    id: 'nombre_paciente',
    section: 'Datos del Paciente',
    text: 'Nombre del paciente',
    type: 'text',
    required: true,
  },
  {
    id: 'sexo',
    section: 'Datos del Paciente',
    text: 'Sexo',
    type: 'select',
    required: true,
    options: [
      { label: 'Masculino', value: 'masculino' },
      { label: 'Femenino', value: 'femenino' },
    ],
  },
  {
    id: 'edad',
    section: 'Datos del Paciente',
    text: 'Edad',
    type: 'number',
    required: true,
  },
  {
    id: 'peso_kg',
    section: 'Datos del Paciente',
    text: 'Peso (kg)',
    type: 'number',
    required: true,
  },
  {
    id: 'talla_m',
    section: 'Datos del Paciente',
    text: 'Talla (m)',
    type: 'number',
    required: true,
    placeholder: 'Ej: 1.70',
  },
  {
    id: 'imc',
    section: 'Datos del Paciente',
    text: 'Índice de Masa Corporal (IMC)',
    type: 'number',
    placeholder: 'Se calcula automáticamente con peso / talla²',
  },
  {
    id: 'diagnostico',
    section: 'Datos del Paciente',
    text: 'Diagnóstico',
    type: 'text',
    required: true,
  },
  {
    id: 'intervencion_propuesta',
    section: 'Datos del Paciente',
    text: 'Intervención propuesta',
    type: 'text',
    required: true,
  },
  {
    id: 'medico_tratante',
    section: 'Datos del Paciente',
    text: 'Médico tratante',
    type: 'select',
    required: true,
    subQuestions: [
      {
        id: 'medico_tratante_otro',
        text: 'Especifique el nombre del médico',
        type: 'text',
        placeholder: 'Nombre completo del médico',
        showWhen: 'OTRO',
      },
    ],
  },

  // Antecedentes y Encuesta
  {
    id: 'anestesias_previas',
    section: 'Antecedentes y Encuesta',
    text: '¿Ha recibido anestesias previas?',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'complicaciones_anestesicas',
    section: 'Antecedentes y Encuesta',
    text: '¿Presentó complicaciones con anestesias previas?',
    type: 'yes-no-details',
    required: true,
  },
  {
    id: 'alergia_a_medicamentos',
    section: 'Antecedentes y Encuesta',
    text: '¿Alergia a medicamentos?',
    type: 'yes-no-details',
    required: true,
  },
  {
    id: 'hipertension_arterial_sistemica',
    section: 'Antecedentes y Encuesta',
    text: '¿Hipertensión arterial sistémica?',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'tratamiento_hipertension',
    section: 'Antecedentes y Encuesta',
    text: 'Tratamiento para hipertensión',
    type: 'text',
    conditionalOn: {
      questionId: 'hipertension_arterial_sistemica',
      value: 'yes',
    },
  },
  {
    id: 'diabetes',
    section: 'Antecedentes y Encuesta',
    text: 'Diabetes',
    type: 'select',
    required: true,
    options: [
      { label: 'No', value: 'no' },
      { label: 'Tipo 1', value: 'tipo_1' },
      { label: 'Tipo 2', value: 'tipo_2' },
    ],
  },
  {
    id: 'tratamiento_diabetes',
    section: 'Antecedentes y Encuesta',
    text: 'Tratamiento para diabetes',
    type: 'text',
    conditionalOn: {
      questionId: 'diabetes',
      value: ['tipo_1', 'tipo_2'],
    },
  },
  {
    id: 'antiagregante_suspendido_hace',
    section: 'Antecedentes y Encuesta',
    text: 'Antiagregante suspendido hace',
    type: 'text',
    placeholder: 'Indicar tiempo de suspensión',
  },

  // Examen Físico - Signos Vitales
  {
    id: 'tension_arterial_mmHg',
    section: 'Examen Físico - Signos Vitales',
    text: 'Tensión arterial (mmHg)',
    type: 'text',
    required: true,
    placeholder: 'Ej: 120/80',
  },
  {
    id: 'frecuencia_respiratoria',
    section: 'Examen Físico - Signos Vitales',
    text: 'Frecuencia respiratoria',
    type: 'number',
    required: true,
  },
  {
    id: 'frecuencia_cardiaca',
    section: 'Examen Físico - Signos Vitales',
    text: 'Frecuencia cardíaca',
    type: 'number',
    required: true,
  },
  {
    id: 'temperatura_c',
    section: 'Examen Físico - Signos Vitales',
    text: 'Temperatura (°C)',
    type: 'number',
    required: true,
  },

  // Examen Físico - General
  {
    id: 'aspecto_piel_sin_lesiones',
    section: 'Examen Físico',
    text: 'Aspecto de la piel: sin lesiones evidentes',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'estado_conciencia_tiempo',
    section: 'Examen Físico',
    text: 'Estado de conciencia: Orientado en Tiempo',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'estado_conciencia_persona',
    section: 'Examen Físico',
    text: 'Estado de conciencia: Orientado en Persona',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'estado_conciencia_espacio',
    section: 'Examen Físico',
    text: 'Estado de conciencia: Orientado en Espacio',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'cabeza_cuello_normocefalo',
    section: 'Examen Físico',
    text: 'Cabeza y cuello: normocéfalo',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'cabeza_cuello_sin_lesiones',
    section: 'Examen Físico',
    text: 'Cabeza y cuello: sin lesiones evidentes',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'columna_apofisis_visibles',
    section: 'Examen Físico',
    text: 'Columna vertebral: apófisis espinosas visibles',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'columna_apofisis_palpables',
    section: 'Examen Físico',
    text: 'Columna vertebral: apófisis espinosas palpables',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'evaluacion_pulmonar_eupneico',
    section: 'Examen Físico',
    text: 'Evaluación pulmonar: eupneico en reposo',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'espirometria',
    section: 'Examen Físico',
    text: 'Espirometría',
    type: 'text',
  },
  {
    id: 'abdomen_sin_lesiones',
    section: 'Examen Físico',
    text: 'Abdomen: sin lesiones evidentes',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'osteo_muscular_sin_lesiones',
    section: 'Examen Físico',
    text: 'Osteo-muscular: sin lesiones evidentes',
    type: 'yes-no',
    required: true,
  },

  // Evaluación Cardiovascular
  {
    id: 'rx_torax',
    section: 'Evaluación Cardiovascular',
    text: 'Radiografía de tórax',
    type: 'text',
  },
  {
    id: 'ekg',
    section: 'Evaluación Cardiovascular',
    text: 'Electrocardiograma (EKG)',
    type: 'text',
  },
  {
    id: 'tolerancia_ejercicio_mets',
    section: 'Evaluación Cardiovascular',
    text: 'Tolerancia al ejercicio (METS)',
    type: 'select',
    options: [
      { label: '< 4 METS', value: 'menos_4' },
      { label: '> 4 METS', value: 'mas_4' },
    ],
  },

  // Vía Aérea
  {
    id: 'mallampati',
    section: 'Vía Aérea',
    text: 'Clasificación de Mallampati',
    type: 'select',
    required: true,
    options: [
      { label: 'I', value: '1' },
      { label: 'II', value: '2' },
      { label: 'III', value: '3' },
      { label: 'IV', value: '4' },
    ],
  },
  {
    id: 'apertura_oral',
    section: 'Vía Aérea',
    text: 'Apertura oral',
    type: 'text',
    required: true,
  },
  {
    id: 'distancia_tiromentoniana_cm',
    section: 'Vía Aérea',
    text: 'Distancia tiromentoniana (cm)',
    type: 'number',
    required: true,
  },
  {
    id: 'movilidad_cervical',
    section: 'Vía Aérea',
    text: 'Movilidad cervical',
    type: 'select',
    required: true,
    options: [
      { label: 'Clase I', value: 'clase_1' },
      { label: 'Clase II', value: 'clase_2' },
      { label: 'Clase III', value: 'clase_3' },
      { label: 'Clase IV', value: 'clase_4' },
    ],
  },

  // Indicadores de Riesgo
  {
    id: 'asa',
    section: 'Indicadores de Riesgo',
    text: 'Clasificación ASA',
    type: 'select',
    required: true,
    options: [
      { label: 'I', value: '1' },
      { label: 'II', value: '2' },
      { label: 'III', value: '3' },
      { label: 'IV', value: '4' },
      { label: 'V', value: '5' },
      { label: 'E', value: 'e' },
    ],
  },
  {
    id: 'johns_hopkins',
    section: 'Indicadores de Riesgo',
    text: 'Escala Johns Hopkins',
    type: 'select',
    required: true,
    options: [
      { label: 'I', value: '1' },
      { label: 'II', value: '2' },
      { label: 'III', value: '3' },
      { label: 'IV', value: '4' },
      { label: 'V', value: '5' },
    ],
  },
  {
    id: 'via_aerea_riesgo',
    section: 'Indicadores de Riesgo',
    text: 'Clasificación de riesgo de vía aérea',
    type: 'select',
    required: true,
    options: [
      { label: 'I', value: '1' },
      { label: 'II', value: '2' },
      { label: 'III', value: '3' },
      { label: 'IV', value: '4' },
      { label: 'V', value: '5' },
    ],
  },

  // Plan Anestésico
  {
    id: 'tecnica_anestesica_sugerida',
    section: 'Plan Anestésico',
    text: 'Técnica anestésica sugerida',
    type: 'textarea',
    required: true,
  },
  {
    id: 'nebulizacion',
    section: 'Plan Anestésico',
    text: 'Nebulización',
    type: 'yes-no',
  },
  {
    id: 'esteroides_vev',
    section: 'Plan Anestésico',
    text: 'Esteroides VEV',
    type: 'yes-no',
  },
  {
    id: 'glicemias_perioperatorias',
    section: 'Plan Anestésico',
    text: 'Glicemias perioperatorias',
    type: 'yes-no',
  },
  {
    id: 'sap',
    section: 'Plan Anestésico',
    text: 'S.A.P.',
    type: 'text',
  },

  // Cierre
  {
    id: 'observaciones',
    section: 'Observaciones',
    text: 'Observaciones',
    type: 'textarea',
  },
  {
    id: 'medico_anestesiologo',
    section: 'Observaciones',
    text: 'Médico anestesiólogo',
    type: 'text',
    required: true,
  },
]
