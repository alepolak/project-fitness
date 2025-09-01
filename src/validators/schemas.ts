/**
 * Ajv validation schemas for all data entities
 * Following cursor rules for strict type validation
 */

import Ajv, { JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";
import type {
  AppSettings,
  BodyMetricEntry,
  ExerciseCatalogItem,
  WorkoutLogEntry,
  PerformedSet,
  BaselineTestEntry,
  GlossaryItem,
} from "@/types";

// Initialize Ajv instance with strict settings
const ajv = new Ajv({ strict: true, allErrors: true });
addFormats(ajv);

// Base entity schema properties
const baseEntityProps = {
  id: { type: "string", minLength: 1 },
  created_at: { type: "string", format: "date-time" },
  updated_at: { type: "string", format: "date-time" },
  version: { type: "number", minimum: 1 },
} as const;

// App Settings Schema
export const appSettingsSchema: JSONSchemaType<AppSettings> = {
  type: "object",
  properties: {
    ...baseEntityProps,
    unit_system: { type: "string", enum: ["imperial", "metric"] },
    theme: { type: "string", enum: ["system", "light", "dark"] },
    language: { type: "string", enum: ["en"] },
    data_version: { type: "number", minimum: 1 },
    privacy_acknowledged: { type: "boolean" },
  },
  required: [
    "id",
    "unit_system",
    "theme", 
    "language",
    "data_version",
    "privacy_acknowledged",
    "created_at",
    "updated_at",
    "version",
  ],
  additionalProperties: false,
};

// Body Metric Entry Schema
export const bodyMetricEntrySchema: JSONSchemaType<BodyMetricEntry> = {
  type: "object",
  properties: {
    ...baseEntityProps,
    date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    body_weight: { type: "number", minimum: 0 },
    weight_unit: { type: "string", enum: ["lb", "kg"] },
    body_fat_percent: { type: "number", nullable: true, minimum: 0, maximum: 100 },
    body_muscle_percent: { type: "number", nullable: true, minimum: 0, maximum: 100 },
    notes: { type: "string", nullable: true, maxLength: 1000 },
  },
  required: [
    "id",
    "date",
    "body_weight",
    "weight_unit",
    "created_at",
    "updated_at", 
    "version",
  ],
  additionalProperties: false,
};

// Media Item Schema
const mediaItemSchema = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["photo", "gif", "video"] },
    source: { type: "string", minLength: 1 },
    alt_text: { type: "string", minLength: 1 },
    caption: { type: "string", nullable: true },
  },
  required: ["type", "source", "alt_text"],
  additionalProperties: false,
} as const;

// Exercise Catalog Item Schema
export const exerciseSchema: JSONSchemaType<ExerciseCatalogItem> = {
  type: "object",
  properties: {
    ...baseEntityProps,
    name: { type: "string", minLength: 1, maxLength: 200 },
    aliases: { type: "array", items: { type: "string" } },
    movement_pattern: {
      type: "string",
      enum: ["hinge", "squat", "press", "pull", "carry", "core"],
    },
    primary_muscles: { type: "array", items: { type: "string" }, minItems: 1 },
    secondary_muscles: { 
      type: "array", 
      items: { type: "string" }, 
      nullable: true 
    },
    equipment: { type: "array", items: { type: "string" } },
    step_by_step_instructions: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
    },
    safety_notes: { type: "array", items: { type: "string" } },
    media: { type: "array", items: mediaItemSchema },
    beginner_friendly_name: { type: "string", minLength: 1, maxLength: 200 },
    difficulty_level: {
      type: "string",
      enum: ["beginner", "intermediate", "advanced"],
    },
    exercise_type: {
      type: "string",
      enum: ["strength", "cardio", "flexibility", "balance"],
    },
  },
  required: [
    "id",
    "name",
    "aliases",
    "movement_pattern",
    "primary_muscles",
    "equipment",
    "step_by_step_instructions",
    "safety_notes",
    "media",
    "beginner_friendly_name",
    "difficulty_level",
    "exercise_type",
    "created_at",
    "updated_at",
    "version",
  ],
  additionalProperties: false,
};

// Performed Set Schema
const performedSetSchema: JSONSchemaType<PerformedSet> = {
  type: "object",
  properties: {
    set_number: { type: "number", minimum: 1 },
    repetitions_done: { type: "number", minimum: 0 },
    weight_value: { type: "number", nullable: true, minimum: 0 },
    weight_unit: { type: "string", nullable: true, enum: ["lb", "kg"] },
    rest_seconds_observed: { type: "number", nullable: true, minimum: 0 },
    perceived_effort_text: {
      type: "string",
      enum: ["very easy", "easy", "moderately hard", "hard", "very hard"],
    },
    rpe_score: { type: "number", nullable: true, minimum: 1, maximum: 10 },
    tempo_notes: { type: "string", nullable: true },
    form_breakdown: { type: "boolean", nullable: true },
    notes: { type: "string", nullable: true, maxLength: 500 },
    pain_back_0_to_10: { type: "number", nullable: true, minimum: 0, maximum: 10 },
    pain_knee_0_to_10: { type: "number", nullable: true, minimum: 0, maximum: 10 },
    pain_shoulder_0_to_10: { type: "number", nullable: true, minimum: 0, maximum: 10 },
    pain_other_location: { type: "string", nullable: true },
    pain_other_0_to_10: { type: "number", nullable: true, minimum: 0, maximum: 10 },
  },
  required: ["set_number", "repetitions_done", "perceived_effort_text"],
  additionalProperties: false,
};

