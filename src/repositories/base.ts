/**
 * Base repository class with common CRUD operations
 * Following cursor rules for repository pattern and error handling
 */

import { storageService } from "@/services/storage";
// ValidationService imported in derived classes
import { DateUtils } from "@/utils/dateUtils";
import type { StorageData, QueryFilter, SortOptions, PaginationOptions } from "@/types";

export abstract class BaseRepository<T extends StorageData> {
  protected storeName: string;
  protected validator?: (data: unknown) => T;

  constructor(storeName: string, validator?: (data: unknown) => T) {
    this.storeName = storeName;
    this.validator = validator;
  }

  /**
   * Create a new entity with metadata
   */
  protected createEntity(data: Omit<T, keyof StorageData>): T {
    const now = DateUtils.getCurrentDateTime();
    return {
      ...data,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
      version: 1,
    } as T;
  }

  /**
   * Update entity metadata
   */
  protected updateEntity(existing: T, updates: Partial<T>): T {
    return {
      ...existing,
      ...updates,
      updated_at: DateUtils.getCurrentDateTime(),
      version: existing.version + 1,
    };
  }

  /**
   * Save an entity (create or update)
   */
  async save(entity: T): Promise<void> {
    // Validate if validator is provided
    if (this.validator) {
      entity = this.validator(entity);
    }

    await storageService.save(this.storeName, entity);
  }

  /**
   * Create a new entity
   */
  async create(data: Omit<T, keyof StorageData>): Promise<T> {
    const entity = this.createEntity(data);
    await this.save(entity);
    return entity;
  }

  /**
   * Update an existing entity
   */
  async update(id: string, updates: Partial<T>): Promise<T> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Entity with id ${id} not found`);
    }

    const updated = this.updateEntity(existing, updates);
    await this.save(updated);
    return updated;
  }

  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<T | null> {
    return storageService.get<T>(this.storeName, id);
  }

  /**
   * Get all entities
   */
  async getAll(): Promise<T[]> {
    return storageService.getAll<T>(this.storeName);
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Entity with id ${id} not found`);
    }

    await storageService.delete(this.storeName, id);
  }

  /**
   * Get multiple entities by IDs
   */
  async getMultiple(ids: string[]): Promise<T[]> {
    return storageService.getMultiple<T>(this.storeName, ids);
  }

  /**
   * Count total entities
   */
  async count(): Promise<number> {
    return storageService.count(this.storeName);
  }

  /**
   * Save multiple entities
   */
  async saveBatch(entities: T[]): Promise<void> {
    // Validate all entities if validator is provided
    if (this.validator) {
      entities = entities.map(this.validator);
    }

    await storageService.saveBatch(this.storeName, entities);
  }

  /**
   * Clear all entities (use with caution)
   */
  async clear(): Promise<void> {
    await storageService.clear(this.storeName);
  }

  /**
   * Query entities with filtering
   * Note: This is a simplified implementation - for complex queries,
   * consider implementing specific methods in derived classes
   */
  async query(filter?: QueryFilter<T>): Promise<T[]> {
    const allItems = await this.getAll();
    
    if (!filter) {
      return allItems;
    }

    return allItems.filter((item) => {
      return Object.entries(filter).every(([key, value]) => {
        const itemValue = (item as Record<string, unknown>)[key];
        
        if (Array.isArray(value)) {
          // Match any of the values
          return value.includes(itemValue);
        } else if (typeof value === "object" && value !== null && "min" in value) {
          // Range query
          const range = value as { min?: unknown; max?: unknown };
          const compareValue = itemValue as string | number | Date;
          if (range.min !== undefined && compareValue < (range.min as string | number | Date)) return false;
          if (range.max !== undefined && compareValue > (range.max as string | number | Date)) return false;
          return true;
        } else {
          // Exact match
          return itemValue === value;
        }
      });
    });
  }

  /**
   * Sort entities
   */
  protected sortEntities(entities: T[], sortOptions?: SortOptions<T>): T[] {
    if (!sortOptions) {
      return entities;
    }

    return [...entities].sort((a, b) => {
      const aValue = a[sortOptions.field] as string | number;
      const bValue = b[sortOptions.field] as string | number;
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      else if (aValue > bValue) comparison = 1;
      
      return sortOptions.direction === "desc" ? -comparison : comparison;
    });
  }

  /**
   * Paginate entities
   */
  protected paginateEntities(entities: T[], pagination?: PaginationOptions): T[] {
    if (!pagination) {
      return entities;
    }

    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    
    return entities.slice(start, end);
  }

  /**
   * Get entities with sorting and pagination
   */
  async findAll(
    filter?: QueryFilter<T>,
    sort?: SortOptions<T>,
    pagination?: PaginationOptions
  ): Promise<{ items: T[]; total: number }> {
    let items = await this.query(filter);
    const total = items.length;
    
    items = this.sortEntities(items, sort);
    items = this.paginateEntities(items, pagination);
    
    return { items, total };
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    const entity = await this.getById(id);
    return entity !== null;
  }

  /**
   * Get entities created within date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<T[]> {
    const allItems = await this.getAll();
    
    return allItems.filter((item) => {
      const createdAt = item.created_at.split("T")[0]; // Get date part
      return createdAt >= startDate && createdAt <= endDate;
    });
  }

  /**
   * Get recent entities
   */
  async getRecent(limit: number = 10): Promise<T[]> {
    const allItems = await this.getAll();
    
    return allItems
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }
}
