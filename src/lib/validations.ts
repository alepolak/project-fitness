/**
 * Validation utilities and defaults
 * Following cursor rules for type safety
 */

// Re-export validation functions from validators
export {
  ValidationService,
  validateAppSettings,
  validateBodyMetricEntry,
  validateExercise,
  validateWorkoutLog,
  validateBaselineTest,
  validateGlossaryItem,
} from "@/validators";

import type { AppSettings } from "@/types";
import { DateUtils } from "@/utils/dateUtils";

// Default values
export const defaultAppSettings: AppSettings = {
  id: "app-settings-v1",
  unit_system: "imperial",
  theme: "system",
  language: "en",
  privacy_acknowledged: false,
  data_version: 1,
  created_at: DateUtils.getCurrentDateTime(),
  updated_at: DateUtils.getCurrentDateTime(),
  version: 1,
};

/**
 * Validates and sanitizes app settings
 */
export function sanitizeAppSettings(data: unknown): AppSettings {
  try {
    if (typeof data === "object" && data !== null) {
      const settings = data as Partial<AppSettings>;
      
      // Merge with defaults for missing fields
      return {
        ...defaultAppSettings,
        ...settings,
        // Ensure critical fields are valid
        unit_system: ["imperial", "metric"].includes(settings.unit_system as string)
          ? (settings.unit_system as AppSettings["unit_system"])
          : defaultAppSettings.unit_system,
        theme: ["system", "light", "dark"].includes(settings.theme as string)
          ? (settings.theme as AppSettings["theme"])
          : defaultAppSettings.theme,
        data_version: typeof settings.data_version === "number" && settings.data_version > 0
          ? settings.data_version
          : defaultAppSettings.data_version,
      };
    }
  } catch (error) {
    console.warn("Error sanitizing app settings:", error);
  }
  
  console.warn("Invalid app settings, using defaults");
  return { ...defaultAppSettings };
}