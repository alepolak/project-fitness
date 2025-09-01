/**
 * Exercise catalog and related types
 * Following masterplan for comprehensive exercise database
 */

export interface ExerciseCatalogItem {
  id: string;
  name: string;
  aliases: string[];
  movement_pattern: "hinge" | "squat" | "press" | "pull" | "carry" | "core";
  primary_muscles: string[];
  secondary_muscles?: string[];
  equipment: string[];
  step_by_step_instructions: string[];
  safety_notes: string[];
  media: MediaItem[];
  beginner_friendly_name: string;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  exercise_type: "strength" | "cardio" | "flexibility" | "balance";
  created_at: string;
  updated_at: string;
  version: number;
}

export interface MediaItem {
  type: "photo" | "gif" | "video";
  source: string; // blob reference or cached URL
  alt_text: string;
  caption?: string;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  description: string;
  exercises: string[]; // Array of exercise IDs
  icon_name?: string;
  color_theme?: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: "free_weights" | "machines" | "bodyweight" | "cardio" | "accessories";
  description?: string;
  alternatives?: string[];
}
