/**
 * Settings repository for managing app settings
 * Following cursor rules for repository pattern
 */

import { BaseRepository } from "./base";
import { ValidationService } from "@/validators";
import type { AppSettings, StorageData } from "@/types";

export class SettingsRepository extends BaseRepository<AppSettings> {
  private static readonly SETTINGS_ID = "app-settings-v1";

  constructor() {
    super("settings", ValidationService.validateAppSettings);
  }

  /**
   * Get the app settings (singleton pattern)
   */
  async getSettings(): Promise<AppSettings | null> {
    return this.getById(SettingsRepository.SETTINGS_ID);
  }

  /**
   * Save app settings
   */
  async saveSettings(settings: Omit<AppSettings, keyof StorageData>): Promise<AppSettings> {
    const existingSettings = await this.getSettings();
    
    if (existingSettings) {
      // Update existing settings
      return this.update(SettingsRepository.SETTINGS_ID, settings);
    } else {
      // Create new settings with fixed ID
      const newSettings = this.createEntity(settings);
      newSettings.id = SettingsRepository.SETTINGS_ID;
      await this.save(newSettings);
      return newSettings;
    }
  }

  /**
   * Update specific setting field
   */
  async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<AppSettings> {
    const settings = await this.getSettings();
    
    if (!settings) {
      throw new Error("Settings not initialized");
    }

    return this.update(SettingsRepository.SETTINGS_ID, { [key]: value });
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<AppSettings> {
    const defaultSettings: Omit<AppSettings, keyof StorageData> = {
      unit_system: "imperial",
      theme: "system",
      language: "en",
      data_version: 1,
      privacy_acknowledged: false,
    };

    return this.saveSettings(defaultSettings);
  }

  /**
   * Initialize settings with defaults if not exists
   */
  async initialize(): Promise<AppSettings> {
    const existing = await this.getSettings();
    
    if (existing) {
      return existing;
    }

    return this.resetToDefaults();
  }

  /**
   * Export settings for backup
   */
  async exportSettings(): Promise<AppSettings | null> {
    return this.getSettings();
  }

  /**
   * Import settings from backup
   */
  async importSettings(settings: AppSettings): Promise<AppSettings> {
    // Validate the imported settings
    const validatedSettings = ValidationService.validateAppSettings(settings);
    
    // Force the correct ID
    validatedSettings.id = SettingsRepository.SETTINGS_ID;
    
    await this.save(validatedSettings);
    return validatedSettings;
  }

  /**
   * Get settings with fallback to defaults
   */
  async getSettingsWithDefaults(): Promise<AppSettings> {
    const settings = await this.getSettings();
    
    if (settings) {
      return settings;
    }

    return this.initialize();
  }

  /**
   * Check if settings are initialized
   */
  async isInitialized(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings !== null;
  }

  /**
   * Migrate settings to new version
   */
  async migrateToVersion(targetVersion: number): Promise<AppSettings> {
    const settings = await this.getSettingsWithDefaults();
    
    if (settings.data_version >= targetVersion) {
      return settings; // Already at target version or newer
    }

    // Perform migration logic here
    const migratedSettings = { ...settings };
    
    // Example migration logic (add new fields, transform data, etc.)
    if (migratedSettings.data_version < 2) {
      // Migration from v1 to v2 - add any new fields with defaults
      migratedSettings.data_version = 2;
    }

    migratedSettings.data_version = targetVersion;
    
    return this.saveSettings(migratedSettings);
  }

  /**
   * Validate current settings and fix if needed
   */
  async validateAndRepair(): Promise<AppSettings> {
    const settings = await this.getSettings();
    
    if (!settings) {
      return this.initialize();
    }

    try {
      // Validate current settings
      ValidationService.validateAppSettings(settings);
      return settings;
    } catch (error) {
      console.warn("Settings validation failed, resetting to defaults:", error);
      return this.resetToDefaults();
    }
  }
}
