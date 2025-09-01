/**
 * Hook for managing active workout sessions
 * Following cursor rules for state management and type safety
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { workoutRepository } from "@/repositories";
import { DateUtils } from "@/utils/dateUtils";
import type { 
  ActiveWorkoutSession,
  WorkoutLogEntry,
  PerformedSet,
  StrengthEntry,
  CardioEntry,
  SessionProgress,
  WorkoutStats,
  Session,
} from "@/types";

export const useWorkoutSession = () => {
  const [activeSession, setActiveSession] = useState<ActiveWorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save active session periodically
  useEffect(() => {
    if (activeSession && activeSession.sessionStatus === 'active') {
      sessionTimerRef.current = setInterval(() => {
        saveSession();
      }, 30000); // Auto-save every 30 seconds

      return () => {
        if (sessionTimerRef.current) {
          clearInterval(sessionTimerRef.current);
        }
      };
    }
    
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [activeSession]);

  const generateId = useCallback(() => {
    return crypto.randomUUID();
  }, []);

  const startSession = useCallback(async (session: Session) => {
    setIsLoading(true);
    setError(null);

    try {
      const now = DateUtils.getCurrentDateTime();
      
      // Create new workout log entry
      const newWorkoutLog: WorkoutLogEntry = {
        id: generateId(),
        date_time_start: now,
        session_plan_ref: session.title,
        session_title: session.title,
        entries: [],
        session_notes: "",
        created_at: now,
        updated_at: now,
        version: 1,
      };

      // Create active session
      const newActiveSession: ActiveWorkoutSession = {
        id: generateId(),
        workoutLog: newWorkoutLog,
        currentExerciseIndex: 0,
        sessionStatus: 'active',
        startTime: now,
        pauseDuration: 0,
        isResting: false,
        restTimeRemaining: 0,
        lastActivity: now,
        created_at: now,
        updated_at: now,
        version: 1,
      };

      setActiveSession(newActiveSession);
      
      // Save initial state
      await workoutRepository.save(newWorkoutLog);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start workout session");
      console.error("Failed to start workout session:", err);
    } finally {
      setIsLoading(false);
    }
  }, [generateId]);

  const saveSession = useCallback(async () => {
    if (!activeSession) return;

    try {
      await workoutRepository.save(activeSession.workoutLog);
      
      // Update last activity
      setActiveSession(prev => prev ? {
        ...prev,
        lastActivity: DateUtils.getCurrentDateTime(),
      } : null);
      
    } catch (err) {
      console.error("Failed to save workout session:", err);
    }
  }, [activeSession]);

  const completeSet = useCallback(async (exerciseIndex: number, set: PerformedSet) => {
    if (!activeSession) return;

    setError(null);

    try {
      const updatedLog = { ...activeSession.workoutLog };
      
      // Ensure entries array exists and has the exercise
      if (!updatedLog.entries[exerciseIndex]) {
        console.error("Exercise index not found:", exerciseIndex);
        return;
      }

      const exerciseEntry = updatedLog.entries[exerciseIndex];
      
      if (exerciseEntry.type === 'strength') {
        const strengthEntry = exerciseEntry as StrengthEntry;
        
        // Add or update the set
        const existingSetIndex = strengthEntry.performed_sets.findIndex(
          s => s.set_number === set.set_number
        );
        
        if (existingSetIndex >= 0) {
          strengthEntry.performed_sets[existingSetIndex] = set;
        } else {
          strengthEntry.performed_sets.push(set);
        }
        
        // Sort sets by set number
        strengthEntry.performed_sets.sort((a, b) => a.set_number - b.set_number);
      }

      updatedLog.updated_at = DateUtils.getCurrentDateTime();
      updatedLog.version += 1;

      setActiveSession(prev => prev ? {
        ...prev,
        workoutLog: updatedLog,
        lastActivity: DateUtils.getCurrentDateTime(),
      } : null);

      await workoutRepository.save(updatedLog);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save set");
      console.error("Failed to complete set:", err);
    }
  }, [activeSession]);

  const addExerciseEntry = useCallback((exerciseId: string, exerciseName: string, type: 'strength' | 'cardio') => {
    if (!activeSession) return;

    const updatedLog = { ...activeSession.workoutLog };
    const orderIndex = updatedLog.entries.length;

    if (type === 'strength') {
      const strengthEntry: StrengthEntry = {
        type: 'strength',
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        order_index: orderIndex,
        performed_sets: [],
      };
      updatedLog.entries.push(strengthEntry);
    } else if (type === 'cardio') {
      const cardioEntry: CardioEntry = {
        type: 'cardio',
        mode: exerciseName,
        total_duration_seconds: 0,
        segments: [],
      };
      updatedLog.entries.push(cardioEntry);
    }

    updatedLog.updated_at = DateUtils.getCurrentDateTime();
    updatedLog.version += 1;

    setActiveSession(prev => prev ? {
      ...prev,
      workoutLog: updatedLog,
    } : null);
  }, [activeSession]);

  const completeExercise = useCallback(async (exerciseIndex: number) => {
    if (!activeSession) return;

    // Move to next exercise
    const nextIndex = exerciseIndex + 1;
    const totalExercises = activeSession.workoutLog.entries.length;

    setActiveSession(prev => prev ? {
      ...prev,
      currentExerciseIndex: nextIndex < totalExercises ? nextIndex : exerciseIndex,
      lastActivity: DateUtils.getCurrentDateTime(),
    } : null);

    await saveSession();
  }, [activeSession, saveSession]);

  const completeSession = useCallback(async (sessionNotes?: string, overallRating?: 1 | 2 | 3 | 4 | 5) => {
    if (!activeSession) return;

    setIsLoading(true);
    setError(null);

    try {
      const now = DateUtils.getCurrentDateTime();
      const updatedLog = { ...activeSession.workoutLog };
      
      updatedLog.date_time_end = now;
      updatedLog.session_notes = sessionNotes;
      updatedLog.overall_rating = overallRating;
      updatedLog.updated_at = now;
      updatedLog.version += 1;

      await workoutRepository.save(updatedLog);

      setActiveSession(prev => prev ? {
        ...prev,
        workoutLog: updatedLog,
        sessionStatus: 'completed',
        lastActivity: now,
      } : null);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete session");
      console.error("Failed to complete session:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeSession]);

  const pauseSession = useCallback(() => {
    if (!activeSession || activeSession.sessionStatus !== 'active') return;

    const now = DateUtils.getCurrentDateTime();
    setActiveSession(prev => prev ? {
      ...prev,
      sessionStatus: 'paused',
      pauseTime: now,
      lastActivity: now,
    } : null);
  }, [activeSession]);

  const resumeSession = useCallback(() => {
    if (!activeSession || activeSession.sessionStatus !== 'paused') return;

    const now = DateUtils.getCurrentDateTime();
    const pauseDuration = activeSession.pauseTime 
      ? (new Date(now).getTime() - new Date(activeSession.pauseTime).getTime()) / 1000
      : 0;

    setActiveSession(prev => prev ? {
      ...prev,
      sessionStatus: 'active',
      pauseTime: undefined,
      pauseDuration: prev.pauseDuration + pauseDuration,
      lastActivity: now,
    } : null);
  }, [activeSession]);

  const abandonSession = useCallback(async () => {
    if (!activeSession) return;

    setIsLoading(true);
    setError(null);

    try {
      const now = DateUtils.getCurrentDateTime();
      const updatedLog = { ...activeSession.workoutLog };
      
      updatedLog.date_time_end = now;
      updatedLog.session_notes = (updatedLog.session_notes || "") + " [Session abandoned]";
      updatedLog.updated_at = now;
      updatedLog.version += 1;

      await workoutRepository.save(updatedLog);

      setActiveSession(prev => prev ? {
        ...prev,
        workoutLog: updatedLog,
        sessionStatus: 'abandoned',
        lastActivity: now,
      } : null);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to abandon session");
      console.error("Failed to abandon session:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeSession]);

  const getSessionProgress = useCallback((): SessionProgress => {
    if (!activeSession) {
      return {
        exercisesCompleted: 0,
        totalExercises: 0,
        setsCompleted: 0,
        totalSets: 0,
        elapsedTime: 0,
        estimatedTimeRemaining: 0,
      };
    }

    const entries = activeSession.workoutLog.entries;
    const exercisesCompleted = activeSession.currentExerciseIndex;
    const totalExercises = entries.length;
    
    let setsCompleted = 0;
    let totalSets = 0;
    
    entries.forEach(entry => {
      if (entry.type === 'strength') {
        const strengthEntry = entry as StrengthEntry;
        setsCompleted += strengthEntry.performed_sets.length;
        // Estimate total sets based on typical workout (3 sets per exercise)
        totalSets += 3;
      }
    });

    const startTime = new Date(activeSession.startTime).getTime();
    const currentTime = new Date().getTime();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000) - activeSession.pauseDuration;
    
    // Estimate remaining time (rough calculation)
    const estimatedTimePerExercise = 300; // 5 minutes per exercise
    const remainingExercises = Math.max(0, totalExercises - exercisesCompleted);
    const estimatedTimeRemaining = remainingExercises * estimatedTimePerExercise;

    return {
      exercisesCompleted,
      totalExercises,
      setsCompleted,
      totalSets,
      elapsedTime,
      estimatedTimeRemaining,
    };
  }, [activeSession]);

  const getWorkoutStats = useCallback((): WorkoutStats => {
    if (!activeSession) {
      return {
        totalVolume: 0,
        averageRpe: 0,
        maxWeight: 0,
        totalReps: 0,
        exerciseCount: 0,
        duration: 0,
      };
    }

    const entries = activeSession.workoutLog.entries;
    let totalVolume = 0;
    let totalReps = 0;
    let maxWeight = 0;
    const rpeValues: number[] = [];

    entries.forEach(entry => {
      if (entry.type === 'strength') {
        const strengthEntry = entry as StrengthEntry;
        strengthEntry.performed_sets.forEach(set => {
          const weight = set.weight_value || 0;
          totalVolume += weight * set.repetitions_done;
          totalReps += set.repetitions_done;
          maxWeight = Math.max(maxWeight, weight);
          
          if (set.rpe_score) {
            rpeValues.push(set.rpe_score);
          }
        });
      }
    });

    const averageRpe = rpeValues.length > 0 
      ? rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length 
      : 0;

    const startTime = new Date(activeSession.startTime).getTime();
    const currentTime = new Date().getTime();
    const duration = Math.floor((currentTime - startTime) / 1000) - activeSession.pauseDuration;

    return {
      totalVolume,
      averageRpe,
      maxWeight,
      totalReps,
      exerciseCount: entries.length,
      duration,
    };
  }, [activeSession]);

  const clearSession = useCallback(() => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }
    setActiveSession(null);
    setError(null);
  }, []);

  return {
    // State
    activeSession,
    isLoading,
    error,
    
    // Session management
    startSession,
    completeSession,
    pauseSession,
    resumeSession,
    abandonSession,
    clearSession,
    saveSession,
    
    // Exercise management
    addExerciseEntry,
    completeSet,
    completeExercise,
    
    // Progress tracking
    getSessionProgress,
    getWorkoutStats,
  };
};
