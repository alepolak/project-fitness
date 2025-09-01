import Ajv, { JSONSchemaType } from "ajv";
import type { AppSettings, Exercise, WorkoutEntry, Set } from "@/types";

// Initialize Ajv instance
const ajv = new Ajv();

// App Settings Schema
const appSettingsSchema: JSONSchemaType<AppSettings> = {
  type: "object",
  properties: {
    unit_system: { type: "string", enum: ["imperial", "metric"] },
    theme: { type: "string", enum: ["system", "light", "dark"] },
    privacy_acknowledged: { type: "boolean" },
    data_version: { type: "number", minimum: 1 },
  },
  required: ["unit_system", "theme", "privacy_acknowledged", "data_version"],
  additionalProperties: false,
};

// Set Schema
const setSchema: JSONSchemaType<Set> = {
  type: "object",
  properties: {
    weight: { type: "number", nullable: true, minimum: 0 },
    reps: { type: "number", nullable: true, minimum: 0 },
    duration: { type: "number", nullable: true, minimum: 0 },
    distance: { type: "number", nullable: true, minimum: 0 },
    rest: { type: "number", nullable: true, minimum: 0 },
  },
  required: [],
  additionalProperties: false,
};

// Exercise Schema
const exerciseSchema: JSONSchemaType<Exercise> = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 },
    name: { type: "string", minLength: 1 },
    category: { type: "string", minLength: 1 },
    instructions: { type: "string", nullable: true },
    equipment: {
      type: "array",
      items: { type: "string" },
      nullable: true,
    },
  },
  required: ["id", "name", "category"],
  additionalProperties: false,
};

// Workout Entry Schema
const workoutEntrySchema: JSONSchemaType<WorkoutEntry> = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 1 },
    timestamp: { type: "number", minimum: 0 },
    version: { type: "number", minimum: 1 },
    exercise_id: { type: "string", minLength: 1 },
    sets: {
      type: "array",
      items: setSchema,
      minItems: 1,
    },
    notes: { type: "string", nullable: true },
    date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" }, // YYYY-MM-DD format
  },
  required: ["id", "timestamp", "version", "exercise_id", "sets", "date"],
  additionalProperties: false,
};

// Compile validators
export const validateAppSettings = ajv.compile(appSettingsSchema);
export const validateExercise = ajv.compile(exerciseSchema);
export const validateWorkoutEntry = ajv.compile(workoutEntrySchema);
export const validateSet = ajv.compile(setSchema);

// Default values
export const defaultAppSettings: AppSettings = {
  unit_system: "imperial",
  theme: "system",
  privacy_acknowledged: false,
  data_version: 1,
};

/**
 * Validates and sanitizes app settings
 */
export function sanitizeAppSettings(data: unknown): AppSettings {
  if (validateAppSettings(data)) {
    return data;
  }

  console.warn(
    "Invalid app settings, using defaults:",
    validateAppSettings.errors
  );
  return defaultAppSettings;
}

/**
 * Creates a validated workout entry with required metadata
 */
export function createWorkoutEntry(
  exerciseId: string,
  sets: Set[],
  date?: string,
  notes?: string
): WorkoutEntry {
  const entry: WorkoutEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    version: 1,
    exercise_id: exerciseId,
    sets,
    date: date || new Date().toISOString().split("T")[0],
    notes,
  };

  if (!validateWorkoutEntry(entry)) {
    throw new Error(
      `Invalid workout entry: ${JSON.stringify(validateWorkoutEntry.errors)}`
    );
  }

  return entry;
}

/**
 * Validates a set and returns a cleaned version
 */
export function sanitizeSet(data: unknown): Set | null {
  if (validateSet(data)) {
    return data;
  }

  console.warn("Invalid set data:", validateSet.errors);
  return null;
}
