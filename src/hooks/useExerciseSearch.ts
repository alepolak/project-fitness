/**
 * Exercise search hook with filtering capabilities
 * Following cursor rules for type safety and performance
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { exerciseRepository } from "@/repositories";
import type { ExerciseCatalogItem } from "@/types";

export interface ExerciseSearchFilters {
  query: string;
  movementPatterns: string[];
  equipment: string[];
  primaryMuscles: string[];
  difficultyLevels: string[];
  exerciseTypes: string[];
  beginnerFriendly?: boolean;
}

export interface ExerciseSearchResult {
  exercises: ExerciseCatalogItem[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialFilters: ExerciseSearchFilters = {
  query: "",
  movementPatterns: [],
  equipment: [],
  primaryMuscles: [],
  difficultyLevels: [],
  exerciseTypes: [],
  beginnerFriendly: undefined,
};

export const useExerciseSearch = () => {
  const [filters, setFilters] = useState<ExerciseSearchFilters>(initialFilters);
  const [results, setResults] = useState<ExerciseCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search function
  const search = useCallback(async (searchFilters: ExerciseSearchFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      let exercises: ExerciseCatalogItem[] = [];

      // Start with text search if there's a query
      if (searchFilters.query.trim()) {
        exercises = await exerciseRepository.searchByName(searchFilters.query);
      } else {
        exercises = await exerciseRepository.getAll();
      }

      // Apply movement pattern filters
      if (searchFilters.movementPatterns.length > 0) {
        exercises = exercises.filter((exercise) =>
          searchFilters.movementPatterns.includes(exercise.movement_pattern)
        );
      }

      // Apply equipment filters
      if (searchFilters.equipment.length > 0) {
        exercises = exercises.filter((exercise) =>
          searchFilters.equipment.some((eq) => exercise.equipment.includes(eq))
        );
      }

      // Apply muscle group filters
      if (searchFilters.primaryMuscles.length > 0) {
        exercises = exercises.filter((exercise) =>
          searchFilters.primaryMuscles.some((muscle) =>
            exercise.primary_muscles.includes(muscle) ||
            (exercise.secondary_muscles && exercise.secondary_muscles.includes(muscle))
          )
        );
      }

      // Apply difficulty level filters
      if (searchFilters.difficultyLevels.length > 0) {
        exercises = exercises.filter((exercise) =>
          searchFilters.difficultyLevels.includes(exercise.difficulty_level)
        );
      }

      // Apply exercise type filters
      if (searchFilters.exerciseTypes.length > 0) {
        exercises = exercises.filter((exercise) =>
          searchFilters.exerciseTypes.includes(exercise.exercise_type)
        );
      }

      // Apply beginner-friendly filter
      if (searchFilters.beginnerFriendly !== undefined) {
        if (searchFilters.beginnerFriendly) {
          exercises = exercises.filter((exercise) =>
            exercise.difficulty_level === "beginner"
          );
        }
      }

      setResults(exercises);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update filters and trigger search
  const updateFilters = useCallback(
    (newFilters: Partial<ExerciseSearchFilters>) => {
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
      const allExercises = await exerciseRepository.getAll();
      
      const movementPatterns = [...new Set(allExercises.map(e => e.movement_pattern))];
      const equipment = [...new Set(allExercises.flatMap(e => e.equipment))];
      const primaryMuscles = [...new Set(allExercises.flatMap(e => e.primary_muscles))];
      const difficultyLevels = [...new Set(allExercises.map(e => e.difficulty_level))];
      const exerciseTypes = [...new Set(allExercises.map(e => e.exercise_type))];

      return {
        movementPatterns: movementPatterns.sort(),
        equipment: equipment.sort(),
        primaryMuscles: primaryMuscles.sort(),
        difficultyLevels: difficultyLevels.sort(),
        exerciseTypes: exerciseTypes.sort(),
      };
    } catch (err) {
      console.error("Failed to get filter options:", err);
      return {
        movementPatterns: [],
        equipment: [],
        primaryMuscles: [],
        difficultyLevels: [],
        exerciseTypes: [],
      };
    }
  }, []);

  // Search result summary
  const searchSummary = useMemo(() => {
    const hasActiveFilters = 
      filters.query.trim() !== "" ||
      filters.movementPatterns.length > 0 ||
      filters.equipment.length > 0 ||
      filters.primaryMuscles.length > 0 ||
      filters.difficultyLevels.length > 0 ||
      filters.exerciseTypes.length > 0 ||
      filters.beginnerFriendly !== undefined;

    return {
      totalResults: results.length,
      hasActiveFilters,
      isFiltered: hasActiveFilters,
    };
  }, [filters, results]);

  // Quick searches
  const quickSearchByMovementPattern = useCallback(
    (pattern: string) => {
      updateFilters({ movementPatterns: [pattern], query: "" });
    },
    [updateFilters]
  );

  const quickSearchByEquipment = useCallback(
    (equipmentType: string) => {
      updateFilters({ equipment: [equipmentType], query: "" });
    },
    [updateFilters]
  );

  const quickSearchBeginnerFriendly = useCallback(() => {
    updateFilters({ beginnerFriendly: true, query: "" });
  }, [updateFilters]);

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
    searchSummary,

    // Quick searches
    quickSearchByMovementPattern,
    quickSearchByEquipment,
    quickSearchBeginnerFriendly,
  };
};
