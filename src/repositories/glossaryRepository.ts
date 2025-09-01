/**
 * Glossary repository for managing fitness terms and definitions
 * Following cursor rules for type safety and error handling
 */

import { storageService } from "@/services/storage";
import { ValidationService } from "@/validators";
import { DateUtils } from "@/utils/dateUtils";
import type { GlossaryItem, GlossarySearchFilters } from "@/types";

export class GlossaryRepository {
  private static readonly STORE_NAME = "glossary";

  /**
   * Save a glossary item
   */
  async save(item: GlossaryItem): Promise<void> {
    try {
      // Validate the item
      ValidationService.validateGlossaryItem(item);
      
      // Update timestamp
      const now = DateUtils.getCurrentDateTime();
      const itemToSave = {
        ...item,
        updated_at: now,
        version: item.version + 1,
      };
      
      await storageService.save(GlossaryRepository.STORE_NAME, itemToSave);
    } catch (error) {
      console.error("Failed to save glossary item:", error);
      throw error;
    }
  }

  /**
   * Save multiple items at once
   */
  async saveBatch(items: GlossaryItem[]): Promise<void> {
    try {
      for (const item of items) {
        ValidationService.validateGlossaryItem(item);
        await storageService.save(GlossaryRepository.STORE_NAME, item);
      }
    } catch (error) {
      console.error("Failed to save batch glossary items:", error);
      throw error;
    }
  }

  /**
   * Get a glossary item by ID
   */
  async getById(id: string): Promise<GlossaryItem | null> {
    try {
      return await storageService.get<GlossaryItem>(GlossaryRepository.STORE_NAME, id);
    } catch (error) {
      console.error("Failed to get glossary item:", error);
      return null;
    }
  }

  /**
   * Get all glossary items
   */
  async getAll(): Promise<GlossaryItem[]> {
    try {
      return await storageService.getAll<GlossaryItem>(GlossaryRepository.STORE_NAME);
    } catch (error) {
      console.error("Failed to get all glossary items:", error);
      return [];
    }
  }

  /**
   * Search glossary items with filters
   */
  async search(filters: GlossarySearchFilters): Promise<GlossaryItem[]> {
    try {
      const allItems = await this.getAll();
      
      return allItems.filter(item => {
        // Text search
        if (filters.query) {
          const query = filters.query.toLowerCase();
          const matchesTerm = item.term.toLowerCase().includes(query);
          const matchesDefinition = item.plain_definition.toLowerCase().includes(query);
          const matchesCategory = item.category.toLowerCase().includes(query);
          const matchesRelated = item.related_terms.some(term => 
            term.toLowerCase().includes(query)
          );
          
          if (!matchesTerm && !matchesDefinition && !matchesCategory && !matchesRelated) {
            return false;
          }
        }

        // Category filter
        if (filters.category && item.category !== filters.category) {
          return false;
        }

        // Difficulty filter
        if (filters.difficulty && item.difficulty_level !== filters.difficulty) {
          return false;
        }

        return true;
      }).sort((a, b) => {
        // Sort by term name
        return a.term.localeCompare(b.term);
      });
    } catch (error) {
      console.error("Failed to search glossary items:", error);
      return [];
    }
  }

  /**
   * Delete a glossary item
   */
  async delete(id: string): Promise<void> {
    try {
      await storageService.delete(GlossaryRepository.STORE_NAME, id);
    } catch (error) {
      console.error("Failed to delete glossary item:", error);
      throw error;
    }
  }

  /**
   * Get glossary items by category
   */
  async getByCategory(category: string): Promise<GlossaryItem[]> {
    try {
      const allItems = await this.getAll();
      return allItems.filter(item => item.category === category);
    } catch (error) {
      console.error("Failed to get glossary items by category:", error);
      return [];
    }
  }

  /**
   * Get related terms for a given term
   */
  async getRelatedTerms(termName: string): Promise<GlossaryItem[]> {
    try {
      const allItems = await this.getAll();
      return allItems.filter(item => 
        item.related_terms.some(relatedTerm => 
          relatedTerm.toLowerCase() === termName.toLowerCase()
        )
      );
    } catch (error) {
      console.error("Failed to get related terms:", error);
      return [];
    }
  }

  /**
   * Count total glossary items
   */
  async count(): Promise<number> {
    try {
      return await storageService.count(GlossaryRepository.STORE_NAME);
    } catch (error) {
      console.error("Failed to count glossary items:", error);
      return 0;
    }
  }

  /**
   * Get popular or frequently accessed terms
   */
  async getPopularTerms(limit: number = 10): Promise<GlossaryItem[]> {
    try {
      // For now, just return the first N items
      // TODO: Implement access tracking
      const allItems = await this.getAll();
      return allItems
        .sort((a, b) => a.term.localeCompare(b.term))
        .slice(0, limit);
    } catch (error) {
      console.error("Failed to get popular terms:", error);
      return [];
    }
  }

  /**
   * Search terms by exact match on term name
   */
  async findByTerm(termName: string): Promise<GlossaryItem | null> {
    try {
      const allItems = await this.getAll();
      return allItems.find(item => 
        item.term.toLowerCase() === termName.toLowerCase()
      ) || null;
    } catch (error) {
      console.error("Failed to find term by name:", error);
      return null;
    }
  }
}

export const glossaryRepository = new GlossaryRepository();
