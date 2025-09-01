/**
 * Workout analysis and progress calculation utilities
 * Following cursor rules for type safety and performance
 */

import type { 
  WorkoutLogEntry, 
  PerformedSet, 
  StrengthEntry,
  ProgressTrend,
  WorkoutStats
} from "@/types";

export class WorkoutAnalysis {
  /**
   * Calculate total volume for strength sets (weight × reps)
   */
  static calculateVolume(sets: PerformedSet[], targetUnit: 'lb' | 'kg' = 'lb'): number {
    return sets.reduce((total, set) => {
      let weight = set.weight_value || 0;
      
      // Convert weight to target unit
      if (set.weight_unit && set.weight_unit !== targetUnit) {
        if (targetUnit === 'lb' && set.weight_unit === 'kg') {
          weight *= 2.20462;
        } else if (targetUnit === 'kg' && set.weight_unit === 'lb') {
          weight *= 0.453592;
        }
      }
      
      return total + (weight * set.repetitions_done);
    }, 0);
  }

  /**
   * Calculate average perceived effort across sets
   */
  static calculateAverageIntensity(sets: PerformedSet[]): number {
    if (sets.length === 0) return 0;
    
    const efforts = sets.map(set => this.perceivedEffortToNumber(set.perceived_effort_text));
    return efforts.reduce((sum, effort) => sum + effort, 0) / efforts.length;
  }

  /**
   * Convert perceived effort text to numeric value
   */
  static perceivedEffortToNumber(effort: string): number {
    const mapping: Record<string, number> = {
      'very easy': 1,
      'easy': 2,
      'moderately hard': 3,
      'hard': 4,
      'very hard': 5
    };
    return mapping[effort] || 3;
  }

  /**
   * Calculate average RPE from sets
   */
  static calculateAverageRPE(sets: PerformedSet[]): number {
    if (sets.length === 0) return 0;
    
    const rpeValues = sets
      .map(set => set.rpe_score || this.perceivedEffortToNumber(set.perceived_effort_text))
      .filter(rpe => rpe > 0);
    
    return rpeValues.length > 0 
      ? rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length 
      : 0;
  }

