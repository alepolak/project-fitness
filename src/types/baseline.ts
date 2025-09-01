/**
 * Baseline testing and assessment types
 * Following masterplan for cardiovascular and strength baselines
 */

export interface BaselineTestEntry {
  id: string;
  month: string; // "YYYY-MM" format for monthly testing
  test_date: string; // ISO date string when test was performed
  
  // Cardiovascular tests
  rockport_time_mm_ss?: string; // "MM:SS" format
  rockport_finish_heart_rate_bpm?: number;
  twelve_minute_distance?: number;
  twelve_minute_distance_unit?: "miles" | "kilometers";
  twelve_minute_average_heart_rate_bpm?: number;
  longest_continuous_jog_minutes?: number;
  best_one_minute_heart_rate_drop_bpm?: number;
  
  // Additional cardio metrics
  resting_heart_rate_bpm?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  
  // Strength baselines (1RM or estimated)
  bench_press_1rm_lb?: number;
  squat_1rm_lb?: number;
  deadlift_1rm_lb?: number;
  overhead_press_1rm_lb?: number;
  pull_up_max_reps?: number;
  push_up_max_reps?: number;
  plank_max_seconds?: number;
  
  // Flexibility and mobility
  sit_and_reach_inches?: number;
  overhead_reach_test_pass?: boolean;
  
  // Test conditions and notes
  test_conditions?: {
    temperature_f?: number;
    humidity_percent?: number;
    time_of_day?: string;
    pre_test_nutrition?: string;
    sleep_hours_previous_night?: number;
  };
  
  notes?: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface StrengthStandard {
  exercise_name: string;
  bodyweight_multiplier: {
    untrained: number;
    novice: number;
    intermediate: number;
    advanced: number;
    elite: number;
  };
  gender: "male" | "female";
}

export interface CardioStandard {
  test_name: string;
  age_ranges: Array<{
    min_age: number;
    max_age: number;
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  }>;
  gender: "male" | "female";
  unit: string;
  description: string;
}

export interface FitnessLevel {
  category: "strength" | "cardio" | "overall";
  level: "untrained" | "novice" | "intermediate" | "advanced" | "elite";
  percentile: number;
  next_level_target?: number;
  progress_to_next: number; // 0-100 percentage
}

export interface ImprovementStats {
  improvement: number;
  improvementPercent: number;
  startValue: number;
  endValue: number;
  unit?: string;
  period: string;
  trend: "improving" | "declining" | "stable";
}

export interface TestReminder {
  testType: string;
  testName: string;
  dueDate: string;
  overdue: boolean;
  importance: "high" | "medium" | "low";
  estimatedDuration: string;
}

export interface BaselineTestInstructions {
  testType: string;
  title: string;
  description: string;
  equipment: string[];
  duration: string;
  preparation: string[];
  steps: string[];
  safety_notes: string[];
  measurement_tips: string[];
}
