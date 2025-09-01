/**
 * Workout logging and performance tracking types
 * Following masterplan for comprehensive workout recording
 */

export interface WorkoutLogEntry {
  id: string;
  date_time_start: string; // ISO string with time
  date_time_end?: string; // ISO string with time
  session_plan_ref?: string; // Reference to planned session
  session_title?: string;
  entries: ExerciseEntry[];
  session_notes?: string;
  overall_rating?: 1 | 2 | 3 | 4 | 5; // How did the workout feel overall
  energy_level_start?: 1 | 2 | 3 | 4 | 5;
  energy_level_end?: 1 | 2 | 3 | 4 | 5;
  environment?: "gym" | "home" | "outdoor" | "other";
  created_at: string;
  updated_at: string;
  version: number;
}

export type ExerciseEntry = StrengthEntry | CardioEntry | FlexibilityEntry;

export interface StrengthEntry {
  type: "strength";
  exercise_id: string;
  exercise_name: string; // Cached for performance
  order_index: number;
  performed_sets: PerformedSet[];
  notes?: string;
  form_rating?: 1 | 2 | 3 | 4 | 5; // How was form/technique
}

export interface PerformedSet {
  set_number: number;
  repetitions_done: number;
  weight_value?: number;
  weight_unit?: "lb" | "kg";
  rest_seconds_observed?: number;
  perceived_effort_text: "very easy" | "easy" | "moderately hard" | "hard" | "very hard";
  rpe_score?: number; // 1-10 RPE scale
  tempo_notes?: string;
  form_breakdown?: boolean; // Did form break down on this set
  notes?: string;
  // Pain tracking
  pain_back_0_to_10?: number;
  pain_knee_0_to_10?: number;
  pain_shoulder_0_to_10?: number;
  pain_other_location?: string;
  pain_other_0_to_10?: number;
}

export interface CardioEntry {
  type: "cardio";
  mode: string; // "treadmill_walk", "treadmill_run", "bike", "soccer_match"
  total_duration_seconds: number;
  segments: CardioSegment[];
  average_heart_rate_bpm?: number;
  max_heart_rate_bpm?: number;
  calories_estimated?: number;
  notes?: string;
}

export interface CardioSegment {
  segment_number: number;
  label: string; // "warm up", "interval 1 - hard", "interval 1 - easy"
  duration_seconds: number;
  distance_value?: number;
  distance_unit?: "miles" | "kilometers" | "meters";
  speed_mph_or_kph?: number;
  incline_percent?: number;
  resistance_level?: number; // For bikes, ellipticals
  average_heart_rate_bpm?: number;
  max_heart_rate_bpm?: number;
  perceived_effort?: "very easy" | "easy" | "moderately hard" | "hard" | "very hard";
  notes?: string;
}

export interface FlexibilityEntry {
  type: "flexibility";
  exercise_id: string;
  exercise_name: string;
  duration_seconds: number;
  hold_time_seconds?: number;
  repetitions?: number;
  perceived_stretch_intensity?: "light" | "moderate" | "deep";
  notes?: string;
}

// Workout summary and statistics
export interface WorkoutSummary {
  total_workouts: number;
  total_duration_minutes: number;
  exercises_performed: string[];
  strength_volume_lb: number;
  cardio_distance_miles: number;
  average_workout_rating: number;
  most_frequent_exercises: Array<{ exercise_id: string; count: number }>;
}

// Active session management types
export interface ActiveWorkoutSession {
  id: string;
  workoutLog: WorkoutLogEntry;
  currentExerciseIndex: number;
  sessionStatus: 'not-started' | 'active' | 'paused' | 'completed' | 'abandoned';
  startTime: string;
  pauseTime?: string;
  pauseDuration: number; // Total paused time in seconds
  isResting: boolean;
  restTimeRemaining: number;
  lastActivity: string; // ISO timestamp
  created_at: string;
  updated_at: string;
  version: number;
}

export interface WorkoutFilters {
  exerciseId?: string;
  dateRange?: { start: Date; end: Date };
  sessionType?: string;
  environment?: string;
  sortBy: 'date' | 'exercise' | 'duration' | 'rating';
  sortOrder: 'asc' | 'desc';
  searchQuery?: string;
}

export interface RestTimerState {
  isActive: boolean;
  timeRemaining: number;
  initialTime: number;
  exerciseId?: string;
  setNumber?: number;
}

export interface SessionProgress {
  exercisesCompleted: number;
  totalExercises: number;
  setsCompleted: number;
  totalSets: number;
  elapsedTime: number; // seconds
  estimatedTimeRemaining: number; // seconds
}

export interface WorkoutStats {
  totalVolume: number;
  averageRpe: number;
  maxWeight: number;
  totalReps: number;
  exerciseCount: number;
  duration: number; // seconds
}

export interface ExerciseProgressData {
  exerciseId: string;
  exerciseName: string;
  sessions: Array<{
    date: string;
    maxWeight: number;
    maxReps: number;
    totalVolume: number;
    averageRpe: number;
    setCount: number;
  }>;
}

export interface ProgressTrend {
  trend: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
  period: string;
}

// Notification types for workout events
export interface WorkoutNotification {
  id: string;
  type: 'rest-complete' | 'set-reminder' | 'session-paused' | 'hydration-reminder';
  title: string;
  message: string;
  timestamp: string;
  exerciseId?: string;
  setNumber?: number;
}
