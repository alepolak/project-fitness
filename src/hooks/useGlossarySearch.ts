/**
 * Glossary search hook with fuzzy matching
 * Following cursor rules for type safety and performance
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { storageService } from "@/services/storage";
import type { GlossaryItem } from "@/types";

export interface GlossarySearchFilters {
  query: string;
  categories: string[];
  difficultyLevels: string[];
}

export interface GlossarySearchResult {
  items: GlossaryItem[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialFilters: GlossarySearchFilters = {
  query: "",
  categories: [],
  difficultyLevels: [],
};

export const useGlossarySearch = () => {
  const [filters, setFilters] = useState<GlossarySearchFilters>(initialFilters);
  const [results, setResults] = useState<GlossaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fuzzy search function
  const fuzzyMatch = useCallback((query: string, text: string): boolean => {
    const normalizedQuery = query.toLowerCase().trim();
    const normalizedText = text.toLowerCase();

    // Exact match
    if (normalizedText.includes(normalizedQuery)) {
      return true;
    }

    // Word boundary matches
    const words = normalizedQuery.split(/\s+/);
    return words.every((word) => normalizedText.includes(word));
  }, []);

  // Search function
  const search = useCallback(
    async (searchFilters: GlossarySearchFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        const allItems = await storageService.getAll<GlossaryItem>("glossary");
        let filteredItems = [...allItems];

        // Apply text search with fuzzy matching
        if (searchFilters.query.trim()) {
          const query = searchFilters.query.trim();
          filteredItems = filteredItems.filter((item) => {
            // Search in term, definition, and related terms
            return (
              fuzzyMatch(query, item.term) ||
              fuzzyMatch(query, item.plain_definition) ||
              fuzzyMatch(query, item.why_it_matters) ||
              item.related_terms.some((term) => fuzzyMatch(query, term))
            );
          });
        }

        // Apply category filters
        if (searchFilters.categories.length > 0) {
          filteredItems = filteredItems.filter((item) =>
            searchFilters.categories.includes(item.category)
          );
        }

        // Apply difficulty level filters
        if (searchFilters.difficultyLevels.length > 0) {
          filteredItems = filteredItems.filter((item) =>
            searchFilters.difficultyLevels.includes(item.difficulty_level)
          );
        }

        // Sort results by relevance (exact matches first, then partial matches)
        if (searchFilters.query.trim()) {
          const query = searchFilters.query.toLowerCase().trim();
          filteredItems.sort((a, b) => {
            const aExact = a.term.toLowerCase().includes(query);
            const bExact = b.term.toLowerCase().includes(query);

            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;

            // Secondary sort by term alphabetically
            return a.term.localeCompare(b.term);
          });
        } else {
          // Default alphabetical sort when no search query
          filteredItems.sort((a, b) => a.term.localeCompare(b.term));
        }

        setResults(filteredItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [fuzzyMatch]
  );

  // Update filters and trigger search
  const updateFilters = useCallback(
    (newFilters: Partial<GlossarySearchFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      search(updatedFilters);
    },
    [filters, search]
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setResults([]);
    setError(null);
  }, []);

  // Get available filter options
  const getFilterOptions = useCallback(async () => {
    try {
      const allItems = await storageService.getAll<GlossaryItem>("glossary");

      const categories = [...new Set(allItems.map((item) => item.category))];
      const difficultyLevels = [...new Set(allItems.map((item) => item.difficulty_level))];

      return {
        categories: categories.sort(),
        difficultyLevels: difficultyLevels.sort(),
      };
    } catch (err) {
      console.error("Failed to get filter options:", err);
      return {
        categories: [],
        difficultyLevels: [],
      };
    }
  }, []);

  // Search suggestions based on related terms
  const getSuggestions = useCallback(
    async (currentTerm: string): Promise<string[]> => {
      try {
        const allItems = await storageService.getAll<GlossaryItem>("glossary");
        const currentItem = allItems.find(
          (item) => item.term.toLowerCase() === currentTerm.toLowerCase()
        );

        if (currentItem) {
          // Return related terms that exist in the glossary
          const relatedTerms = currentItem.related_terms.filter((term) =>
            allItems.some(
              (item) => item.term.toLowerCase() === term.toLowerCase()
            )
          );

          return relatedTerms.slice(0, 5); // Limit to 5 suggestions
        }

        return [];
      } catch (err) {
        console.error("Failed to get suggestions:", err);
        return [];
      }
    },
    []
  );

  // Search result summary
  const searchSummary = useMemo(() => {
    const hasActiveFilters =
      filters.query.trim() !== "" ||
      filters.categories.length > 0 ||
      filters.difficultyLevels.length > 0;

    return {
      totalResults: results.length,
      hasActiveFilters,
      isFiltered: hasActiveFilters,
    };
  }, [filters, results]);

  // Quick searches
  const quickSearchByCategory = useCallback(
    (category: string) => {
      updateFilters({ categories: [category], query: "" });
    },
    [updateFilters]
  );

  const quickSearchBeginnerTerms = useCallback(() => {
    updateFilters({ difficultyLevels: ["beginner"], query: "" });
  }, [updateFilters]);

  // Get random terms for discovery
  const getRandomTerms = useCallback(
    async (count: number = 5): Promise<GlossaryItem[]> => {
      try {
        const allItems = await storageService.getAll<GlossaryItem>("glossary");
        const shuffled = [...allItems].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      } catch (err) {
        console.error("Failed to get random terms:", err);
        return [];
      }
    },
    []
  );

  return {
    // State
    filters,
    results,
    isLoading,
    error,

    // Actions
    search,
    updateFilters,
    resetFilters,
    setFilters,

    // Utilities
    getFilterOptions,
    getSuggestions,
    searchSummary,
    getRandomTerms,

    // Quick searches
    quickSearchByCategory,
    quickSearchBeginnerTerms,
  };
};