  /**
   * Analyze progress trend for an exercise over time
   */
  static getProgressTrend(
    workouts: WorkoutLogEntry[], 
    exerciseId: string, 
    metric: 'weight' | 'reps' | 'volume'
  ): ProgressTrend {
    const exerciseData = this.extractExerciseData(workouts, exerciseId);
    
    if (exerciseData.length < 2) {
      return { trend: 'stable', percentage: 0, period: 'insufficient data' };
    }

    // Sort by date
    exerciseData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const recentData = exerciseData.slice(-6); // Last 6 sessions
    const values = recentData.map(session => {
      switch (metric) {
        case 'weight':
          return session.maxWeight;
        case 'reps':
          return session.maxReps;
        case 'volume':
          return session.totalVolume;
        default:
          return 0;
      }
    });

    if (values.length < 2) {
      return { trend: 'stable', percentage: 0, period: 'insufficient data' };
    }

    // Simple linear regression to determine trend
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * values[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    
    if (firstValue === 0) {
      return { trend: 'stable', percentage: 0, period: `${n} sessions` };
    }

    const percentageChange = ((lastValue - firstValue) / firstValue) * 100;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (slope > 0.1) {
      trend = 'increasing';
    } else if (slope < -0.1) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    return {
      trend,
      percentage: Math.round(percentageChange * 10) / 10,
      period: `${n} sessions`
    };
  }

  /**
   * Calculate workout duration in seconds
   */
  static calculateWorkoutDuration(workout: WorkoutLogEntry): number {
    if (!workout.date_time_end) {
      return 0;
    }
    
    const startTime = new Date(workout.date_time_start).getTime();
    const endTime = new Date(workout.date_time_end).getTime();
    
    return Math.floor((endTime - startTime) / 1000);
  }

  /**
   * Find personal records for an exercise
   */
  static getPersonalRecords(workouts: WorkoutLogEntry[], exerciseId: string): {
    maxWeight: number;
    maxReps: number;
    maxVolume: number;
    bestSession?: string;
  } {
    let maxWeight = 0;
    let maxReps = 0;
    let maxVolume = 0;
    let bestSession = '';

    workouts.forEach(workout => {
      const exerciseEntry = workout.entries.find(entry => entry.type === 'strength' && entry.exercise_id === exerciseId);
      
      if (exerciseEntry && exerciseEntry.type === 'strength') {
        const strengthEntry = exerciseEntry as StrengthEntry;
        
        strengthEntry.performed_sets.forEach(set => {
          // Weight PR
          const weight = set.weight_value || 0;
          if (weight > maxWeight) {
            maxWeight = weight;
            bestSession = workout.date_time_start.split('T')[0];
          }
          
          // Reps PR
          if (set.repetitions_done > maxReps) {
            maxReps = set.repetitions_done;
          }
        });
        
        // Volume PR for this session
        const sessionVolume = this.calculateVolume(strengthEntry.performed_sets);
        if (sessionVolume > maxVolume) {
          maxVolume = sessionVolume;
        }
      }
    });

    return {
      maxWeight: Math.round(maxWeight * 10) / 10,
      maxReps,
      maxVolume: Math.round(maxVolume),
      bestSession
    };
  }

  /**
   * Extract exercise data from workouts for analysis
   */
  private static extractExerciseData(workouts: WorkoutLogEntry[], exerciseId: string): Array<{
    date: string;
    maxWeight: number;
    maxReps: number;
    totalVolume: number;
    averageRpe: number;
    setCount: number;
  }> {
    return workouts
      .filter(workout => workout.entries.some(entry => entry.type === 'strength' && entry.exercise_id === exerciseId))
      .map(workout => {
        const exerciseEntry = workout.entries.find(entry => entry.type === 'strength' && entry.exercise_id === exerciseId);
        
        if (!exerciseEntry || exerciseEntry.type !== 'strength') {
          return null;
        }

        const strengthEntry = exerciseEntry as StrengthEntry;
        const sets = strengthEntry.performed_sets;
        
        const maxWeight = Math.max(...sets.map(set => set.weight_value || 0));
        const maxReps = Math.max(...sets.map(set => set.repetitions_done));
        const totalVolume = this.calculateVolume(sets);
        const averageRpe = this.calculateAverageRPE(sets);

        return {
          date: workout.date_time_start,
          maxWeight,
          maxReps,
          totalVolume,
          averageRpe,
          setCount: sets.length,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  /**
   * Calculate estimated 1RM using Brzycki formula
   */
  static calculateEstimated1RM(weight: number, reps: number): number {
    if (reps === 1) return weight;
    if (reps > 30) return weight; // Formula not reliable for high reps
    
    // Brzycki formula: 1RM = weight × (36 / (37 - reps))
    return weight * (36 / (37 - reps));
  }

  /**
   * Calculate workout intensity score
   */
  static calculateIntensityScore(workout: WorkoutLogEntry): number {
    let totalIntensity = 0;
    let setCount = 0;

    workout.entries.forEach(entry => {
      if (entry.type === 'strength') {
        const strengthEntry = entry as StrengthEntry;
        strengthEntry.performed_sets.forEach(set => {
          const rpe = set.rpe_score || this.perceivedEffortToNumber(set.perceived_effort_text);
          totalIntensity += rpe;
          setCount++;
        });
      }
    });

    return setCount > 0 ? totalIntensity / setCount : 0;
  }

  /**
   * Generate workout statistics
   */
  static generateWorkoutStats(workout: WorkoutLogEntry): WorkoutStats {
    let totalVolume = 0;
    let totalReps = 0;
    let maxWeight = 0;
    const rpeValues: number[] = [];

    workout.entries.forEach(entry => {
      if (entry.type === 'strength') {
        const strengthEntry = entry as StrengthEntry;
        const volume = this.calculateVolume(strengthEntry.performed_sets);
        totalVolume += volume;
        
        strengthEntry.performed_sets.forEach(set => {
          totalReps += set.repetitions_done;
          maxWeight = Math.max(maxWeight, set.weight_value || 0);
          
          const rpe = set.rpe_score || this.perceivedEffortToNumber(set.perceived_effort_text);
          rpeValues.push(rpe);
        });
      }
    });

    const averageRpe = rpeValues.length > 0 
      ? rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length 
      : 0;

    const duration = this.calculateWorkoutDuration(workout);

    return {
      totalVolume: Math.round(totalVolume),
      averageRpe: Math.round(averageRpe * 10) / 10,
      maxWeight: Math.round(maxWeight * 10) / 10,
      totalReps,
      exerciseCount: workout.entries.length,
      duration,
    };
  }

  /**
   * Check if workout contains potential form breakdown
   */
  static hasFormBreakdown(workout: WorkoutLogEntry): boolean {
    return workout.entries.some(entry => {
      if (entry.type === 'strength') {
        const strengthEntry = entry as StrengthEntry;
        return strengthEntry.performed_sets.some(set => set.form_breakdown === true);
      }
      return false;
    });
  }

  /**
   * Calculate pain level summary for workout
   */
  static getPainSummary(workout: WorkoutLogEntry): {
    hasBackPain: boolean;
    hasKneePain: boolean;
    maxBackPain: number;
    maxKneePain: number;
  } {
    let maxBackPain = 0;
    let maxKneePain = 0;
    let hasBackPain = false;
    let hasKneePain = false;

    workout.entries.forEach(entry => {
      if (entry.type === 'strength') {
        const strengthEntry = entry as StrengthEntry;
        strengthEntry.performed_sets.forEach(set => {
          if (set.pain_back_0_to_10) {
            maxBackPain = Math.max(maxBackPain, set.pain_back_0_to_10);
            hasBackPain = true;
          }
          if (set.pain_knee_0_to_10) {
            maxKneePain = Math.max(maxKneePain, set.pain_knee_0_to_10);
            hasKneePain = true;
          }
        });
      }
    });

    return {
      hasBackPain,
      hasKneePain,
      maxBackPain,
      maxKneePain,
    };
  }
}
