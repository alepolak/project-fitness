/**
 * Validation service with user-friendly error messages
 * Following cursor rules for error handling and type safety
 */

import {
  validateAppSettings,
  validateBodyMetricEntry,
  validateExercise,
  validateWorkoutLog,
  validateBaselineTest,
  validateGlossaryItem,
} from "./schemas";
import type {
  AppSettings,
  BodyMetricEntry,
  ExerciseCatalogItem,
  WorkoutLogEntry,
  BaselineTestEntry,
  GlossaryItem,
} from "@/types";

export class ValidationService {
  // Validate app settings
  static validateAppSettings(data: unknown): AppSettings {
    if (validateAppSettings(data)) {
      return data;
    }
    
    throw this.createValidationError(
      "INVALID_APP_SETTINGS",
      "Invalid app settings format",
      validateAppSettings.errors || []
    );
  }

  // Validate body metric entry
  static validateBodyMetricEntry(data: unknown): BodyMetricEntry {
    if (validateBodyMetricEntry(data)) {
      return data;
    }
    
    throw this.createValidationError(
      "INVALID_BODY_METRIC",
      "Invalid body metric entry format",
      validateBodyMetricEntry.errors || []
    );
  }

  // Validate exercise
  static validateExercise(data: unknown): ExerciseCatalogItem {
    if (validateExercise(data)) {
      return data;
    }
    
    throw this.createValidationError(
      "INVALID_EXERCISE",
      "Invalid exercise format",
      validateExercise.errors || []
    );
  }

  // Validate workout log
  static validateWorkoutLog(data: unknown): WorkoutLogEntry {
    if (validateWorkoutLog(data)) {
      return data;
    }
    
    throw this.createValidationError(
      "INVALID_WORKOUT_LOG",
      "Invalid workout log format",
      validateWorkoutLog.errors || []
    );
  }

  // Validate baseline test
  static validateBaselineTest(data: unknown): BaselineTestEntry {
    if (validateBaselineTest(data)) {
      return data;
    }
    
    throw this.createValidationError(
      "INVALID_BASELINE_TEST",
      "Invalid baseline test format",
      validateBaselineTest.errors || []
    );
  }

  // Validate glossary item
  static validateGlossaryItem(data: unknown): GlossaryItem {
    if (validateGlossaryItem(data)) {
      return data;
    }
    
    throw this.createValidationError(
      "INVALID_GLOSSARY_ITEM",
      "Invalid glossary item format",
      validateGlossaryItem.errors || []
    );
  }

  // Create user-friendly validation error
  private static createValidationError(
    code: string,
    message: string,
    errors: unknown[]
  ): Error {
    const userFriendlyMessages = this.formatValidationErrors(errors);
    const errorMessage = `${message}: ${userFriendlyMessages.join(", ")}`;
    
    const error = new Error(errorMessage) as Error & { code: string; details: unknown[] };
    error.name = "ValidationError";
    error.code = code;
    error.details = errors;
    
    return error;
  }

