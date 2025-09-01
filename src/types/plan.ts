/**
 * Workout planning and program types
 * Following masterplan for comprehensive planning system
 */

export interface ProgramPlan {
  id: string;
  title: string;
  description?: string;
  duration_weeks: number;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  phases: Phase[];
  tags: string[];
  author?: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface Phase {
  name: "Base" | "Build" | "Peak";
  description?: string;
  duration_weeks: number;
  weeks: Week[];
}

export interface Week {
  index: number; // 1-based week number within phase
  deload_week: boolean;
  days: Day[];
}

export interface Day {
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  date?: string; // ISO string, optional for templates
  is_rest_day: boolean;
  sessions: Session[];
}

export interface Session {
  id: string;
  session_type: "strength" | "intervals" | "steady_cardio" | "sport" | "flexibility";
  title: string;
  description?: string;
  estimated_duration_minutes: number;
  exercises: ExercisePrescription[];
  warm_up_notes?: string;
  cool_down_notes?: string;
}

export interface ExercisePrescription {
  exercise_id: string;
  clear_description: string;
  order_index: number;
  sets?: SetPrescription[];
  cardio_block?: CardioBlock;
  rest_notes?: string;
  form_cues?: string[];
}

export interface SetPrescription {
  set_number: number;
  target_repetitions: number | { min: number; max: number };
  target_weight_value?: number;
  target_weight_unit?: "lb" | "kg";
  target_weight_percentage?: number; // % of 1RM
  rest_seconds?: number;
  tempo_text?: string; // e.g., "3-1-2-0"
  rpe_target?: number; // Rate of Perceived Exertion 1-10
  notes_for_user?: string;
}

export interface CardioBlock {
  warm_up_minutes: number;
  work_intervals: CardioInterval[];
  cool_down_minutes: number;
  safety_notes: string;
  equipment_needed?: string[];
}

export interface CardioInterval {
  interval_number: number;
  hard_seconds: number;
  easy_seconds: number;
  target_heart_rate_range_bpm?: [number, number];
  target_pace?: string;
  target_incline_percent?: number;
  notes?: string;
}

// Additional types for plan management and editing

export interface SessionPath {
  phaseIndex: number;
  weekIndex: number;
  dayIndex: number;
  sessionIndex: number;
}

export interface PlanSearchFilters {
  query?: string;
  difficulty_level?: "beginner" | "intermediate" | "advanced";
  duration_weeks?: { min?: number; max?: number };
  session_types?: string[];
  tags?: string[];
  is_template?: boolean;
}

export interface PlanTemplate {
  id: string;
  title: string;
  description: string;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  duration_weeks: number;
  session_types: string[];
  tags: string[];
  preview_sessions: number;
  plan: ProgramPlan;
}

export interface CompletedSession {
  id: string;
  session_id: string;
  completion_date: string; // ISO string
  session_path: SessionPath;
  plan_id: string;
  actual_duration_minutes?: number;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface PlanProgress {
  plan_id: string;
  current_phase_index: number;
  current_week_index: number;
  completed_sessions: Set<string>; // session IDs
  total_sessions: number;
  completed_count: number;
  completion_percentage: number;
  estimated_completion_date?: string;
  last_session_date?: string;
}

export interface ExerciseSelectionFilters {
  movement_patterns?: string[];
  equipment?: string[];
  primary_muscles?: string[];
  difficulty_level?: "beginner" | "intermediate" | "advanced";
  exercise_type?: "strength" | "cardio" | "flexibility" | "balance";
}

export interface PlanStats {
  total_sessions: number;
  sessions_by_type: Record<string, number>;
  total_exercises: number;
  unique_exercises: number;
  estimated_total_duration_minutes: number;
  phases_count: number;
  weeks_per_phase: number[];
}
