/**
 * Hook for managing workout history and filtering
 * Following cursor rules for state management and type safety
 */

"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { workoutRepository } from "@/repositories";
import type { 
  WorkoutLogEntry, 
  WorkoutFilters, 
  ExerciseProgressData,
  WorkoutSummary 
} from "@/types";

export const useWorkoutHistory = () => {
  const [workouts, setWorkouts] = useState<WorkoutLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WorkoutFilters>({
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Load workouts on mount
  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allWorkouts = await workoutRepository.getAll();
      setWorkouts(allWorkouts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workout history");
      console.error("Failed to load workouts:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<WorkoutFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      sortBy: 'date',
      sortOrder: 'desc',
    });
  }, []);

  // Filter and sort workouts based on current filters
  const filteredWorkouts = useMemo(() => {
    let filtered = [...workouts];

    // Apply exercise filter
        if (filters.exerciseId) {
      filtered = filtered.filter(workout =>
        workout.entries.some(entry => {
          // All exercise entry types have exercise_id
          return 'exercise_id' in entry && entry.exercise_id === filters.exerciseId;
        })
      );
    }

    // Apply date range filter
    if (filters.dateRange) {
      const startDate = filters.dateRange.start.toISOString().split('T')[0];
      const endDate = filters.dateRange.end.toISOString().split('T')[0];
      
      filtered = filtered.filter(workout => {
        const workoutDate = workout.date_time_start.split('T')[0];
        return workoutDate >= startDate && workoutDate <= endDate;
      });
    }

    // Apply session type filter
    if (filters.sessionType) {
      filtered = filtered.filter(workout => 
        workout.session_title?.toLowerCase().includes(filters.sessionType!.toLowerCase())
      );
    }

    // Apply environment filter
    if (filters.environment) {
      filtered = filtered.filter(workout => workout.environment === filters.environment);
    }

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(workout => 
        workout.session_title?.toLowerCase().includes(query) ||
        workout.session_notes?.toLowerCase().includes(query) ||
                workout.entries.some(entry =>
          ('exercise_name' in entry && entry.exercise_name?.toLowerCase().includes(query)) ||
          ('notes' in entry && entry.notes?.toLowerCase().includes(query))
        )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.date_time_start).getTime();
          bValue = new Date(b.date_time_start).getTime();
          break;
        case 'duration':
          aValue = a.date_time_end 
            ? (new Date(a.date_time_end).getTime() - new Date(a.date_time_start).getTime()) / 1000
            : 0;
          bValue = b.date_time_end 
            ? (new Date(b.date_time_end).getTime() - new Date(b.date_time_start).getTime()) / 1000
            : 0;
          break;
        case 'rating':
          aValue = a.overall_rating || 0;
          bValue = b.overall_rating || 0;
          break;
        case 'exercise':
          aValue = a.entries.length;
          bValue = b.entries.length;
          break;
        default:
          aValue = a.date_time_start;
          bValue = b.date_time_start;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [workouts, filters]);

  const getExerciseProgress = useCallback((exerciseId: string): ExerciseProgressData => {
        const exerciseWorkouts = workouts.filter(workout =>
      workout.entries.some(entry => 'exercise_id' in entry && entry.exercise_id === exerciseId)
    );

    const sessions = exerciseWorkouts.map(workout => {
      const exerciseEntry = workout.entries.find(entry => 'exercise_id' in entry && entry.exercise_id === exerciseId);
      
      if (!exerciseEntry || exerciseEntry.type !== 'strength') {
        return null;
      }

      const strengthEntry = exerciseEntry; // StrengthEntry
      
      const maxWeight = strengthEntry.type === 'strength' ? Math.max(...strengthEntry.performed_sets.map(set => set.weight_value || 0)) : 0;
      const maxReps = strengthEntry.type === 'strength' ? Math.max(...strengthEntry.performed_sets.map(set => set.repetitions_done || 0)) : 0;
      const totalVolume = strengthEntry.type === 'strength' ? strengthEntry.performed_sets.reduce((total: number, set) => 
        total + (set.weight_value || 0) * (set.repetitions_done || 0), 0) : 0;
      const averageRpe = strengthEntry.type === 'strength' && strengthEntry.performed_sets.length > 0 
        ? strengthEntry.performed_sets.reduce((sum: number, set) => sum + (set.rpe_score || 0), 0) / strengthEntry.performed_sets.length
        : 0;

      return {
        date: workout.date_time_start.split('T')[0],
        maxWeight,
        maxReps,
        totalVolume,
        averageRpe,
        setCount: strengthEntry.type === 'strength' ? strengthEntry.performed_sets.length : 0,
      };
    }).filter(Boolean);

    return {
      exerciseId,
      exerciseName: (() => {
        const entry = exerciseWorkouts[0]?.entries.find(e => 'exercise_id' in e && e.exercise_id === exerciseId);
        return entry && 'exercise_name' in entry ? entry.exercise_name : '';
      })(),
      sessions: sessions.filter(Boolean) as Array<{
        date: string;
        maxWeight: number;
        maxReps: number;
        totalVolume: number;
        averageRpe: number;
        setCount: number;
      }>,
    };
  }, [workouts]);

  const getWorkoutSummary = useCallback((): WorkoutSummary => {
    const totalWorkouts = workouts.length;
    let totalDurationMinutes = 0;
    const exerciseIds = new Set<string>();
    let strengthVolumeLb = 0;
    let cardioDistanceMiles = 0;
    let totalRating = 0;
    let ratingsCount = 0;
    const exerciseCounts: Record<string, number> = {};

    workouts.forEach(workout => {
      // Calculate duration
      if (workout.date_time_end) {
        const duration = (new Date(workout.date_time_end).getTime() - 
                         new Date(workout.date_time_start).getTime()) / (1000 * 60);
        totalDurationMinutes += duration;
      }

      // Track ratings
      if (workout.overall_rating) {
        totalRating += workout.overall_rating;
        ratingsCount++;
      }

      // Process exercises
      workout.entries.forEach(entry => {
        if ('exercise_id' in entry) {
          exerciseIds.add(entry.exercise_id);
          
          // Count exercise frequency
          exerciseCounts[entry.exercise_id] = (exerciseCounts[entry.exercise_id] || 0) + 1;
        }

        if (entry.type === 'strength') {
          const strengthEntry = entry; // StrengthEntry
          strengthEntry.performed_sets?.forEach((set) => {
            if (set.weight_value && set.repetitions_done) {
              // Convert to lb if needed
              let weight = set.weight_value;
              if (set.weight_unit === 'kg') {
                weight *= 2.20462;
              }
              strengthVolumeLb += weight * set.repetitions_done;
            }
          });
        } else if (entry.type === 'cardio') {
          const cardioEntry = entry; // CardioEntry
          cardioEntry.segments?.forEach((segment) => {
            if (segment.distance_value) {
              let distance = segment.distance_value;
              if (segment.distance_unit === 'kilometers') {
                distance *= 0.621371;
              } else if (segment.distance_unit === 'meters') {
                distance *= 0.000621371;
              }
              cardioDistanceMiles += distance;
            }
          });
        }
      });
    });

    const mostFrequentExercises = Object.entries(exerciseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([exercise_id, count]) => ({ exercise_id, count }));

    return {
      total_workouts: totalWorkouts,
      total_duration_minutes: Math.round(totalDurationMinutes),
      exercises_performed: Array.from(exerciseIds),
      strength_volume_lb: Math.round(strengthVolumeLb),
      cardio_distance_miles: Math.round(cardioDistanceMiles * 100) / 100,
      average_workout_rating: ratingsCount > 0 ? Math.round((totalRating / ratingsCount) * 10) / 10 : 0,
      most_frequent_exercises: mostFrequentExercises,
    };
  }, [workouts]);

  const deleteWorkout = useCallback(async (workoutId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await workoutRepository.delete(workoutId);
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete workout");
      console.error("Failed to delete workout:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const duplicateWorkout = useCallback(async (workout: WorkoutLogEntry): Promise<WorkoutLogEntry> => {
    setIsLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const duplicatedWorkout: WorkoutLogEntry = {
        ...workout,
        id: crypto.randomUUID(),
        date_time_start: now,
        date_time_end: undefined,
        session_notes: `Copy of: ${workout.session_title || 'Workout'}`,
        created_at: now,
        updated_at: now,
        version: 1,
      };

      await workoutRepository.save(duplicatedWorkout);
      setWorkouts(prev => [duplicatedWorkout, ...prev]);
      
      return duplicatedWorkout;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate workout");
      console.error("Failed to duplicate workout:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Data
    workouts: filteredWorkouts,
    allWorkouts: workouts,
    isLoading,
    error,
    
    // Filtering
    filters,
    updateFilters,
    clearFilters,
    
    // Actions
    loadWorkouts,
    deleteWorkout,
    duplicateWorkout,
    
    // Analysis
    getExerciseProgress,
    getWorkoutSummary,
  };
};