  // Format Ajv errors into user-friendly messages
  private static formatValidationErrors(errors: unknown[]): string[] {
    if (!errors || errors.length === 0) {
      return ["Unknown validation error"];
    }

    return errors.map((error: unknown) => {
      const err = error as Record<string, unknown>;
      const field = (err.instancePath as string)?.replace(/^\//, "") || err.keyword;
      
      switch (err.keyword) {
        case "required":
          return `${(err.params as Record<string, unknown>)?.missingProperty} is required`;
        case "type":
          return `${field} must be a ${(err.params as Record<string, unknown>)?.type}`;
        case "enum":
          return `${field} must be one of: ${((err.params as Record<string, unknown>)?.allowedValues as string[])?.join(", ")}`;
        case "minimum":
          return `${field} must be at least ${(err.params as Record<string, unknown>)?.limit}`;
        case "maximum":
          return `${field} must be at most ${(err.params as Record<string, unknown>)?.limit}`;
        case "minLength":
          return `${field} must be at least ${(err.params as Record<string, unknown>)?.limit} characters`;
        case "maxLength":
          return `${field} must be at most ${(err.params as Record<string, unknown>)?.limit} characters`;
        case "pattern":
          return `${field} format is invalid`;
        case "format":
          return `${field} must be a valid ${(err.params as Record<string, unknown>)?.format}`;
        case "minItems":
          return `${field} must have at least ${(err.params as Record<string, unknown>)?.limit} items`;
        case "additionalProperties":
          return `${field} contains unexpected properties`;
        default:
          return `${field} is invalid: ${err.message}`;
      }
    });
  }

  // Sanitize data before validation (remove extra properties)
  static sanitizeData<T>(data: unknown, schema: Record<string, unknown>): T {
    // This is a simplified sanitization - removes additional properties
    if (typeof data !== "object" || data === null) {
      return data as T;
    }

    const sanitized = { ...data } as Record<string, unknown>;
    
    // Remove properties not defined in schema
    if (schema.properties) {
      Object.keys(sanitized).forEach((key) => {
        if (!(schema.properties as Record<string, unknown>)[key]) {
          delete sanitized[key];
        }
      });
    }

    return sanitized as T;
  }

  // Validate array of items
  static validateArray<T>(
    items: unknown[],
    validator: (item: unknown) => T,
    entityName: string
  ): T[] {
    const results: T[] = [];
    const errors: string[] = [];

    items.forEach((item, index) => {
      try {
        results.push(validator(item));
      } catch (error) {
        errors.push(`${entityName} ${index + 1}: ${(error as Error).message}`);
      }
    });

    if (errors.length > 0) {
      throw new Error(`Validation failed for ${entityName}s: ${errors.join("; ")}`);
    }

    return results;
  }

  // Check if data matches expected schema structure
  static isValidStructure(data: unknown, requiredFields: string[]): boolean {
    if (typeof data !== "object" || data === null) {
      return false;
    }

    const obj = data as Record<string, unknown>;
    return requiredFields.every((field) => field in obj);
  }

  // Validate import data structure
  static validateImportData(data: unknown): {
    settings?: AppSettings[];
    exercises?: ExerciseCatalogItem[];
    workouts?: WorkoutLogEntry[];
    metrics?: BodyMetricEntry[];
    baselines?: BaselineTestEntry[];
    glossary?: GlossaryItem[];
  } {
    if (typeof data !== "object" || data === null) {
      throw new Error("Import data must be an object");
    }

    const importData = data as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    // Validate each section if present
    if (importData.settings) {
      if (!Array.isArray(importData.settings)) {
        throw new Error("Settings must be an array");
      }
      result.settings = this.validateArray(
        importData.settings,
        this.validateAppSettings,
        "setting"
      );
    }

    if (importData.exercises) {
      if (!Array.isArray(importData.exercises)) {
        throw new Error("Exercises must be an array");
      }
      result.exercises = this.validateArray(
        importData.exercises,
        this.validateExercise,
        "exercise"
      );
    }

    if (importData.workouts) {
      if (!Array.isArray(importData.workouts)) {
        throw new Error("Workouts must be an array");
      }
      result.workouts = this.validateArray(
        importData.workouts,
        this.validateWorkoutLog,
        "workout"
      );
    }

    if (importData.metrics) {
      if (!Array.isArray(importData.metrics)) {
        throw new Error("Metrics must be an array");
      }
      result.metrics = this.validateArray(
        importData.metrics,
        this.validateBodyMetricEntry,
        "metric"
      );
    }

    if (importData.baselines) {
      if (!Array.isArray(importData.baselines)) {
        throw new Error("Baselines must be an array");
      }
      result.baselines = this.validateArray(
        importData.baselines,
        this.validateBaselineTest,
        "baseline"
      );
    }

    if (importData.glossary) {
      if (!Array.isArray(importData.glossary)) {
        throw new Error("Glossary must be an array");
      }
      result.glossary = this.validateArray(
        importData.glossary,
        this.validateGlossaryItem,
        "glossary item"
      );
    }

    return result;
  }
}

// Re-export validators for direct use
export {
  validateAppSettings,
  validateBodyMetricEntry,
  validateExercise,
  validateWorkoutLog,
  validateBaselineTest,
  validateGlossaryItem,
};
