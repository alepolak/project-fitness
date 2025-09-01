/**
 * Body metrics and measurements types
 * Following masterplan for baseline and progress tracking
 */

export interface BodyMetricEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  body_weight: number;
  weight_unit: "lb" | "kg";
  body_fat_percent?: number;
  body_muscle_percent?: number;
  hydration_percent?: number;
  bone_mass?: number;
  visceral_fat_rating?: number;
  metabolic_age?: number;
  notes?: string;
  measurement_device?: string; // Scale model/brand
  measurement_time?: string; // Time of day (HH:MM format)
  created_at: string;
  updated_at: string;
  version: number;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicep_left?: number;
    bicep_right?: number;
    thigh_left?: number;
    thigh_right?: number;
    neck?: number;
    forearm_left?: number;
    forearm_right?: number;
    calf_left?: number;
    calf_right?: number;
  };
  measurement_unit: "in" | "cm";
  measurement_technique?: string;
  notes?: string;
  progress_photo_ids?: string[]; // References to stored photos
  created_at: string;
  updated_at: string;
  version: number;
}

export interface FitnessGoal {
  id: string;
  title: string;
  description?: string;
  category: "weight" | "strength" | "cardio" | "body_composition" | "custom";
  goal_type: "target_value" | "increase_by" | "decrease_by" | "maintain";
  
  // Target values
  target_value?: number;
  target_unit?: string;
  current_value?: number;
  
  // Timeline
  start_date: string;
  target_date: string;
  
  // Tracking
  metric_to_track: string; // e.g., 'body_weight', 'bench_press_1rm_lb'
  measurement_frequency: "daily" | "weekly" | "monthly";
  
  // Progress
  status: "active" | "completed" | "paused" | "abandoned";
  completion_percentage: number;
  
  // Motivation
  why_important?: string;
  reward_for_completion?: string;
  
  created_at: string;
  updated_at: string;
  version: number;
}

export interface MetricsTrend {
  metric: string;
  trend: "increasing" | "decreasing" | "stable";
  rate: number; // Change per day/week/month
  confidence: number; // 0-1 scale
  period_days: number;
}

export interface HealthIndicators {
  bmi: {
    value: number;
    category: "underweight" | "normal" | "overweight" | "obese";
    healthy_range: { min: number; max: number };
  };
  body_fat?: {
    value: number;
    category: "essential" | "athletic" | "fitness" | "average" | "obese";
    healthy_range: { min: number; max: number };
  };
  waist_to_hip_ratio?: {
    value: number;
    risk_level: "low" | "moderate" | "high";
  };
}

export interface ProgressPhoto {
  id: string;
  date: string;
  photo_data: string; // Base64 encoded image
  photo_type: "front" | "side" | "back" | "custom";
  notes?: string;
  measurements_id?: string; // Link to body measurements
  created_at: string;
  updated_at: string;
  version: number;
}
