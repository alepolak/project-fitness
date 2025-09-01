/**
 * Workout repository for managing workout logs
 * Following cursor rules for repository pattern
 */

import { BaseRepository } from "./base";
import { ValidationService } from "@/validators";
import { DateUtils } from "@/utils/dateUtils";
import type { WorkoutLogEntry, ExerciseEntry, WorkoutSummary } from "@/types";

export class WorkoutRepository extends BaseRepository<WorkoutLogEntry> {
  constructor() {
    super("workouts", ValidationService.validateWorkoutLog);
  }

  /**
   * Get workouts by exercise ID
   */
  async getByExercise(exerciseId: string): Promise<WorkoutLogEntry[]> {
    const allWorkouts = await this.getAll();
    
    return allWorkouts.filter((workout) =>
      workout.entries.some((entry) => 
        (entry.type === "strength" || entry.type === "flexibility") && 
        entry.exercise_id === exerciseId
      )
    );
  }

  /**
   * Get workouts by date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<WorkoutLogEntry[]> {
    const allWorkouts = await this.getAll();
    
    return allWorkouts.filter((workout) => {
      const workoutDate = workout.date_time_start.split("T")[0];
      return workoutDate >= startDate && workoutDate <= endDate;
    });
  }

  /**
   * Get recent workout sessions
   */
  async getRecentSessions(limit: number = 10): Promise<WorkoutLogEntry[]> {
    const allWorkouts = await this.getAll();
    
    return allWorkouts
      .sort((a, b) => 
        new Date(b.date_time_start).getTime() - new Date(a.date_time_start).getTime()
      )
      .slice(0, limit);
  }

  /**
   * Get workouts by environment
   */
  async getByEnvironment(
    environment: WorkoutLogEntry["environment"]
  ): Promise<WorkoutLogEntry[]> {
    return this.query({ environment });
  }

  /**
   * Get workouts by rating
   */
  async getByRating(minRating: number): Promise<WorkoutLogEntry[]> {
    const allWorkouts = await this.getAll();
    
    return allWorkouts.filter((workout) =>
      workout.overall_rating && workout.overall_rating >= minRating
    );
  }

  /**
   * Get workouts for specific week
   */
  async getWeekWorkouts(date: string): Promise<WorkoutLogEntry[]> {
    const weekStart = DateUtils.getWeekStart(date);
    const weekEnd = DateUtils.addDays(weekStart, 6);
    
    return this.getByDateRange(weekStart, weekEnd);
  }

  /**
   * Get today's workouts
   */
  async getTodayWorkouts(): Promise<WorkoutLogEntry[]> {
    const today = DateUtils.getCurrentDate();
    return this.getByDateRange(today, today);
  }

  /**
   * Get workouts this week
   */
  async getThisWeekWorkouts(): Promise<WorkoutLogEntry[]> {
    const today = DateUtils.getCurrentDate();
    return this.getWeekWorkouts(today);
  }

  /**
   * Get workouts by session plan reference
   */
  async getBySessionPlan(sessionPlanRef: string): Promise<WorkoutLogEntry[]> {
    return this.query({ session_plan_ref: sessionPlanRef });
  }

