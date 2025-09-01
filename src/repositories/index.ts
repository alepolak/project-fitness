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
export { GlossaryRepository } from "./glossaryRepository";
export { PlanRepository } from "./planRepository";
export { GoalsRepository } from "./goalsRepository";
export { BodyMeasurementsRepository, ProgressPhotosRepository } from "./bodyMeasurementsRepository";

// Import for instances
import { ExerciseRepository } from "./exerciseRepository";
import { WorkoutRepository } from "./workoutRepository";
import { MetricsRepository } from "./metricsRepository";
import { BaselineRepository } from "./baselineRepository";
import { SettingsRepository } from "./settingsRepository";
import { GlossaryRepository } from "./glossaryRepository";
import { PlanRepository } from "./planRepository";
import { GoalsRepository } from "./goalsRepository";
import { BodyMeasurementsRepository, ProgressPhotosRepository } from "./bodyMeasurementsRepository";

// Repository instances for singleton usage
export const exerciseRepository = new ExerciseRepository();
export const workoutRepository = new WorkoutRepository();
export const metricsRepository = new MetricsRepository();
export const baselineRepository = new BaselineRepository();
export const settingsRepository = new SettingsRepository();
export const glossaryRepository = new GlossaryRepository();
export const planRepository = new PlanRepository();
export const goalsRepository = new GoalsRepository();
export const bodyMeasurementsRepository = new BodyMeasurementsRepository();
export const progressPhotosRepository = new ProgressPhotosRepository();
