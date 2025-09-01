/**
 * Data initialization service for populating starter content
 * Following cursor rules for error handling and type safety
 */

import { exerciseRepository, settingsRepository } from "@/repositories";
import { storageService } from "./storage";
import { ValidationService } from "@/validators";
import { starterExercises } from "@/data/starterExercises";
import { starterGlossary } from "@/data/starterGlossary";
import { DateUtils } from "@/utils/dateUtils";
import type { ExerciseCatalogItem, GlossaryItem } from "@/types";

export class DataInitService {
  /**
   * Initialize app with starter content if it's the first run
   */
  static async initializeAppData(): Promise<{
    exercisesAdded: number;
    glossaryAdded: number;
    alreadyInitialized: boolean;
  }> {
    try {
      // Check if we've already initialized
      const existingExercises = await exerciseRepository.count();
      const existingGlossary = await storageService.count("glossary");

      if (existingExercises > 0 || existingGlossary > 0) {
        return {
          exercisesAdded: 0,
          glossaryAdded: 0,
          alreadyInitialized: true,
        };
      }

      // Initialize exercises
      const exercisesAdded = await this.initializeExercises();
      
      // Initialize glossary
      const glossaryAdded = await this.initializeGlossary();

      // Initialize settings if needed
      await this.initializeSettings();

      return {
        exercisesAdded,
        glossaryAdded,
        alreadyInitialized: false,
      };
    } catch (error) {
      console.error("Failed to initialize app data:", error);
      throw error;
    }
  }

  /**
   * Initialize starter exercises
   */
  private static async initializeExercises(): Promise<number> {
    let addedCount = 0;
    const now = DateUtils.getCurrentDateTime();

    for (const exerciseData of starterExercises) {
      try {
        const exercise: ExerciseCatalogItem = {
          ...exerciseData,
          id: crypto.randomUUID(),
          created_at: now,
          updated_at: now,
          version: 1,
        };

        // Validate before saving
        ValidationService.validateExercise(exercise);
        
        await exerciseRepository.save(exercise);
        addedCount++;
      } catch (error) {
        console.error(`Failed to add exercise ${exerciseData.name}:`, error);
      }
    }

    return addedCount;
  }

  /**
   * Initialize starter glossary
   */
  private static async initializeGlossary(): Promise<number> {
    let addedCount = 0;
    const now = DateUtils.getCurrentDateTime();

    for (const glossaryData of starterGlossary) {
      try {
        const glossaryItem: GlossaryItem = {
          ...glossaryData,
          id: crypto.randomUUID(),
          created_at: now,
          updated_at: now,
          version: 1,
        };

        // Validate before saving
        ValidationService.validateGlossaryItem(glossaryItem);
        
        await storageService.save("glossary", glossaryItem);
        addedCount++;
      } catch (error) {
        console.error(`Failed to add glossary term ${glossaryData.term}:`, error);
      }
    }

    return addedCount;
  }

  /**
   * Initialize default settings
   */
  private static async initializeSettings(): Promise<void> {
    try {
      const existingSettings = await settingsRepository.getSettings();
      
      if (!existingSettings) {
        await settingsRepository.initialize();
      }
    } catch (error) {
      console.error("Failed to initialize settings:", error);
    }
  }

  /**
   * Force re-initialize all data (development use)
   */
  static async forceReinitialize(): Promise<{
    exercisesAdded: number;
    glossaryAdded: number;
  }> {
    try {
      // Clear existing data
      await storageService.clear("exercises");
      await storageService.clear("glossary");

      // Re-initialize
      const exercisesAdded = await this.initializeExercises();
      const glossaryAdded = await this.initializeGlossary();

      return { exercisesAdded, glossaryAdded };
    } catch (error) {
      console.error("Failed to force reinitialize:", error);
      throw error;
    }
  }

  /**
   * Get initialization status
   */
  static async getInitializationStatus(): Promise<{
    exerciseCount: number;
    glossaryCount: number;
    isInitialized: boolean;
  }> {
    try {
      const exerciseCount = await exerciseRepository.count();
      const glossaryCount = await storageService.count("glossary");

      return {
        exerciseCount,
        glossaryCount,
        isInitialized: exerciseCount > 0 || glossaryCount > 0,
      };
    } catch (error) {
      console.error("Failed to get initialization status:", error);
      return {
        exerciseCount: 0,
        glossaryCount: 0,
        isInitialized: false,
      };
    }
  }

  /**
   * Check and initialize storage if needed
   */
  static async ensureStorageInitialized(): Promise<void> {
    try {
      await storageService.initialize();
    } catch (error) {
      console.error("Failed to initialize storage:", error);
      throw error;
    }
  }
}
