"use client";


import { storageService } from './storage';
import type { 
  WorkoutLogEntry, 
  PerformedSet, 
  CardioSegment, 
  WorkoutSummary,
  ActiveWorkoutSession,
  SessionProgress,
  WorkoutStats,
  WorkoutNotification,
  Session,
  StrengthEntry,
  CardioEntry
} from '@/types';

import { WorkoutAnalysis } from '@/utils/workoutAnalysis';

/**
 * Service for managing workout logging and session business logic
 */
export class WorkoutService {
  private static readonly STORAGE_KEY = 'workout-logs';

  /**
   * Start a new workout session from a session plan
   */
  static async startWorkoutSession(
    sessionPlan: Session
  ): Promise<ActiveWorkoutSession> {
    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create initial workout log entry
    const workoutLog: WorkoutLogEntry = {
      id: sessionId,
      date_time_start: now,
      session_plan_ref: sessionPlan.id,
      entries: [],
      session_notes: '',
      created_at: now,
      updated_at: now,
      version: 1
    };

    // Create active session
    const activeSession: ActiveWorkoutSession = {
      id: sessionId,
      workoutLog,
      currentExerciseIndex: 0,
      sessionStatus: 'not-started',
      startTime: now,
      pauseDuration: 0,
      isResting: false,
      restTimeRemaining: 0,
      lastActivity: now,
      created_at: now,
      updated_at: now,
      version: 1
    };

    // Save active session to storage
    await storageService.save('active-sessions', activeSession);

    return activeSession;
  }

