/**
 * Data migration service for handling version upgrades
 * Following cursor rules for error handling and type safety
 */

import { storageService } from "./storage";
import { ValidationService } from "@/validators";
import type { AppSettings } from "@/types";

export class MigrationService {
  private static readonly CURRENT_VERSION = 1;

  /**
   * Check if migration is needed
   */
  static async needsMigration(): Promise<boolean> {
    try {
      const settings = await storageService.get<AppSettings>("settings", "app-settings-v1");
      if (!settings) {
        return false; // Fresh install, no migration needed
      }
      
      return settings.data_version < this.CURRENT_VERSION;
    } catch (error) {
      console.warn("Error checking migration status:", error);
      return false;
    }
  }

  /**
   * Perform migration from one version to another
   */
  static async migrate(fromVersion: number, toVersion: number): Promise<void> {
    console.log(`Migrating data from version ${fromVersion} to ${toVersion}`);

    try {
      // Migration logic would go here
      // For now, this is a placeholder for future migrations
      
      if (fromVersion < 1 && toVersion >= 1) {
        await this.migrateToV1();
      }

      // Add future migration steps here
      // if (fromVersion < 2 && toVersion >= 2) {
      //   await this.migrateToV2();
      // }

      console.log("Migration completed successfully");
    } catch (error) {
      console.error("Migration failed:", error);
      throw new Error(`Migration from v${fromVersion} to v${toVersion} failed: ${(error as Error).message}`);
    }
  }

  /**
   * Migration to version 1 (baseline)
   */
  private static async migrateToV1(): Promise<void> {
    // This is the initial version, no migration needed
    console.log("Setting up initial data structure for v1");
  }

  /**
   * Perform automatic migration if needed
   */
  static async autoMigrate(): Promise<boolean> {
    const needsMigration = await this.needsMigration();
    
    if (!needsMigration) {
      return false;
    }

    try {
      const settings = await storageService.get<AppSettings>("settings", "app-settings-v1");
      const currentVersion = settings?.data_version || 0;
      
      await this.migrate(currentVersion, this.CURRENT_VERSION);
      
      // Update settings with new version
      if (settings) {
        const updatedSettings = {
          ...settings,
          data_version: this.CURRENT_VERSION,
          updated_at: new Date().toISOString(),
          version: settings.version + 1,
        };
        
        await storageService.save("settings", updatedSettings);
      }
      
      return true;
    } catch (error) {
      console.error("Auto-migration failed:", error);
      throw error;
    }
  }

  /**
   * Validate all data after migration
   */
  static async validateDataIntegrity(): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // Validate settings
      const settings = await storageService.get<AppSettings>("settings", "app-settings-v1");
      if (settings) {
        try {
          ValidationService.validateAppSettings(settings);
        } catch (error) {
          errors.push(`Settings validation failed: ${(error as Error).message}`);
        }
      }

      // Validate exercises
      const exercises = await storageService.getAll("exercises");
      for (const exercise of exercises) {
        try {
          ValidationService.validateExercise(exercise);
        } catch (error) {
          const ex = exercise as { id?: string };
          errors.push(`Exercise ${ex.id || 'unknown'} validation failed: ${(error as Error).message}`);
        }
      }

      // Validate workouts
      const workouts = await storageService.getAll("workouts");
      for (const workout of workouts) {
        try {
          ValidationService.validateWorkoutLog(workout);
        } catch (error) {
          const w = workout as { id?: string };
          errors.push(`Workout ${w.id || 'unknown'} validation failed: ${(error as Error).message}`);
        }
      }

      // Validate metrics
      const metrics = await storageService.getAll("metrics");
      for (const metric of metrics) {
        try {
          ValidationService.validateBodyMetricEntry(metric);
        } catch (error) {
          const m = metric as { id?: string };
          errors.push(`Metric ${m.id || 'unknown'} validation failed: ${(error as Error).message}`);
        }
      }

      // Validate baselines
      const baselines = await storageService.getAll("baselines");
      for (const baseline of baselines) {
        try {
          ValidationService.validateBaselineTest(baseline);
        } catch (error) {
          const b = baseline as { id?: string };
          errors.push(`Baseline ${b.id || 'unknown'} validation failed: ${(error as Error).message}`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      errors.push(`Data integrity check failed: ${(error as Error).message}`);
      return { valid: false, errors };
    }
  }

  /**
   * Get current data version
   */
  static async getCurrentDataVersion(): Promise<number> {
    try {
      const settings = await storageService.get<AppSettings>("settings", "app-settings-v1");
      return settings?.data_version || 0;
    } catch (error) {
      console.warn("Error getting current data version:", error);
      return 0;
    }
  }

  /**
   * Backup data before migration
   */
  static async createBackup(): Promise<string> {
    try {
      const allData = await storageService.exportAllData();
      const backup = {
        version: await this.getCurrentDataVersion(),
        timestamp: new Date().toISOString(),
        data: allData,
      };

      const backupJson = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      return url;
    } catch (error) {
      console.error("Failed to create backup:", error);
      throw new Error(`Backup creation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Restore data from backup
   */
  static async restoreFromBackup(backupData: string): Promise<void> {
    try {
      const backup = JSON.parse(backupData);
      
      if (!backup.data || !backup.version) {
        throw new Error("Invalid backup format");
      }

      // Clear existing data
      const stores = ["settings", "exercises", "workouts", "metrics", "baselines", "plans", "glossary", "preferences"];
      for (const store of stores) {
        await storageService.clear(store);
      }

      // Restore data
      await storageService.importAllData(backup.data);
      
      console.log(`Data restored from backup (version ${backup.version})`);
    } catch (error) {
      console.error("Failed to restore from backup:", error);
      throw new Error(`Restore failed: ${(error as Error).message}`);
    }
  }
}
