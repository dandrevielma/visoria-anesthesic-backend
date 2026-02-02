# Forms Structure Documentation

## Overview

This document describes the complete structure of the Pre-Anesthesia forms used in the system. The forms are divided into two main parts:

1. **PARTE 1**: Patient Pre-Anesthesia Questionnaire (15 questions)
2. **PARTE 2**: Doctor's Clinical Evaluation (100+ fields)

## Architecture

### Storage Approach: JSONB Option 1

- Questions are defined as TypeScript constants in code
- Answers are stored as JSON in PostgreSQL JSONB columns
- No separate tables for individual questions
- Simple, efficient approach for static questionnaires

### Database Tables

#### 1. `patient_record_form`
- Stores patient questionnaire answers (PARTE 1)
- JSONB column: `record_specific_answers` (type: `PreAnesthesiaFormAnswers`)
- One record per consultation

#### 2. `doctor_evaluation`
- Stores doctor evaluation data (PARTE 2)
- JSONB column: `evaluation_data` (type: `DoctorEvaluationAnswers`)
- One record per consultation

---

## PARTE 1: Patient Pre-Anesthesia Questionnaire

**File**: `backend/src/forms/preAnesthesiaQuestions.ts`

### Sections and Questions

#### 1. Antecedentes Anestésicos (Anesthesia History)
- **Q1**: ¿Ha recibido Ud. anestesia anteriormente? (Yes/No with details)
  - Sub-fields: intervention, year, type
- **Q2**: ¿Han habido complicaciones... durante actos anestésicos? (Yes/No)
- **Q3**: ¿Tiene conocimiento de algún miembro de su familia...? (Yes/No)

#### 2. Medicamentos y Alergias (Medications and Allergies)
- **Q4**: ¿Toma... alguna medicina, adaptógenos, vitaminas...? (Yes/No)
- **Q5**: ¿Es alérgico a algún medicamento u otra sustancia? (Yes/No)

#### 3. Estilo de Vida (Lifestyle)
- **Q6-Q9**: Smoking History
  - Has smoked (Yes/No)
  - Current status (Current smoker / Quit)
  - Daily quantity (number)
  - Duration (years)
  - When stopped (text)
- **Q10-Q12**: Alcohol Consumption
  - Consumes alcohol (Yes/No)
  - Type (beer, wine, spirits, etc.)
  - Frequency (Daily, Weekly, Monthly, Occasional)
  - Quantity per occasion

#### 4. Tratamientos Especiales (Special Treatments)
- **Q13**: Radio/chemotherapy treatment (Yes/No)

#### 5. Información Física (Physical Information)
- **Q14**: Has prosthetics (Yes/No)
- **Q15**: Limited neck mobility (Yes/No)
- **Q16**: Limited mouth opening (Yes/No)
- **Q17**: Recent weight changes (Yes/No)

#### 6. Condiciones Neurológicas (Neurological Conditions)
- **Q18**: Has seizures (Yes/No)
- **Q19**: Mental health treatment (Yes/No)

#### 7. Información Adicional (Additional Information)
- **Q20**: Dietary regimen (Yes/No)

### TypeScript Interface

```typescript
interface PreAnesthesiaFormAnswers {
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
  smoking_current_status?: SelectAnswer;
  smoking_daily_quantity?: NumberAnswer;
  smoking_duration_years?: NumberAnswer;
  smoking_quit_timing?: TextAnswer;

  // Estilo de Vida - Alcohol
  alcohol_consumption: YesNoAnswer;
  alcohol_type?: TextAnswer;
  alcohol_frequency?: SelectAnswer;
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
```

---

## PARTE 2: Doctor's Clinical Evaluation

**File**: `backend/src/forms/doctorEvaluationQuestions.ts`

### Sections and Fields

#### 1. Datos de Identificación (Identification Data) - 8 fields
- Sex (M/F)
- Age (years)
- Weight (kg)
- Height (cm)
- BMI (calculated automatically)
- Diagnosis (text)
- Proposed intervention (text)
- Treating doctor (text)

#### 2. Antecedentes (Medical History) - 8 fields
- Previous anesthesia count (number)
- Previous complications (text)
- Medication allergy (Yes/No with details)
- Hypertension (Yes/No with treatment details)
- Diabetes (Yes/No with type and treatment)
- Antiplatelet suspension (Yes/No)

#### 3. Examen Físico (Physical Examination) - 20+ fields

**Vital Signs:**
- Blood pressure (e.g., "120/80 mmHg")
- Respiratory rate (breaths/min)
- Heart rate (bpm)
- Temperature (°C)

**General Examination:**
- Skin appearance (Normal, Pale, Cyanotic, Icteric)
- Consciousness (Temporal, Personal, Spatial - each Yes/No)
- Head-neck normocephalic (Yes/No)
- Spine visible/palpable (each Yes/No)
- Pulmonary eupneic (Yes/No) with spirometry results
- Abdomen examination (text)

#### 4. Laboratorio y Paraclínicos (Laboratory Tests) - 14 fields
- Hb (g/dL)
- Hto (%)
- Glucose (mg/dL)
- Platelets (per mm³)
- WBC (per mm³)
- PT (seconds)
- PTT (seconds)
- Fibrinogen (mg/dL)
- HIV (Positive/Negative/Not Tested)
- VDRL (Positive/Negative/Not Tested)
- Creatinine (mg/dL)
- Urea (mg/dL)
- Total Proteins (g/dL)
- Albumin (g/dL)

