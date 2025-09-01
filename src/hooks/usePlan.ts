/**
 * Hook for managing workout plans
 * Following cursor rules for state management and type safety
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { planRepository } from "@/repositories";
import { PlanService } from "@/services/planService";
import type { 
  ProgramPlan, 
  SessionPath, 
  PlanProgress, 
  PlanStats,
  Session,
  ExercisePrescription,
  ExerciseCatalogItem
} from "@/types";

export const usePlan = (planId?: string) => {
  const [plan, setPlan] = useState<ProgramPlan | null>(null);
  const [progress, setProgress] = useState<PlanProgress | null>(null);
  const [stats, setStats] = useState<PlanStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load plan on mount or when planId changes
  useEffect(() => {
    if (planId) {
      loadPlan(planId);
    }
  }, [planId]);

  const loadPlan = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [planData, progressData, statsData] = await Promise.all([
        planRepository.getById(id),
        planRepository.calculateProgress(id),
        planRepository.getStats(id)
      ]);
      
      if (!planData) {
        throw new Error(`Plan with ID ${id} not found`);
      }
      
      setPlan(planData);
      setProgress(progressData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plan");
      console.error("Failed to load plan:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePlan = useCallback(async (updatedPlan: ProgramPlan) => {
    setIsSaving(true);
    setError(null);
    
    try {
      await planRepository.save(updatedPlan);
      setPlan(updatedPlan);
      
      // Refresh progress and stats
      if (updatedPlan.id) {
        const [progressData, statsData] = await Promise.all([
          planRepository.calculateProgress(updatedPlan.id),
          planRepository.getStats(updatedPlan.id)
        ]);
        setProgress(progressData);
        setStats(statsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save plan");
      console.error("Failed to save plan:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updatePlan = useCallback(async (updates: Partial<ProgramPlan>) => {
    if (!plan) {
      throw new Error("No plan loaded");
    }
    
    const updatedPlan = { ...plan, ...updates };
    await savePlan(updatedPlan);
  }, [plan, savePlan]);

  const addPhase = useCallback(async (
    phaseName: "Base" | "Build" | "Peak",
    durationWeeks: number = 4
  ) => {
    if (!plan) {
      throw new Error("No plan loaded");
    }
    
    await PlanService.addPhase(plan.id, phaseName, durationWeeks);
    await loadPlan(plan.id);
  }, [plan, loadPlan]);

  const addWeekToPhase = useCallback(async (phaseIndex: number) => {
    if (!plan) {
      throw new Error("No plan loaded");
    }
    
    await PlanService.addWeekToPhase(plan.id, phaseIndex);
    await loadPlan(plan.id);
  }, [plan, loadPlan]);

  const updateSession = useCallback(async (
    sessionPath: SessionPath,
    updates: Partial<Session>
  ) => {
    if (!plan) {
      throw new Error("No plan loaded");
    }
    
    await planRepository.updateSession(plan.id, sessionPath, updates);
    await loadPlan(plan.id);
  }, [plan, loadPlan]);

  const updateSessionExercises = useCallback(async (
    sessionPath: SessionPath,
    exercises: ExercisePrescription[]
  ) => {
    if (!plan) {
      throw new Error("No plan loaded");
    }
    
    await PlanService.updateSessionExercises(plan.id, sessionPath, exercises);
    await loadPlan(plan.id);
  }, [plan, loadPlan]);

  const addExerciseToSession = useCallback(async (
    sessionPath: SessionPath,
    exerciseId: string,
    exercise: ExerciseCatalogItem
  ) => {
    if (!plan) {
      throw new Error("No plan loaded");
    }
    
    await PlanService.addExerciseToSession(plan.id, sessionPath, exerciseId, exercise);
    await loadPlan(plan.id);
  }, [plan, loadPlan]);

  const removeExerciseFromSession = useCallback(async (
    sessionPath: SessionPath,
    exerciseIndex: number
  ) => {
    if (!plan) {
      throw new Error("No plan loaded");
    }
    
    await PlanService.removeExerciseFromSession(plan.id, sessionPath, exerciseIndex);
    await loadPlan(plan.id);
  }, [plan, loadPlan]);

  const reorderExercises = useCallback(async (
    sessionPath: SessionPath,
    startIndex: number,
    endIndex: number
  ) => {
    if (!plan) {
      throw new Error("No plan loaded");
    }
    
    await PlanService.reorderExercises(plan.id, sessionPath, startIndex, endIndex);
    await loadPlan(plan.id);
  }, [plan, loadPlan]);

  const scheduleSession = useCallback(async (
    sessionPath: SessionPath,
    date: Date
  ) => {
    if (!plan) {
      throw new Error("No plan loaded");
    }
    
    await PlanService.scheduleSession(plan.id, sessionPath, date);
    await loadPlan(plan.id);
  }, [plan, loadPlan]);

  const markSessionCompleted = useCallback(async (
    sessionPath: SessionPath,
    sessionId: string
  ) => {
    if (!plan) {
      throw new Error("No plan loaded");
    }
    
    const now = new Date().toISOString();
    const completedSession = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      completion_date: now,
      session_path: sessionPath,
      plan_id: plan.id,
      created_at: now,
      updated_at: now,
      version: 1,
    };
    
    await planRepository.markSessionCompleted(completedSession);
    await loadPlan(plan.id);
  }, [plan, loadPlan]);

  const duplicatePlan = useCallback(async (newTitle: string): Promise<ProgramPlan> => {
    if (!plan) {
      throw new Error("No plan loaded");
    }
    
    return await PlanService.duplicatePlan(plan.id, newTitle);
  }, [plan]);

  const getSessionByPath = useCallback((sessionPath: SessionPath): Session | null => {
    if (!plan) {
      return null;
    }
    
    return PlanService.getSessionByPath(plan, sessionPath);
  }, [plan]);

  const getAllSessionsWithPaths = useCallback(() => {
    if (!plan) {
      return [];
    }
    
    return PlanService.getAllSessionsWithPaths(plan);
  }, [plan]);

  const getNextSessionDate = useCallback((): Date | null => {
    if (!plan || !progress) {
      return null;
    }
    
    return PlanService.getNextSessionDate(plan, progress.completed_sessions);
  }, [plan, progress]);

  const refreshProgress = useCallback(async () => {
    if (!plan) {
      return;
    }
    
    const [progressData, statsData] = await Promise.all([
      planRepository.calculateProgress(plan.id),
      planRepository.getStats(plan.id)
    ]);
    
    setProgress(progressData);
    setStats(statsData);
  }, [plan]);

  return {
    // State
    plan,
    progress,
    stats,
    isLoading,
    isSaving,
    error,
    
    // Plan management
    loadPlan,
    savePlan,
    updatePlan,
    duplicatePlan,
    
    // Structure management
    addPhase,
    addWeekToPhase,
    
    // Session management
    updateSession,
    updateSessionExercises,
    addExerciseToSession,
    removeExerciseFromSession,
    reorderExercises,
    scheduleSession,
    markSessionCompleted,
    
    // Utilities
    getSessionByPath,
    getAllSessionsWithPaths,
    getNextSessionDate,
    refreshProgress,
  };
};
