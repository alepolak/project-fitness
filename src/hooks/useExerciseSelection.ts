/**
 * Hook for managing exercise selection in workout planning
 * Following cursor rules for state management and type safety
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { exerciseRepository } from "@/repositories";
import type { ExerciseCatalogItem, ExerciseSelectionFilters } from "@/types";

export const useExerciseSelection = (initialSelected: string[] = []) => {
  const [selectedExercises, setSelectedExercises] = useState<string[]>(initialSelected);
  const [availableExercises, setAvailableExercises] = useState<ExerciseCatalogItem[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExerciseSelectionFilters>({});

  // Load available exercises on mount
  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const exercises = await exerciseRepository.getAll();
        setAvailableExercises(exercises);
        setFilteredExercises(exercises);
      } catch (err) {
        setError("Failed to load exercises");
        console.error("Failed to load exercises:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExercises();
  }, []);

  // Apply filters when filters or available exercises change
  useEffect(() => {
    applyFilters();
  }, [filters, availableExercises]);

  const applyFilters = useCallback(() => {
    let filtered = [...availableExercises];

    // Movement pattern filter
    if (filters.movement_patterns && filters.movement_patterns.length > 0) {
      filtered = filtered.filter(exercise =>
        filters.movement_patterns!.includes(exercise.movement_pattern)
      );
    }

    // Equipment filter
    if (filters.equipment && filters.equipment.length > 0) {
      filtered = filtered.filter(exercise =>
        filters.equipment!.some(equipment =>
          exercise.equipment.includes(equipment)
        )
      );
    }

    // Primary muscles filter
    if (filters.primary_muscles && filters.primary_muscles.length > 0) {
      filtered = filtered.filter(exercise =>
        filters.primary_muscles!.some(muscle =>
          exercise.primary_muscles.includes(muscle)
        )
      );
    }

    // Difficulty level filter
    if (filters.difficulty_level) {
      filtered = filtered.filter(exercise =>
        exercise.difficulty_level === filters.difficulty_level
      );
    }

    // Exercise type filter
    if (filters.exercise_type) {
      filtered = filtered.filter(exercise =>
        exercise.exercise_type === filters.exercise_type
      );
    }

    setFilteredExercises(filtered);
  }, [availableExercises, filters]);

  const addExercise = useCallback((exerciseId: string) => {
    if (!selectedExercises.includes(exerciseId)) {
      setSelectedExercises(prev => [...prev, exerciseId]);
    }
  }, [selectedExercises]);

  const removeExercise = useCallback((exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(id => id !== exerciseId));
  }, []);

  const reorderExercises = useCallback((startIndex: number, endIndex: number) => {
    setSelectedExercises(prev => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedExercises([]);
  }, []);

  const isSelected = useCallback((exerciseId: string): boolean => {
    return selectedExercises.includes(exerciseId);
  }, [selectedExercises]);

  const getSelectedExerciseData = useCallback((): ExerciseCatalogItem[] => {
    return selectedExercises
      .map(id => availableExercises.find(ex => ex.id === id))
      .filter((ex): ex is ExerciseCatalogItem => ex !== undefined);
  }, [selectedExercises, availableExercises]);

  const updateFilters = useCallback((newFilters: Partial<ExerciseSelectionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const searchExercises = useCallback((query: string) => {
    if (!query.trim()) {
      applyFilters();
      return;
    }

    const searchTerm = query.toLowerCase();
    const searchResults = availableExercises.filter(exercise => {
      const matchesName = exercise.name.toLowerCase().includes(searchTerm);
      const matchesFriendlyName = exercise.beginner_friendly_name.toLowerCase().includes(searchTerm);
      const matchesAliases = exercise.aliases.some(alias =>
        alias.toLowerCase().includes(searchTerm)
      );
      const matchesMuscles = exercise.primary_muscles.some(muscle =>
        muscle.toLowerCase().includes(searchTerm)
      );
      const matchesEquipment = exercise.equipment.some(equipment =>
        equipment.toLowerCase().includes(searchTerm)
      );

      return matchesName || matchesFriendlyName || matchesAliases || matchesMuscles || matchesEquipment;
    });

    setFilteredExercises(searchResults);
  }, [availableExercises, applyFilters]);

  // Get unique values for filter options
  const getFilterOptions = useCallback(() => {
    const movementPatterns = [...new Set(availableExercises.map(ex => ex.movement_pattern))];
    const equipment = [...new Set(availableExercises.flatMap(ex => ex.equipment))];
    const primaryMuscles = [...new Set(availableExercises.flatMap(ex => ex.primary_muscles))];
    const difficultyLevels = [...new Set(availableExercises.map(ex => ex.difficulty_level))];
    const exerciseTypes = [...new Set(availableExercises.map(ex => ex.exercise_type))];

    return {
      movementPatterns: movementPatterns.sort(),
      equipment: equipment.sort(),
      primaryMuscles: primaryMuscles.sort(),
      difficultyLevels: difficultyLevels.sort(),
      exerciseTypes: exerciseTypes.sort(),
    };
  }, [availableExercises]);

  const getRecommendations = useCallback((
    sessionType: string,
    currentSelections: string[],
    limit: number = 5
  ): ExerciseCatalogItem[] => {
    // Filter out already selected exercises
    const unselected = availableExercises.filter(ex => 
      !currentSelections.includes(ex.id)
    );

    // Recommend based on session type
    let recommendations: ExerciseCatalogItem[] = [];

    switch (sessionType) {
      case 'strength':
        recommendations = unselected.filter(ex => 
          ex.exercise_type === 'strength' && 
          ex.difficulty_level === 'beginner'
        );
        break;
      
      case 'intervals':
        recommendations = unselected.filter(ex => 
          ex.exercise_type === 'cardio' || 
          (ex.exercise_type === 'strength' && ex.equipment.length === 0) // bodyweight
        );
        break;
        
      case 'steady_cardio':
        recommendations = unselected.filter(ex => 
          ex.exercise_type === 'cardio'
        );
        break;
        
      case 'flexibility':
        recommendations = unselected.filter(ex => 
          ex.exercise_type === 'flexibility'
        );
        break;
        
      default:
        recommendations = unselected.filter(ex => 
          ex.difficulty_level === 'beginner'
        );
    }

    // Sort by popularity (for now, just return first N)
    return recommendations.slice(0, limit);
  }, [availableExercises]);

  return {
    // Selection state
    selectedExercises,
    availableExercises: filteredExercises,
    allExercises: availableExercises,
    isLoading,
    error,
    
    // Selection actions
    addExercise,
    removeExercise,
    reorderExercises,
    clearSelection,
    isSelected,
    getSelectedExerciseData,
    
    // Filtering
    filters,
    updateFilters,
    clearFilters,
    searchExercises,
    getFilterOptions,
    
    // Recommendations
    getRecommendations,
  };
};
