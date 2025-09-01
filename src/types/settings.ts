/**
 * Settings and configuration types
 * Following masterplan specifications for user preferences
 */

export interface AppSettings {
  id: string;
  unit_system: "imperial" | "metric";
  theme: "system" | "light" | "dark";
  language: "en";
  data_version: number;
  privacy_acknowledged: boolean;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface UserPreferences {
  show_beginner_tips: boolean;
  default_rest_time_seconds: number;
  auto_save_workouts: boolean;
  exercise_order_preference: "alphabetical" | "recent" | "custom";
  weight_increment_lb: number;
  weight_increment_kg: number;
}
