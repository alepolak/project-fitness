"use client";

import { useLocalStorage } from "./useLocalStorage";
import { defaultAppSettings, sanitizeAppSettings } from "@/lib/validations";
import type { AppSettings } from "@/types";

/**
 * Custom hook for managing app settings
 * Provides type-safe settings management with validation
 */
export function useSettings() {
  const [settings, setStoredSettings, isLoading] = useLocalStorage<AppSettings>(
    "app-settings",
    defaultAppSettings
  );

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    const validatedSettings = sanitizeAppSettings(newSettings);
    setStoredSettings(validatedSettings);
  };

  const resetSettings = () => {
    setStoredSettings(defaultAppSettings);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `fitness-tracker-settings-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const importedSettings = JSON.parse(content);
          const validatedSettings = sanitizeAppSettings(importedSettings);
          setStoredSettings(validatedSettings);
          resolve();
        } catch {
          reject(new Error("Invalid settings file format"));
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  return {
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    isLoading,
  };
}