// Strength Entry Schema
const strengthEntrySchema = {
  type: "object",
  properties: {
    type: { type: "string", const: "strength" },
    exercise_id: { type: "string", minLength: 1 },
    exercise_name: { type: "string", minLength: 1 },
    order_index: { type: "number", minimum: 0 },
    performed_sets: { type: "array", items: performedSetSchema, minItems: 1 },
    notes: { type: "string", nullable: true, maxLength: 500 },
    form_rating: { type: "number", nullable: true, minimum: 1, maximum: 5 },
  },
  required: ["type", "exercise_id", "exercise_name", "order_index", "performed_sets"],
  additionalProperties: false,
} as const;

// Cardio Segment Schema
const cardioSegmentSchema = {
  type: "object",
  properties: {
    segment_number: { type: "number", minimum: 1 },
    label: { type: "string", minLength: 1 },
    duration_seconds: { type: "number", minimum: 0 },
    distance_value: { type: "number", nullable: true, minimum: 0 },
    distance_unit: { 
      type: "string", 
      nullable: true, 
      enum: ["miles", "kilometers", "meters"] 
    },
    speed_mph_or_kph: { type: "number", nullable: true, minimum: 0 },
    incline_percent: { type: "number", nullable: true, minimum: 0 },
    resistance_level: { type: "number", nullable: true, minimum: 0 },
    average_heart_rate_bpm: { type: "number", nullable: true, minimum: 30, maximum: 250 },
    max_heart_rate_bpm: { type: "number", nullable: true, minimum: 30, maximum: 250 },
    perceived_effort: {
      type: "string",
      nullable: true,
      enum: ["very easy", "easy", "moderately hard", "hard", "very hard"],
    },
    notes: { type: "string", nullable: true, maxLength: 500 },
  },
  required: ["segment_number", "label", "duration_seconds"],
  additionalProperties: false,
} as const;

// Cardio Entry Schema
const cardioEntrySchema = {
  type: "object",
  properties: {
    type: { type: "string", const: "cardio" },
    mode: { type: "string", minLength: 1 },
    total_duration_seconds: { type: "number", minimum: 0 },
    segments: { type: "array", items: cardioSegmentSchema, minItems: 1 },
    average_heart_rate_bpm: { type: "number", nullable: true, minimum: 30, maximum: 250 },
    max_heart_rate_bpm: { type: "number", nullable: true, minimum: 30, maximum: 250 },
    calories_estimated: { type: "number", nullable: true, minimum: 0 },
    notes: { type: "string", nullable: true, maxLength: 500 },
  },
  required: ["type", "mode", "total_duration_seconds", "segments"],
  additionalProperties: false,
} as const;

// Flexibility Entry Schema
const flexibilityEntrySchema = {
  type: "object",
  properties: {
    type: { type: "string", const: "flexibility" },
    exercise_id: { type: "string", minLength: 1 },
    exercise_name: { type: "string", minLength: 1 },
    duration_seconds: { type: "number", minimum: 0 },
    hold_time_seconds: { type: "number", nullable: true, minimum: 0 },
    repetitions: { type: "number", nullable: true, minimum: 0 },
    perceived_stretch_intensity: {
      type: "string",
      nullable: true,
      enum: ["light", "moderate", "deep"],
    },
    notes: { type: "string", nullable: true, maxLength: 500 },
  },
  required: ["type", "exercise_id", "exercise_name", "duration_seconds"],
  additionalProperties: false,
} as const;

// Workout Log Entry Schema
export const workoutLogSchema: JSONSchemaType<WorkoutLogEntry> = {
  type: "object",
  properties: {
    ...baseEntityProps,
    date_time_start: { type: "string", format: "date-time" },
    date_time_end: { type: "string", nullable: true, format: "date-time" },
    session_plan_ref: { type: "string", nullable: true },
    session_title: { type: "string", nullable: true },
    entries: {
      type: "array",
      items: {
        oneOf: [strengthEntrySchema, cardioEntrySchema, flexibilityEntrySchema],
      },
      minItems: 1,
    },
    session_notes: { type: "string", nullable: true, maxLength: 1000 },
    overall_rating: { type: "number", nullable: true, minimum: 1, maximum: 5 },
    energy_level_start: { type: "number", nullable: true, minimum: 1, maximum: 5 },
    energy_level_end: { type: "number", nullable: true, minimum: 1, maximum: 5 },
    environment: {
      type: "string",
      nullable: true,
      enum: ["gym", "home", "outdoor", "other"],
    },
  },
  required: [
    "id",
    "date_time_start",
    "entries",
    "created_at",
    "updated_at",
    "version",
  ],
  additionalProperties: false,
};

