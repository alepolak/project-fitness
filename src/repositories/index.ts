/**
 * Repository exports for easy importing
 * Following cursor rules for clean imports
 */

export { BaseRepository } from "./base";
export { ExerciseRepository } from "./exerciseRepository";
export { WorkoutRepository } from "./workoutRepository";
export { MetricsRepository } from "./metricsRepository";
export { BaselineRepository } from "./baselineRepository";
export { SettingsRepository } from "./settingsRepository";

// Import for instances
import { ExerciseRepository } from "./exerciseRepository";
import { WorkoutRepository } from "./workoutRepository";
import { MetricsRepository } from "./metricsRepository";
import { BaselineRepository } from "./baselineRepository";
import { SettingsRepository } from "./settingsRepository";

// Repository instances for singleton usage
export const exerciseRepository = new ExerciseRepository();
export const workoutRepository = new WorkoutRepository();
export const metricsRepository = new MetricsRepository();
export const baselineRepository = new BaselineRepository();
export const settingsRepository = new SettingsRepository();