  /**
   * Start the actual workout execution
   */
  static async startExecution(sessionId: string): Promise<ActiveWorkoutSession> {
    const activeSession = await this.getActiveSession(sessionId);
    if (!activeSession) {
      throw new Error('Active session not found');
    }

    const updatedSession: ActiveWorkoutSession = {
      ...activeSession,
      sessionStatus: 'active',
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    await this.updateActiveSession(updatedSession);
    return updatedSession;
  }

  /**
   * Log a completed set for strength exercises
   */
  static async logStrengthSet(
    sessionId: string,
    exerciseId: string,
    set: PerformedSet
  ): Promise<ActiveWorkoutSession> {
    const activeSession = await this.getActiveSession(sessionId);
    if (!activeSession) {
      throw new Error('Active session not found');
    }

    // Find or create exercise entry
    let exerciseEntry = activeSession.workoutLog.entries.find(
      entry => entry.type === 'strength' && entry.exercise_id === exerciseId
    ) as StrengthEntry | undefined;

    if (!exerciseEntry) {
      exerciseEntry = {
        type: 'strength',
        exercise_id: exerciseId,
        exercise_name: '', // Will be populated from catalog
        order_index: activeSession.workoutLog.entries.length,
        performed_sets: []
      };
      activeSession.workoutLog.entries.push(exerciseEntry);
    }

    if (exerciseEntry.type === 'strength') {
      exerciseEntry.performed_sets.push(set);
    }

    // Update session
    const updatedSession: ActiveWorkoutSession = {
      ...activeSession,
      workoutLog: {
        ...activeSession.workoutLog,
        updated_at: new Date().toISOString()
      },
      lastActivity: new Date().toISOString()
    };

    await this.updateActiveSession(updatedSession);
    return updatedSession;
  }

  /**
   * Log cardio segment
   */
  static async logCardioSegment(
    sessionId: string,
    exerciseId: string,
    segment: CardioSegment
  ): Promise<ActiveWorkoutSession> {
    const activeSession = await this.getActiveSession(sessionId);
    if (!activeSession) {
      throw new Error('Active session not found');
    }

    // Find or create exercise entry
    let exerciseEntry = activeSession.workoutLog.entries.find(
      entry => entry.type === 'cardio' && entry.mode === exerciseId
    ) as CardioEntry | undefined;

    if (!exerciseEntry) {
      exerciseEntry = {
        type: 'cardio',
        mode: exerciseId,
        total_duration_seconds: 0,
        segments: []
      };
      activeSession.workoutLog.entries.push(exerciseEntry);
    }

    if (exerciseEntry.type === 'cardio') {
      exerciseEntry.segments.push(segment);
      
      // Recalculate totals
      exerciseEntry.total_duration_seconds = exerciseEntry.segments.reduce(
        (total, seg) => total + seg.duration_seconds, 0
      );
      
      const heartRates = exerciseEntry.segments
        .filter(seg => seg.average_heart_rate_bpm)
        .map(seg => seg.average_heart_rate_bpm!);
      
      if (heartRates.length > 0) {
        exerciseEntry.average_heart_rate_bpm = heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length;
      }
    }

    // Update session
    const updatedSession: ActiveWorkoutSession = {
      ...activeSession,
      workoutLog: {
        ...activeSession.workoutLog,
        updated_at: new Date().toISOString()
      },
      lastActivity: new Date().toISOString()
    };

    await this.updateActiveSession(updatedSession);
    return updatedSession;
  }

  /**
   * Complete current exercise and move to next
   */
  static async completeExercise(
    sessionId: string,
    exerciseNotes?: string
  ): Promise<ActiveWorkoutSession> {
    const activeSession = await this.getActiveSession(sessionId);
    if (!activeSession) {
      throw new Error('Active session not found');
    }

    // Add notes to current exercise if provided
    if (exerciseNotes && activeSession.workoutLog.entries.length > 0) {
      const currentEntry = activeSession.workoutLog.entries[activeSession.currentExerciseIndex];
      if (currentEntry) {
        currentEntry.notes = exerciseNotes;
      }
    }

    // Move to next exercise
    const updatedSession: ActiveWorkoutSession = {
      ...activeSession,
      currentExerciseIndex: activeSession.currentExerciseIndex + 1,
      workoutLog: {
        ...activeSession.workoutLog,
        updated_at: new Date().toISOString()
      },
      lastActivity: new Date().toISOString()
    };

    await this.updateActiveSession(updatedSession);
    return updatedSession;
  }

  /**
   * Pause the workout session
   */
  static async pauseSession(sessionId: string): Promise<ActiveWorkoutSession> {
    const activeSession = await this.getActiveSession(sessionId);
    if (!activeSession) {
      throw new Error('Active session not found');
    }

    const updatedSession: ActiveWorkoutSession = {
      ...activeSession,
      sessionStatus: 'paused',
      pauseTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    await this.updateActiveSession(updatedSession);
    return updatedSession;
  }

  /**
   * Resume the workout session
   */
  static async resumeSession(sessionId: string): Promise<ActiveWorkoutSession> {
    const activeSession = await this.getActiveSession(sessionId);
    if (!activeSession) {
      throw new Error('Active session not found');
    }

    if (!activeSession.pauseTime) {
      return activeSession; // Not paused
    }

    // Calculate pause duration
    const pauseDuration = Date.now() - new Date(activeSession.pauseTime).getTime();
    
    const updatedSession: ActiveWorkoutSession = {
      ...activeSession,
      sessionStatus: 'active',
      pauseTime: undefined,
      pauseDuration: activeSession.pauseDuration + Math.floor(pauseDuration / 1000),
      lastActivity: new Date().toISOString()
    };

    await this.updateActiveSession(updatedSession);
    return updatedSession;
  }

  /**
   * Complete the entire workout session
   */
  static async completeSession(
    sessionId: string,
    sessionNotes?: string,
    sessionRating?: number
  ): Promise<WorkoutLogEntry> {
    const activeSession = await this.getActiveSession(sessionId);
    if (!activeSession) {
      throw new Error('Active session not found');
    }

    const now = new Date().toISOString();

    // Finalize workout log
    const completedWorkout: WorkoutLogEntry = {
      ...activeSession.workoutLog,
      session_notes: sessionNotes || activeSession.workoutLog.session_notes,
      overall_rating: sessionRating as 1 | 2 | 3 | 4 | 5 | undefined,
      updated_at: now
    };

    // Save to workout logs
    await storageService.save(this.STORAGE_KEY, completedWorkout);

    // Update active session status
    const updatedSession: ActiveWorkoutSession = {
      ...activeSession,
      sessionStatus: 'completed',
      workoutLog: completedWorkout,
      lastActivity: now
    };

    await this.updateActiveSession(updatedSession);

    return completedWorkout;
  }

  /**
   * Abandon the workout session
   */
  static async abandonSession(sessionId: string): Promise<void> {
    const activeSession = await this.getActiveSession(sessionId);
    if (!activeSession) {
      return; // Already removed
    }

    // Update session status
    const updatedSession: ActiveWorkoutSession = {
      ...activeSession,
      sessionStatus: 'abandoned',
      lastActivity: new Date().toISOString()
    };

    await this.updateActiveSession(updatedSession);
  }

  /**
   * Get active session by ID
   */
  static async getActiveSession(sessionId: string): Promise<ActiveWorkoutSession | null> {
    try {
      return await storageService.get('active-sessions', sessionId);
    } catch {
      return null;
    }
  }

  /**
   * Update active session
   */
  static async updateActiveSession(session: ActiveWorkoutSession): Promise<void> {
    await storageService.save('active-sessions', session);
  }

  /**
   * Get all workout logs with optional filtering
   */
  static async getWorkoutLogs(filters?: {
    exerciseId?: string;
    dateRange?: { start: Date; end: Date };
    limit?: number;
  }): Promise<WorkoutLogEntry[]> {
    try {
      const allLogs = await storageService.getAll<WorkoutLogEntry>(this.STORAGE_KEY);
      let filteredLogs = allLogs;

      // Apply filters
      if (filters?.exerciseId) {
        filteredLogs = filteredLogs.filter(log =>
          log.entries.some(entry => entry.type === 'strength' && entry.exercise_id === filters.exerciseId)
        );
      }

      if (filters?.dateRange) {
        filteredLogs = filteredLogs.filter(log => {
          const logDate = new Date(log.date_time_start);
          return logDate >= filters.dateRange!.start && logDate <= filters.dateRange!.end;
        });
      }

      // Sort by date (newest first)
      filteredLogs.sort((a, b) => 
        new Date(b.date_time_start).getTime() - new Date(a.date_time_start).getTime()
      );

      // Apply limit
      if (filters?.limit) {
        filteredLogs = filteredLogs.slice(0, filters.limit);
      }

      return filteredLogs;
    } catch (error) {
      console.error('Error loading workout logs:', error);
      return [];
    }
  }

  /**
   * Get workout log by ID
   */
  static async getWorkoutLog(logId: string): Promise<WorkoutLogEntry | null> {
    try {
      return await storageService.get(this.STORAGE_KEY, logId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculate session progress
   */
  static calculateSessionProgress(
    activeSession: ActiveWorkoutSession,
    sessionPlan: Session
  ): SessionProgress {
    const exercisesCompleted = activeSession.currentExerciseIndex;
    const totalExercises = sessionPlan.exercises.length;
    
    // Count total sets completed and planned
    let setsCompleted = 0;
    let totalSets = 0;

    sessionPlan.exercises.forEach((exercise, index) => {
      if (exercise.sets) {
        totalSets += exercise.sets.length;
        
        if (index < activeSession.currentExerciseIndex) {
          // Exercise completed - count all sets
          setsCompleted += exercise.sets.length;
        } else if (index === activeSession.currentExerciseIndex) {
          // Current exercise - count completed sets
          const entry = activeSession.workoutLog.entries.find(
            e => e.type === 'strength' && e.exercise_id === exercise.exercise_id
          );
          if (entry && entry.type === 'strength') {
            setsCompleted += entry.performed_sets.length;
          }
        }
      }
    });

    // Calculate elapsed time
    const startTime = new Date(activeSession.startTime).getTime();
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000) - activeSession.pauseDuration;

    // Estimate remaining time (rough calculation)
    const avgTimePerSet = 120; // 2 minutes per set
    const remainingSets = totalSets - setsCompleted;
    const estimatedTimeRemaining = remainingSets * avgTimePerSet;

    return {
      exercisesCompleted,
      totalExercises,
      setsCompleted,
      totalSets,
      elapsedTime,
      estimatedTimeRemaining
    };
  }

  /**
   * Calculate workout statistics
   */
  static calculateWorkoutStats(workout: WorkoutLogEntry): WorkoutStats {
    return WorkoutAnalysis.generateWorkoutStats(workout);
  }

  /**
   * Generate workout summary
   */
  static generateWorkoutSummary(workouts: WorkoutLogEntry[]): WorkoutSummary {
    const exercisesPerformed = new Set<string>();
    let totalDuration = 0;
    let totalVolumeLib = 0;
    let totalDistanceMiles = 0;
    let totalRating = 0;
    let ratingsCount = 0;
    const exerciseFrequency = new Map<string, number>();

    workouts.forEach(workout => {
      totalDuration += WorkoutAnalysis.calculateWorkoutDuration(workout);
      
      workout.entries.forEach(entry => {
        if (entry.type === 'strength') {
          exercisesPerformed.add(entry.exercise_id);
          exerciseFrequency.set(entry.exercise_id, (exerciseFrequency.get(entry.exercise_id) || 0) + 1);
          totalVolumeLib += WorkoutAnalysis.calculateVolume(entry.performed_sets);
        } else if (entry.type === 'cardio') {
          exercisesPerformed.add(entry.mode);
          exerciseFrequency.set(entry.mode, (exerciseFrequency.get(entry.mode) || 0) + 1);
          
          entry.segments.forEach(segment => {
            if (segment.distance_value) {
              if (segment.distance_unit === 'miles') {
                totalDistanceMiles += segment.distance_value;
              } else if (segment.distance_unit === 'kilometers') {
                totalDistanceMiles += segment.distance_value * 0.621371;
              }
            }
          });
        }
      });
      
      if (workout.overall_rating) {
        totalRating += workout.overall_rating;
        ratingsCount++;
      }
    });

    const mostFrequent = Array.from(exerciseFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([exercise_id, count]) => ({ exercise_id, count }));

    return {
      total_workouts: workouts.length,
      total_duration_minutes: Math.round(totalDuration / 60),
      exercises_performed: Array.from(exercisesPerformed),
      strength_volume_lb: Math.round(totalVolumeLib),
      cardio_distance_miles: Math.round(totalDistanceMiles * 100) / 100,
      average_workout_rating: ratingsCount > 0 ? Math.round((totalRating / ratingsCount) * 10) / 10 : 0,
      most_frequent_exercises: mostFrequent
    };
  }

  /**
   * Create workout notification
   */
  static createNotification(
    type: WorkoutNotification['type'],
    title: string,
    message: string,
    exerciseId?: string,
    setNumber?: number
  ): WorkoutNotification {
    return {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      exerciseId,
      setNumber
    };
  }

  /**
   * Validate workout session data
   */
  static validateSession(session: ActiveWorkoutSession): string[] {
    const errors: string[] = [];

    if (!session.id) {
      errors.push('Session ID is required');
    }

    if (!session.workoutLog) {
      errors.push('Workout log is required');
    }

    if (session.currentExerciseIndex < 0) {
      errors.push('Current exercise index cannot be negative');
    }

    if (!session.startTime) {
      errors.push('Start time is required');
    }

    if (session.pauseDuration < 0) {
      errors.push('Pause duration cannot be negative');
    }

    if (session.restTimeRemaining < 0) {
      errors.push('Rest time remaining cannot be negative');
    }

    return errors;
  }

  /**
   * Clean up old active sessions (for maintenance)
   */
  static async cleanupOldSessions(olderThanDays: number = 7): Promise<number> {
    try {
      const allSessions = await storageService.getAll<ActiveWorkoutSession>('active-sessions');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      let cleanedCount = 0;
      for (const session of allSessions) {
        const lastActivity = new Date(session.lastActivity);
        if (lastActivity < cutoffDate) {
          await storageService.delete('active-sessions', session.id);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
      return 0;
    }
  }
}
