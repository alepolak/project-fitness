"use client";

import { useState, useEffect, useCallback } from 'react';
import { baselineRepository } from '@/repositories';
import { FitnessStandardsService } from '@/services/fitnessStandardsService';
import { DateUtils } from '@/utils/dateUtils';
import type { 
  BaselineTestEntry, 
  FitnessLevel, 
  ImprovementStats,
  TestReminder
} from '@/types';

export interface UseBaselineTestingReturn {
  // Current month data
  currentMonthBaseline: BaselineTestEntry | null;
  isCurrentMonthComplete: boolean;
  
  // Testing
  activeTest: string | null;
  startTest: (testType: string) => void;
  stopTest: () => void;
  saveTestResults: (results: Partial<BaselineTestEntry>) => Promise<void>;
  
  // Progress tracking
  getStrengthProgress: (exercise: "bench_press" | "squat" | "deadlift" | "overhead_press") => Promise<Array<{ month: string; value: number }>>;
  getCardioProgress: (testType: "rockport" | "twelve_minute" | "continuous_jog" | "heart_rate_recovery") => Promise<Array<{ month: string; value: number; unit?: string }>>;
  
  // Analysis
  getFitnessLevel: (category: 'strength' | 'cardio', exercise?: string) => Promise<FitnessLevel | null>;
  getImprovementStats: (testType: string, months?: number) => Promise<ImprovementStats | null>;
  getComprehensiveFitnessLevel: (bodyWeight: number, age: number, gender: "male" | "female") => Promise<{
    overall: FitnessLevel;
    strength: Record<string, FitnessLevel>;
    cardio: Record<string, { level: string; fitnessAge: number; percentile: number }>;
  } | null>;
  
  // Scheduling
  getNextTestDate: () => Promise<string>;
  getTestReminders: () => Promise<TestReminder[]>;
  isTestOverdue: () => Promise<boolean>;
  
  // State
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for managing baseline testing
 * Following cursor rules for state management and type safety
 */
export const useBaselineTesting = (): UseBaselineTestingReturn => {
  // State
  const [currentMonthBaseline, setCurrentMonthBaseline] = useState<BaselineTestEntry | null>(null);
  const [isCurrentMonthComplete, setIsCurrentMonthComplete] = useState(false);
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate unique ID
  const generateId = useCallback(() => crypto.randomUUID(), []);

  // Load current month data
  const loadCurrentMonthData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentBaseline = await baselineRepository.getCurrentMonth();
      setCurrentMonthBaseline(currentBaseline);
      
      // Check if current month testing is complete
      if (currentBaseline) {
        const hasCardio = !!(currentBaseline.rockport_time_mm_ss || currentBaseline.twelve_minute_distance);
        const hasStrength = !!(currentBaseline.bench_press_1rm_lb || currentBaseline.squat_1rm_lb || 
                              currentBaseline.deadlift_1rm_lb || currentBaseline.overhead_press_1rm_lb);
        setIsCurrentMonthComplete(hasCardio && hasStrength);
      } else {
        setIsCurrentMonthComplete(false);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load baseline data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadCurrentMonthData();
  }, [loadCurrentMonthData]);

  // Start test
  const startTest = useCallback((testType: string) => {
    setActiveTest(testType);
    setError(null);
  }, []);

  // Stop test
  const stopTest = useCallback(() => {
    setActiveTest(null);
  }, []);

