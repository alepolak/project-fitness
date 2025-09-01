"use client";

import { useState, useEffect, useCallback } from 'react';
import { goalsRepository } from '@/repositories';
import { MetricsAnalysisService } from '@/services/metricsAnalysisService';
import type { 
  FitnessGoal, 
  CreateData 
} from '@/types';

export interface UseGoalsReturn {
  // Goals data
  activeGoals: FitnessGoal[];
  completedGoals: FitnessGoal[];
  allGoals: FitnessGoal[];
  
  // Actions
  createGoal: (goal: CreateData<FitnessGoal>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<FitnessGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  pauseGoal: (id: string) => Promise<void>;
  resumeGoal: (id: string) => Promise<void>;
  completeGoal: (id: string) => Promise<void>;
  
  // Progress
  updateGoalProgress: (goalId: string, currentValue: number) => Promise<void>;
  getGoalProgress: (goalId: string) => { current: number; target: number; percentage: number; onTrack: boolean } | null;
  refreshGoalProgress: (goalId: string) => Promise<void>;
  
  // Analytics
  getGoalsNeedingAttention: () => FitnessGoal[];
  getGoalCompletionRate: () => number;
  getGoalsByCategory: (category: FitnessGoal['category']) => FitnessGoal[];
  getOverdueGoals: () => FitnessGoal[];
  getGoalsDueSoon: (days?: number) => FitnessGoal[];
  
  // Templates and suggestions
  getGoalTemplates: () => Array<{
    title: string;
    category: FitnessGoal['category'];
    description: string;
    template: Partial<CreateData<FitnessGoal>>;
  }>;
  
  // State
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for managing fitness goals
 * Following cursor rules for state management and type safety
 */
export const useGoals = (): UseGoalsReturn => {
  // State
  const [allGoals, setAllGoals] = useState<FitnessGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate unique ID
  const generateId = useCallback(() => crypto.randomUUID(), []);

  // Load goals data
  const loadGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const goals = await goalsRepository.getAll();
      setAllGoals(goals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load goals on mount
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Computed values
  const activeGoals = allGoals.filter(goal => goal.status === 'active');
  const completedGoals = allGoals.filter(goal => goal.status === 'completed');

  // Create goal
  const createGoal = useCallback(async (goal: CreateData<FitnessGoal>) => {
    try {
      setError(null);
      
      const newGoal: FitnessGoal = {
        ...goal,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1
      };

      await goalsRepository.save(newGoal);
      setAllGoals(prev => [newGoal, ...prev]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
      throw err;
    }
  }, [generateId]);

  // Update goal
  const updateGoal = useCallback(async (id: string, updates: Partial<FitnessGoal>) => {
    try {
      setError(null);
      
      const existing = await goalsRepository.getById(id);
      if (!existing) {
        throw new Error('Goal not found');
      }

      const updated = await goalsRepository.update(id, updates);
      setAllGoals(prev => prev.map(goal => goal.id === id ? updated : goal));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      throw err;
    }
  }, []);

  // Delete goal
  const deleteGoal = useCallback(async (id: string) => {
    try {
      setError(null);
      
      await goalsRepository.delete(id);
      setAllGoals(prev => prev.filter(goal => goal.id !== id));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
      throw err;
    }
  }, []);

  // Pause goal
  const pauseGoal = useCallback(async (id: string) => {
    await updateGoal(id, { status: 'paused' });
  }, [updateGoal]);

  // Resume goal
  const resumeGoal = useCallback(async (id: string) => {
    await updateGoal(id, { status: 'active' });
  }, [updateGoal]);

  // Complete goal
  const completeGoal = useCallback(async (id: string) => {
    await updateGoal(id, { 
      status: 'completed', 
      completion_percentage: 100 
    });
  }, [updateGoal]);

  // Update goal progress
  const updateGoalProgress = useCallback(async (goalId: string, currentValue: number) => {
    try {
      setError(null);
      
      const goal = allGoals.find(g => g.id === goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }

      const progress = MetricsAnalysisService.calculateGoalProgress(goal, currentValue);
      
      await updateGoal(goalId, {
        current_value: currentValue,
        completion_percentage: progress.percentage,
        status: progress.percentage >= 100 ? 'completed' : goal.status
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal progress');
      throw err;
    }
  }, [allGoals, updateGoal]);

  // Get goal progress
  const getGoalProgress = useCallback((goalId: string) => {
    const goal = allGoals.find(g => g.id === goalId);
    if (!goal || !goal.current_value || !goal.target_value) {
      return null;
    }

    return MetricsAnalysisService.calculateGoalProgress(goal, goal.current_value);
  }, [allGoals]);

  // Refresh goal progress (fetch latest metrics and update)
  const refreshGoalProgress = useCallback(async (goalId: string) => {
    try {
      const goal = allGoals.find(g => g.id === goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }

      // This would typically fetch the latest value for the tracked metric
      // For now, we'll just recalculate with existing data
      if (goal.current_value) {
        await updateGoalProgress(goalId, goal.current_value);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh goal progress');
    }
  }, [allGoals, updateGoalProgress]);

  // Get goals needing attention
  const getGoalsNeedingAttention = useCallback((): FitnessGoal[] => {
    const today = new Date();
    
    return activeGoals.filter(goal => {
      // Overdue goals
      if (new Date(goal.target_date) < today && goal.completion_percentage < 100) {
        return true;
      }

      // Behind schedule goals
      const startDate = new Date(goal.start_date);
      const targetDate = new Date(goal.target_date);
      const totalDays = (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const elapsedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      
      const expectedProgress = (elapsedDays / totalDays) * 100;
      const actualProgress = goal.completion_percentage;
      
      return actualProgress < expectedProgress * 0.7; // More than 30% behind
    });
  }, [activeGoals]);

  // Get goal completion rate
  const getGoalCompletionRate = useCallback((): number => {
    if (allGoals.length === 0) return 0;
    return Math.round((completedGoals.length / allGoals.length) * 100);
  }, [allGoals, completedGoals]);

  // Get goals by category
  const getGoalsByCategory = useCallback((category: FitnessGoal['category']): FitnessGoal[] => {
    return allGoals.filter(goal => goal.category === category);
  }, [allGoals]);

  // Get overdue goals
  const getOverdueGoals = useCallback((): FitnessGoal[] => {
    const today = new Date();
    return activeGoals.filter(goal => new Date(goal.target_date) < today);
  }, [activeGoals]);

  // Get goals due soon
  const getGoalsDueSoon = useCallback((days: number = 7): FitnessGoal[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return activeGoals.filter(goal => {
      const targetDate = new Date(goal.target_date);
      return targetDate <= cutoffDate && targetDate >= new Date();
    });
  }, [activeGoals]);

  // Get goal templates
  const getGoalTemplates = useCallback(() => {
    return [
      {
        title: "Lose Weight",
        category: "weight" as const,
        description: "Set a target weight to reach within a specific timeframe",
        template: {
          goal_type: "target_value" as const,
          metric_to_track: "body_weight",
          measurement_frequency: "weekly" as const,
          target_unit: "lb"
        }
      },
      {
        title: "Gain Muscle",
        category: "body_composition" as const,
        description: "Increase muscle mass percentage or lean body mass",
        template: {
          goal_type: "increase_by" as const,
          metric_to_track: "body_muscle_percent",
          measurement_frequency: "monthly" as const,
          target_unit: "%"
        }
      },
      {
        title: "Improve Bench Press",
        category: "strength" as const,
        description: "Increase your bench press 1RM",
        template: {
          goal_type: "target_value" as const,
          metric_to_track: "bench_press_1rm_lb",
          measurement_frequency: "monthly" as const,
          target_unit: "lb"
        }
      },
      {
        title: "Run 5K Faster",
        category: "cardio" as const,
        description: "Improve your 5K running time",
        template: {
          goal_type: "decrease_by" as const,
          metric_to_track: "5k_time_minutes",
          measurement_frequency: "weekly" as const,
          target_unit: "minutes"
        }
      },
      {
        title: "Reduce Body Fat",
        category: "body_composition" as const,
        description: "Lower body fat percentage to a healthier level",
        template: {
          goal_type: "target_value" as const,
          metric_to_track: "body_fat_percent",
          measurement_frequency: "monthly" as const,
          target_unit: "%"
        }
      }
    ];
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadGoals();
  }, [loadGoals]);

  return {
    // Goals data
    activeGoals,
    completedGoals,
    allGoals,
    
    // Actions
    createGoal,
    updateGoal,
    deleteGoal,
    pauseGoal,
    resumeGoal,
    completeGoal,
    
    // Progress
    updateGoalProgress,
    getGoalProgress,
    refreshGoalProgress,
    
    // Analytics
    getGoalsNeedingAttention,
    getGoalCompletionRate,
    getGoalsByCategory,
    getOverdueGoals,
    getGoalsDueSoon,
    
    // Templates and suggestions
    getGoalTemplates,
    
    // State
    isLoading,
    error,
    refreshData
  };
};