#### 5. Evaluación Cardiovascular (Cardiovascular Assessment) - 4 fields
- Evaluation date
- Chest X-ray findings
- EKG findings
- Exercise tolerance (METS <4 or >4)

#### 6. Vía Aérea (Airway Assessment) - 4 fields
- Mallampati classification (I, II, III, IV)
- Thyromental distance (cm)
- Mouth opening (cm)
- Cervical mobility (Normal/Limited)

#### 7. Indicadores de Riesgo (Risk Indicators) - 4 fields
- ASA Classification (I, II, III, IV, V, +E variants)
- Johns Hopkins Classification (I-V)
- Airway Risk (I-V)
- BMI Calculation (automatic)

#### 8. Plan y Observaciones (Plan and Observations) - 5 fields
- Suggested anesthetic technique (textarea)
- Nebulization premedication (S/N)
- Steroids VEV (S/N)
- Perioperative glycemia (S/N)
- SAP notes (textarea)

### TypeScript Interface

```typescript
interface DoctorEvaluationAnswers {
  // Datos de Identificación
  patient_sex: SelectAnswer;
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
  diabetes_type?: SelectAnswer;
  diabetes_treatment?: TextAnswer;
  antiplatelet_suspended: YesNoAnswer;

  // Examen Físico - Signos Vitales
  blood_pressure: TextAnswer;
  respiratory_rate: NumberAnswer;
  heart_rate: NumberAnswer;
  temperature: NumberAnswer;

  // Examen Físico - General
  skin_appearance: SelectAnswer;
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
  lab_hiv?: SelectAnswer;
  lab_vdrl?: SelectAnswer;
  lab_creatinine?: NumberAnswer;
  lab_urea?: NumberAnswer;
  lab_total_proteins?: NumberAnswer;
  lab_albumin?: NumberAnswer;

  // Evaluación Cardiovascular
  cardiovascular_eval_date?: DateAnswer;
  chest_xray?: TextAnswer;
  ekg?: TextAnswer;
  exercise_tolerance_mets?: SelectAnswer;

  // Vía Aérea
  mallampati_classification: SelectAnswer;
  thyromental_distance: NumberAnswer;
  mouth_opening: NumberAnswer;
  cervical_mobility: SelectAnswer;

  // Indicadores de Riesgo
  asa_classification: SelectAnswer;
  johns_hopkins_classification: SelectAnswer;
  airway_risk: SelectAnswer;
  bmi_calculation?: NumberAnswer;

  // Plan y Observaciones
  suggested_anesthetic_technique: TextAnswer;
  nebulization_premedication: YesNoAnswer;
  steroids_vev: YesNoAnswer;
  perioperative_glycemia: YesNoAnswer;
  sap_notes?: TextAnswer;
}
```

---

## Helper Functions

### BMI Calculation
```typescript
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(2));
}
```

### Form Completion Validation
```typescript
// Check if patient form is complete
isPatientFormComplete(answers: Partial<PreAnesthesiaFormAnswers>): boolean

// Check if doctor evaluation is complete
isDoctorEvaluationComplete(answers: Partial<DoctorEvaluationAnswers>): boolean
```

---

## Workflow

1. **Doctor creates consultation**: Chooses Sedation or Surgical type
2. **Doctor shares link**: `/patient/{identification_number}/{record_uuid}`
3. **Patient fills PARTE 1**: Answers 15 questions via the link
4. **System saves answers**: Stored in `patient_record_form.record_specific_answers`
5. **Doctor reviews patient answers**: Can see completed questionnaire
6. **Doctor fills PARTE 2**: Complete clinical evaluation (100+ fields)
7. **System saves evaluation**: Stored in `doctor_evaluation.evaluation_data`
8. **Record marked complete**: Consultation marked as completed

---

## Next Steps

### Frontend Implementation Needed:
1. ✅ TypeScript interfaces updated
2. ⏳ Create `PatientQuestionnaireForm` component
3. ⏳ Create `DoctorEvaluationForm` component
4. ⏳ Create API endpoints for form submission
5. ⏳ Implement auto-save functionality
6. ⏳ Connect patient route to actual forms
7. ⏳ Build doctor dashboard for evaluations

### Backend API Endpoints Needed:
```
POST   /api/records/:recordId/patient-form       - Save patient answers
GET    /api/records/:recordId/patient-form       - Get patient answers
PUT    /api/records/:recordId/patient-form       - Update patient answers (auto-save)

POST   /api/records/:recordId/doctor-evaluation  - Save doctor evaluation
GET    /api/records/:recordId/doctor-evaluation  - Get doctor evaluation
PUT    /api/records/:recordId/doctor-evaluation  - Update evaluation (auto-save)
```

---

## File Structure

```
backend/src/forms/
├── index.ts                        # Central export
├── types.ts                        # TypeScript interfaces (UPDATED)
├── preAnesthesiaQuestions.ts      # PARTE 1 - 15 questions
└── doctorEvaluationQuestions.ts   # PARTE 2 - 100+ fields
```