  /**
   * Get workout statistics
   */
  async getWorkoutSummary(
    startDate?: string,
    endDate?: string
  ): Promise<WorkoutSummary> {
    let workouts = await this.getAll();
    
    if (startDate && endDate) {
      workouts = await this.getByDateRange(startDate, endDate);
    }

    const summary: WorkoutSummary = {
      total_workouts: workouts.length,
      total_duration_minutes: 0,
      exercises_performed: [],
      strength_volume_lb: 0,
      cardio_distance_miles: 0,
      average_workout_rating: 0,
      most_frequent_exercises: [],
    };

    const exerciseFrequency = new Map<string, number>();
    let totalRating = 0;
    let ratedWorkouts = 0;

    workouts.forEach((workout) => {
      // Calculate duration
      if (workout.date_time_end) {
        const duration = DateUtils.formatDuration(
          workout.date_time_start,
          workout.date_time_end
        );
        summary.total_duration_minutes += duration / 60; // Convert to minutes
      }

      // Track rating
      if (workout.overall_rating) {
        totalRating += workout.overall_rating;
        ratedWorkouts++;
      }

      // Process entries
      workout.entries.forEach((entry) => {
        // Track exercise frequency
        if (entry.type === "strength" || entry.type === "flexibility") {
          const currentCount = exerciseFrequency.get(entry.exercise_id) || 0;
          exerciseFrequency.set(entry.exercise_id, currentCount + 1);

          if (!summary.exercises_performed.includes(entry.exercise_id)) {
            summary.exercises_performed.push(entry.exercise_id);
          }
        }

        // Calculate strength volume
        if (entry.type === "strength") {
          entry.performed_sets.forEach((set) => {
            if (set.weight_value && set.weight_unit) {
              let weightInLb = set.weight_value;
              if (set.weight_unit === "kg") {
                weightInLb = set.weight_value * 2.205; // Convert to lb
              }
              summary.strength_volume_lb += weightInLb * set.repetitions_done;
            }
          });
        }

        // Calculate cardio distance
        if (entry.type === "cardio") {
          entry.segments.forEach((segment) => {
            if (segment.distance_value && segment.distance_unit) {
              let distanceInMiles = segment.distance_value;
              if (segment.distance_unit === "kilometers") {
                distanceInMiles = segment.distance_value / 1.609344;
              } else if (segment.distance_unit === "meters") {
                distanceInMiles = segment.distance_value / 1609.344;
              }
              summary.cardio_distance_miles += distanceInMiles;
            }
          });
        }
      });
    });

    // Calculate average rating
    if (ratedWorkouts > 0) {
      summary.average_workout_rating = totalRating / ratedWorkouts;
    }

    // Get most frequent exercises
    summary.most_frequent_exercises = Array.from(exerciseFrequency.entries())
      .map(([exercise_id, count]) => ({ exercise_id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return summary;
  }

  /**
   * Get workout streaks (consecutive days with workouts)
   */
  async getCurrentStreak(): Promise<number> {
    const allWorkouts = await this.getAll();
    
    // Get unique workout dates
    const workoutDates = new Set(
      allWorkouts.map((workout) => workout.date_time_start.split("T")[0])
    );
    
    const sortedDates = Array.from(workoutDates).sort().reverse();
    
    if (sortedDates.length === 0) {
      return 0;
    }

    let streak = 0;
    const today = DateUtils.getCurrentDate();
    let currentDate = today;

    // Check if there's a workout today or yesterday
    if (!workoutDates.has(today)) {
      const yesterday = DateUtils.getDaysAgo(1);
      if (!workoutDates.has(yesterday)) {
        return 0;
      }
      currentDate = yesterday;
    }

    // Count consecutive days
    while (workoutDates.has(currentDate)) {
      streak++;
      currentDate = DateUtils.addDays(currentDate, -1);
    }

    return streak;
  }

  /**
   * Get exercise history for progression tracking
   */
  async getExerciseHistory(
    exerciseId: string,
    limit: number = 10
  ): Promise<Array<{
    workout: WorkoutLogEntry;
    entry: ExerciseEntry;
  }>> {
    const workouts = await this.getByExercise(exerciseId);
    
    const history: Array<{ workout: WorkoutLogEntry; entry: ExerciseEntry }> = [];
    
    workouts
      .sort((a, b) => 
        new Date(b.date_time_start).getTime() - new Date(a.date_time_start).getTime()
      )
      .forEach((workout) => {
        const entry = workout.entries.find((e) => 
          (e.type === "strength" || e.type === "flexibility") && 
          e.exercise_id === exerciseId
        );
        if (entry) {
          history.push({ workout, entry });
        }
      });

    return history.slice(0, limit);
  }

  /**
   * Get personal records for an exercise
   */
  async getPersonalRecords(exerciseId: string): Promise<{
    maxWeight: { value: number; unit: string; date: string } | null;
    maxReps: { value: number; weight?: number; date: string } | null;
    maxVolume: { value: number; date: string } | null;
  }> {
    const history = await this.getExerciseHistory(exerciseId, 100);
    
    let maxWeight: { value: number; unit: string; date: string } | null = null;
    let maxReps: { value: number; weight?: number; date: string } | null = null;
    let maxVolume: { value: number; date: string } | null = null;

    history.forEach(({ workout, entry }) => {
      if (entry.type === "strength") {
        entry.performed_sets.forEach((set) => {
          const date = workout.date_time_start.split("T")[0];
          
          // Check max weight
          if (set.weight_value && set.weight_unit) {
            let weightInLb = set.weight_value;
            if (set.weight_unit === "kg") {
              weightInLb = set.weight_value * 2.205;
            }
            
            if (!maxWeight || weightInLb > maxWeight.value) {
              maxWeight = {
                value: set.weight_value,
                unit: set.weight_unit,
                date,
              };
            }
          }

          // Check max reps
          if (!maxReps || set.repetitions_done > maxReps.value) {
            maxReps = {
              value: set.repetitions_done,
              weight: set.weight_value,
              date,
            };
          }

          // Check max volume for this set
          if (set.weight_value) {
            let weightInLb = set.weight_value;
            if (set.weight_unit === "kg") {
              weightInLb = set.weight_value * 2.205;
            }
            
            const volume = weightInLb * set.repetitions_done;
            if (!maxVolume || volume > maxVolume.value) {
              maxVolume = { value: volume, date };
            }
          }
        });
      }
    });

    return { maxWeight, maxReps, maxVolume };
  }
}
