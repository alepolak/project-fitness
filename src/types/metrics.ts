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
  notes?: string;
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
  };
  measurement_unit: "in" | "cm";
  notes?: string;
  created_at: string;
  updated_at: string;
  version: number;
}