  // Save test results
  const saveTestResults = useCallback(async (results: Partial<BaselineTestEntry>) => {
    try {
      setError(null);
      
      const currentMonth = DateUtils.getMonthKey(DateUtils.getCurrentDate());
      let baseline = currentMonthBaseline;

      if (!baseline) {
        // Create new baseline entry for current month
        baseline = {
          id: generateId(),
          month: currentMonth,
          test_date: DateUtils.getCurrentDate(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
          ...results
        };
        
        await baselineRepository.save(baseline);
      } else {
        // Update existing baseline
        baseline = await baselineRepository.update(baseline.id, results);
      }

      setCurrentMonthBaseline(baseline);
      setActiveTest(null);
      
      // Re-check completion status
      await loadCurrentMonthData();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save test results');
      throw err;
    }
  }, [currentMonthBaseline, generateId, loadCurrentMonthData]);

  // Get strength progress
  const getStrengthProgress = useCallback(async (
    exercise: "bench_press" | "squat" | "deadlift" | "overhead_press"
  ) => {
    try {
      return await baselineRepository.getStrengthProgression(exercise);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get strength progress');
      return [];
    }
  }, []);

  // Get cardio progress
  const getCardioProgress = useCallback(async (
    testType: "rockport" | "twelve_minute" | "continuous_jog" | "heart_rate_recovery"
  ) => {
    try {
      return await baselineRepository.getCardioProgression(testType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get cardio progress');
      return [];
    }
  }, []);

  // Get fitness level
  const getFitnessLevel = useCallback(async (
    category: 'strength' | 'cardio',
    exercise?: string
  ): Promise<FitnessLevel | null> => {
    try {
      if (!currentMonthBaseline) return null;

      if (category === 'strength' && exercise) {
        // Need body weight for strength calculations
        // This would typically come from latest body metrics
        // For now, return null if we don't have the required data
        return null;
      }

      if (category === 'cardio') {
        // Cardio fitness levels can be calculated if we have test results
        // Implementation would depend on which test we're evaluating
        return null;
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate fitness level');
      return null;
    }
  }, [currentMonthBaseline]);

  // Get improvement stats
  const getImprovementStats = useCallback(async (
    testType: string,
    months: number = 6
  ): Promise<ImprovementStats | null> => {
    try {
      return await baselineRepository.getImprovementStats(testType, months);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get improvement stats');
      return null;
    }
  }, []);

  // Get comprehensive fitness level
  const getComprehensiveFitnessLevel = useCallback(async (
    bodyWeight: number,
    age: number,
    gender: "male" | "female"
  ) => {
    try {
      if (!currentMonthBaseline) return null;

      return FitnessStandardsService.getComprehensiveFitnessLevel(
        currentMonthBaseline,
        bodyWeight,
        age,
        gender
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get comprehensive fitness level');
      return null;
    }
  }, [currentMonthBaseline]);

  // Get next test date
  const getNextTestDate = useCallback(async (): Promise<string> => {
    try {
      return await baselineRepository.getNextTestDate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get next test date');
      return DateUtils.getCurrentDate();
    }
  }, []);

  // Get test reminders
  const getTestReminders = useCallback(async (): Promise<TestReminder[]> => {
    try {
      const reminders: TestReminder[] = [];
      const today = new Date();
      const nextTestDate = await getNextTestDate();
      const nextTest = new Date(nextTestDate);
      
      // Check if baseline testing is overdue
      if (nextTest < today) {
        const daysOverdue = Math.floor((today.getTime() - nextTest.getTime()) / (1000 * 60 * 60 * 24));
        
        reminders.push({
          testType: 'monthly_baseline',
          testName: 'Monthly Baseline Testing',
          dueDate: nextTestDate,
          overdue: true,
          importance: daysOverdue > 7 ? 'high' : 'medium',
          estimatedDuration: '45-60 minutes'
        });
      } else {
        // Check if test is due soon (within 3 days)
        const daysTilDue = Math.floor((nextTest.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysTilDue <= 3) {
          reminders.push({
            testType: 'monthly_baseline',
            testName: 'Monthly Baseline Testing',
            dueDate: nextTestDate,
            overdue: false,
            importance: daysTilDue === 0 ? 'high' : 'medium',
            estimatedDuration: '45-60 minutes'
          });
        }
      }

      return reminders;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get test reminders');
      return [];
    }
  }, [getNextTestDate]);

  // Check if test is overdue
  const isTestOverdue = useCallback(async (): Promise<boolean> => {
    try {
      const nextTestDate = await getNextTestDate();
      const today = new Date();
      const nextTest = new Date(nextTestDate);
      
      return nextTest < today;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check if test is overdue');
      return false;
    }
  }, [getNextTestDate]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadCurrentMonthData();
  }, [loadCurrentMonthData]);

  return {
    // Current month data
    currentMonthBaseline,
    isCurrentMonthComplete,
    
    // Testing
    activeTest,
    startTest,
    stopTest,
    saveTestResults,
    
    // Progress tracking
    getStrengthProgress,
    getCardioProgress,
    
    // Analysis
    getFitnessLevel,
    getImprovementStats,
    getComprehensiveFitnessLevel,
    
    // Scheduling
    getNextTestDate,
    getTestReminders,
    isTestOverdue,
    
    // State
    isLoading,
    error,
    refreshData
  };
};
