export type Species = 'CANINE' | 'FELINE';
export type Sex = 'MALE' | 'FEMALE';
export type UserRole = 'TUTOR' | 'PROFESSIONAL' | 'CLINIC_ADMIN' | 'SYSTEM_ADMIN';

export type BodyConditionScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; // WSAVA 1-9
export type MuscleConditionScore = 'NORMAL' | 'MILD_LOSS' | 'MODERATE_LOSS' | 'SEVERE_LOSS';

export type ActivityLevel = 'SEDENTARY' | 'MODERATE' | 'ACTIVE' | 'HIGH_ENERGY' | 'WORKING';

export type FeedingType = 
  | 'NATURAL_COOKED' 
  | 'NATURAL_RAW_BONES' 
  | 'COMMERCIAL_DRY' 
  | 'COMMERCIAL_WET' 
  | 'MIXED_FEEDING';

export type AppointmentType = 
  | 'CONSULTA' 
  | 'CONSULTORIA_NUTRICIONAL' 
  | 'RETORNO' 
  | 'REAVALIACAO_NUTRICIONAL';

export type AppointmentStatus = 'RASCUNHO' | 'EM_REVISAO' | 'FINALIZADO';

export interface Tutor {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  notes?: string;
  created_at: string;
}

export interface Patient {
  id: string;
  tutor_id: string;
  name: string;
  species: Species;
  breed: string;
  birth_date: string; // ISO
  sex: Sex;
  is_neutered: boolean;
  ideal_weight_kg: number;
  current_weight_kg: number;
  current_bcs: BodyConditionScore;
  avatar_url?: string;
  microchip?: string;
  allergies?: string[];
  comorbidities?: string[];
  created_at: string;
}

export interface MeasurementRecord {
  id: string;
  patient_id: string;
  appointment_id?: string;
  date: string;
  weight_kg: number;
  bcs: BodyConditionScore; // 1-9
  abdominal_circumference_cm?: number;
  thoracic_circumference_cm?: number;
  measured_by: string;
  notes?: string;
}

export interface AppointmentRecord {
  id: string;
  patient_id: string;
  professional_id: string;
  professional_name: string;
  type: AppointmentType;
  status: AppointmentStatus;
  occurred_at: string;
  version: number;
  notes: string;
  anamnesis: {
    reported_appetite: 'NORMAL' | 'INCREASED' | 'DECREASED' | 'ANOREXIA';
    water_intake: 'NORMAL' | 'POLYURIA_POLYDIPSIA' | 'DECREASED';
    stool_consistency: 'NORMAL' | 'SOFT' | 'DIARRHEA' | 'HARD';
    vomiting_episodes_per_week: number;
    treats_habits: string;
  };
  diet_recommendation?: string;
  created_at: string;
  history_versions?: {
    version: number;
    changed_at: string;
    changed_by: string;
    reason: string;
  }[];
}

export interface ExamParameterResult {
  id: string;
  parameter: string;
  category: 'HEMATOLOGY' | 'BIOCHEMISTRY' | 'HORMONES' | 'URINALYSIS' | 'OTHER';
  value: number | string;
  unit: string;
  reference_range: string;
  is_out_of_range: boolean;
  is_uncertain: boolean;
  uncertainty_reason?: string;
  confidence_score: number; // 0.0 a 1.0
  page_number?: number;
}

export interface DetectedPatientInfo {
  name: string;
  species: Species;
  breed: string;
  sex: Sex;
  is_neutered: boolean;
  approx_age?: string;
  weight_kg?: number;
}

export interface DetectedTutorInfo {
  name: string;
  phone?: string;
  email?: string;
}

export interface ExamExtractionResponse {
  laboratory_name: string;
  exam_date: string;
  patient_detected?: DetectedPatientInfo;
  tutor_detected?: DetectedTutorInfo;
  extracted_results: ExamParameterResult[];
  preliminary_summary: string;
  confidence_overall: number;
  api_notice?: string;
}

export interface ExamDocument {
  id: string;
  patient_id: string;
  appointment_id?: string;
  laboratory_name: string;
  exam_date: string;
  file_name: string;
  file_url: string;
  file_hash_sha256: string;
  extraction_status: 'PROCESSING' | 'PENDING_REVIEW' | 'REVIEWED_APPROVED' | 'REJECTED';
  extracted_results: ExamParameterResult[];
  patient_detected?: DetectedPatientInfo;
  tutor_detected?: DetectedTutorInfo;
  professional_review_notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export type IngredientCategory = 'PROTEIN' | 'CARBOHYDRATE' | 'VEGETABLE' | 'ORGAN' | 'FAT' | 'COMMERCIAL_FEED' | 'SUPPLEMENT';

export interface NutritionPlanItem {
  ingredient_name: string;
  quantity_grams: number;
  category?: IngredientCategory;
  kcal_per_100g?: number;
  notes?: string;
}

export interface NutritionPlan {
  id: string;
  patient_id: string;
  version: number;
  title: string;
  feeding_type: FeedingType;
  daily_energy_kcal: number; // MER
  meals_per_day: number;
  items: NutritionPlanItem[];
  supplements: string[];
  hydration_target_ml_day: number;
  transition_plan_days?: number;
  professional_id: string;
  is_active: boolean;
  approved_at: string;
  notes?: string;
}
