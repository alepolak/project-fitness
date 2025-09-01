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

        // Create object stores for different data types
        if (!db.objectStoreNames.contains("workouts")) {
          const workoutStore = db.createObjectStore("workouts", {
            keyPath: "id",
          });
          workoutStore.createIndex("date", "date", { unique: false });
          workoutStore.createIndex("exercise_id", "exercise_id", {
            unique: false,
          });
        }

        if (!db.objectStoreNames.contains("exercises")) {
          db.createObjectStore("exercises", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
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