// Baseline Test Entry Schema
export const baselineTestSchema: JSONSchemaType<BaselineTestEntry> = {
  type: "object",
  properties: {
    ...baseEntityProps,
    month: { type: "string", pattern: "^\\d{4}-\\d{2}$" },
    test_date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    rockport_time_mm_ss: { type: "string", nullable: true, pattern: "^\\d+:\\d{2}$" },
    rockport_finish_heart_rate_bpm: { 
      type: "number", 
      nullable: true, 
      minimum: 30, 
      maximum: 250 
    },
    twelve_minute_distance: { type: "number", nullable: true, minimum: 0 },
    twelve_minute_distance_unit: {
      type: "string",
      nullable: true,
      enum: ["miles", "kilometers"],
    },
    twelve_minute_average_heart_rate_bpm: {
      type: "number",
      nullable: true,
      minimum: 30,
      maximum: 250,
    },
    longest_continuous_jog_minutes: { type: "number", nullable: true, minimum: 0 },
    best_one_minute_heart_rate_drop_bpm: {
      type: "number",
      nullable: true,
      minimum: 0,
      maximum: 100,
    },
    resting_heart_rate_bpm: {
      type: "number",
      nullable: true,
      minimum: 30,
      maximum: 120,
    },
    blood_pressure_systolic: { type: "number", nullable: true, minimum: 70, maximum: 250 },
    blood_pressure_diastolic: { type: "number", nullable: true, minimum: 40, maximum: 150 },
    bench_press_1rm_lb: { type: "number", nullable: true, minimum: 0 },
    squat_1rm_lb: { type: "number", nullable: true, minimum: 0 },
    deadlift_1rm_lb: { type: "number", nullable: true, minimum: 0 },
    overhead_press_1rm_lb: { type: "number", nullable: true, minimum: 0 },
    pull_up_max_reps: { type: "number", nullable: true, minimum: 0 },
    push_up_max_reps: { type: "number", nullable: true, minimum: 0 },
    plank_max_seconds: { type: "number", nullable: true, minimum: 0 },
    sit_and_reach_inches: { type: "number", nullable: true },
    overhead_reach_test_pass: { type: "boolean", nullable: true },
    test_conditions: {
      type: "object",
      nullable: true,
      properties: {
        temperature_f: { type: "number", nullable: true },
        humidity_percent: { type: "number", nullable: true, minimum: 0, maximum: 100 },
        time_of_day: { type: "string", nullable: true },
        pre_test_nutrition: { type: "string", nullable: true },
        sleep_hours_previous_night: { type: "number", nullable: true, minimum: 0, maximum: 24 },
      },
      additionalProperties: false,
    },
    notes: { type: "string", nullable: true, maxLength: 1000 },
  },
  required: ["id", "month", "test_date", "created_at", "updated_at", "version"],
  additionalProperties: false,
};

// Glossary Item Schema
export const glossaryItemSchema: JSONSchemaType<GlossaryItem> = {
  type: "object",
  properties: {
    ...baseEntityProps,
    term: { type: "string", minLength: 1, maxLength: 100 },
    category: {
      type: "string",
      enum: ["exercise", "nutrition", "recovery", "technique", "equipment"],
    },
    plain_definition: { type: "string", minLength: 1, maxLength: 500 },
    why_it_matters: { type: "string", minLength: 1, maxLength: 1000 },
    how_to_do_it_safely: { type: "array", items: { type: "string" }, minItems: 1 },
    common_mistakes: { type: "array", items: { type: "string" }, nullable: true },
    media: { type: "array", items: mediaItemSchema },
    related_terms: { type: "array", items: { type: "string" } },
    difficulty_level: {
      type: "string",
      enum: ["beginner", "intermediate", "advanced"],
    },
  },
  required: [
    "id",
    "term",
    "category",
    "plain_definition",
    "why_it_matters",
    "how_to_do_it_safely",
    "media",
    "related_terms",
    "difficulty_level",
    "created_at",
    "updated_at",
    "version",
  ],
  additionalProperties: false,
};

// Compile validators
export const validateAppSettings = ajv.compile(appSettingsSchema);
export const validateBodyMetricEntry = ajv.compile(bodyMetricEntrySchema);
export const validateExercise = ajv.compile(exerciseSchema);
export const validateWorkoutLog = ajv.compile(workoutLogSchema);
export const validateBaselineTest = ajv.compile(baselineTestSchema);
export const validateGlossaryItem = ajv.compile(glossaryItemSchema);

// Export the Ajv instance for custom validations
export { ajv };
