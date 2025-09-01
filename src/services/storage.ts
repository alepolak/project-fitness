"use client";

import type { StorageData } from "@/types";

/**
 * IndexedDB wrapper service for local data storage
 * Provides type-safe operations for storing and retrieving fitness data
 */
export class StorageService {
  private db: IDBDatabase | null = null;
  private readonly dbName = "FitnessTracker";
  private readonly dbVersion = 1;

  /**
   * Initialize the IndexedDB connection
   */
  async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Settings store
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
        }

        // Exercise catalog store
        if (!db.objectStoreNames.contains("exercises")) {
          const exerciseStore = db.createObjectStore("exercises", { keyPath: "id" });
          exerciseStore.createIndex("name", "name", { unique: false });
          exerciseStore.createIndex("movement_pattern", "movement_pattern", { unique: false });
          exerciseStore.createIndex("primary_muscles", "primary_muscles", { unique: false, multiEntry: true });
          exerciseStore.createIndex("equipment", "equipment", { unique: false, multiEntry: true });
          exerciseStore.createIndex("difficulty_level", "difficulty_level", { unique: false });
          exerciseStore.createIndex("exercise_type", "exercise_type", { unique: false });
        }

        // Workout logs store
        if (!db.objectStoreNames.contains("workouts")) {
          const workoutStore = db.createObjectStore("workouts", { keyPath: "id" });
          workoutStore.createIndex("date_time_start", "date_time_start", { unique: false });
          workoutStore.createIndex("session_plan_ref", "session_plan_ref", { unique: false });
          workoutStore.createIndex("environment", "environment", { unique: false });
          workoutStore.createIndex("overall_rating", "overall_rating", { unique: false });
        }

        // Body metrics store
        if (!db.objectStoreNames.contains("metrics")) {
          const metricsStore = db.createObjectStore("metrics", { keyPath: "id" });
          metricsStore.createIndex("date", "date", { unique: false });
          metricsStore.createIndex("weight_unit", "weight_unit", { unique: false });
        }

        // Baseline tests store
        if (!db.objectStoreNames.contains("baselines")) {
          const baselineStore = db.createObjectStore("baselines", { keyPath: "id" });
          baselineStore.createIndex("month", "month", { unique: false });
          baselineStore.createIndex("test_date", "test_date", { unique: false });
        }

        // Program plans store
        if (!db.objectStoreNames.contains("plans")) {
          const planStore = db.createObjectStore("plans", { keyPath: "id" });
          planStore.createIndex("title", "title", { unique: false });
          planStore.createIndex("difficulty_level", "difficulty_level", { unique: false });
          planStore.createIndex("is_template", "is_template", { unique: false });
        }

        // Glossary store
        if (!db.objectStoreNames.contains("glossary")) {
          const glossaryStore = db.createObjectStore("glossary", { keyPath: "id" });
          glossaryStore.createIndex("term", "term", { unique: false });
          glossaryStore.createIndex("category", "category", { unique: false });
          glossaryStore.createIndex("difficulty_level", "difficulty_level", { unique: false });
        }

        // User preferences store (separate from app settings)
        if (!db.objectStoreNames.contains("preferences")) {
          db.createObjectStore("preferences", { keyPath: "id" });
        }

        // Media store for storing images/videos locally
        if (!db.objectStoreNames.contains("media")) {
          const mediaStore = db.createObjectStore("media", { keyPath: "id" });
          mediaStore.createIndex("filename", "filename", { unique: false });
          mediaStore.createIndex("mimeType", "mimeType", { unique: false });
          mediaStore.createIndex("created_at", "created_at", { unique: false });
        }
      };
    });
  }

  /**
   * Save data to a specific store
   */
  async save<T extends StorageData>(storeName: string, data: T): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      // Add timestamp and version if not present
      const dataWithMeta = {
        ...data,
        timestamp: data.timestamp || Date.now(),
        version: data.version || 1,
      };

      const request = store.put(dataWithMeta);

      request.onerror = () => {
        reject(new Error(`Failed to save data to ${storeName}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Get data by ID from a specific store
   */
  async get<T>(storeName: string, id: string): Promise<T | null> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => {
        reject(new Error(`Failed to get data from ${storeName}`));
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  /**
   * Query data from a specific store with optional filtering
   */
  async query<T>(
    storeName: string,
    filter?: {
      index?: string;
      value?: IDBValidKey;
      range?: IDBKeyRange;
    }
  ): Promise<T[]> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);

      let request: IDBRequest;

      if (filter?.index && store.indexNames.contains(filter.index)) {
        const index = store.index(filter.index);
        if (filter.range) {
          request = index.getAll(filter.range);
        } else if (filter.value !== undefined) {
          request = index.getAll(filter.value);
        } else {
          request = index.getAll();
        }
      } else {
        request = store.getAll();
      }

      request.onerror = () => {
        reject(new Error(`Failed to query data from ${storeName}`));
      };

      request.onsuccess = () => {
        resolve(request.result || []);
      };
    });
  }

  /**
   * Delete data by ID from a specific store
   */
  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => {
        reject(new Error(`Failed to delete data from ${storeName}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Clear all data from a specific store
   */
  async clear(storeName: string): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => {
        reject(new Error(`Failed to clear data from ${storeName}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Batch save multiple items to a store
   */
  async saveBatch<T extends StorageData>(
    storeName: string,
    items: T[]
  ): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      
      transaction.onerror = () => {
        reject(new Error(`Failed to save batch to ${storeName}`));
      };

      transaction.oncomplete = () => {
        resolve();
      };

      items.forEach((item) => {
        const dataWithMeta = {
          ...item,
          timestamp: item.timestamp || Date.now(),
          version: item.version || 1,
        };
        store.put(dataWithMeta);
      });
    });
  }

  /**
   * Get multiple items by IDs
   */
  async getMultiple<T>(storeName: string, ids: string[]): Promise<T[]> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const results: T[] = [];
      let completed = 0;

      transaction.onerror = () => {
        reject(new Error(`Failed to get items from ${storeName}`));
      };

      if (ids.length === 0) {
        resolve([]);
        return;
      }

      ids.forEach((id) => {
        const request = store.get(id);
        request.onsuccess = () => {
          if (request.result) {
            results.push(request.result);
          }
          completed++;
          if (completed === ids.length) {
            resolve(results);
          }
        };
      });
    });
  }

  /**
   * Count items in a store
   */
  async count(storeName: string): Promise<number> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onerror = () => {
        reject(new Error(`Failed to count items in ${storeName}`));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{
    usage: number;
    quota: number;
    percentUsed: number;
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
      
      return { usage, quota, percentUsed };
    }
    
    return { usage: 0, quota: 0, percentUsed: 0 };
  }

  /**
   * Export all data for backup
   */
  async exportAllData(): Promise<Record<string, unknown[]>> {
    const stores = [
      "settings",
      "exercises", 
      "workouts",
      "metrics",
      "baselines",
      "plans",
      "glossary",
      "preferences",
      "media",
    ];

    const exportData: Record<string, unknown[]> = {};

    for (const storeName of stores) {
      try {
        exportData[storeName] = await this.getAll(storeName);
      } catch (error) {
        console.warn(`Failed to export ${storeName}:`, error);
        exportData[storeName] = [];
      }
    }

    return exportData;
  }

  /**
   * Import data from backup
   */
  async importAllData(data: Record<string, unknown[]>): Promise<void> {
    for (const [storeName, items] of Object.entries(data)) {
      if (Array.isArray(items) && items.length > 0) {
        try {
          await this.saveBatch(storeName, items as StorageData[]);
        } catch (error) {
          console.error(`Failed to import ${storeName}:`, error);
          throw new Error(`Import failed for ${storeName}: ${(error as Error).message}`);
        }
      }
    }
  }

  /**
   * Get all items from a store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error(`Failed to get all items from ${storeName}`));
      };

      request.onsuccess = () => {
        resolve(request.result || []);
      };
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
export const storageService = new StorageService();
