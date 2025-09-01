/**
 * Goals repository for managing fitness goals
 * Following cursor rules for repository pattern
 */

import { BaseRepository } from "./base";
import { ValidationService } from "@/validators";
import { DateUtils } from "@/utils/dateUtils";
import type { FitnessGoal } from "@/types";

export class GoalsRepository extends BaseRepository<FitnessGoal> {
  constructor() {
    super("goals", ValidationService.validateGoal);
  }

  /**
   * Get active goals
   */
  async getActiveGoals(): Promise<FitnessGoal[]> {
    const allGoals = await this.getAll();
    return allGoals.filter(goal => goal.status === 'active');
  }

  /**
   * Get completed goals
   */
  async getCompletedGoals(): Promise<FitnessGoal[]> {
    const allGoals = await this.getAll();
    return allGoals.filter(goal => goal.status === 'completed');
  }

  /**
   * Get goals by category
   */
  async getGoalsByCategory(
    category: "weight" | "strength" | "cardio" | "body_composition" | "custom"
  ): Promise<FitnessGoal[]> {
    return this.query({ category });
  }

  /**
   * Get goals due soon (within specified days)
   */
  async getGoalsDueSoon(days: number = 30): Promise<FitnessGoal[]> {
    const cutoffDate = DateUtils.addDays(DateUtils.getCurrentDate(), days);
    const allGoals = await this.getActiveGoals();
    
    return allGoals.filter(goal => {
      const targetDate = new Date(goal.target_date);
      return targetDate <= new Date(cutoffDate);
    });
  }

  /**
   * Get overdue goals
   */
  async getOverdueGoals(): Promise<FitnessGoal[]> {
    const today = DateUtils.getCurrentDate();
    const allGoals = await this.getActiveGoals();
    
    return allGoals.filter(goal => {
      return goal.target_date < today && goal.completion_percentage < 100;
    });
  }

  /**
   * Get goals needing attention (overdue or significantly behind schedule)
   */
  async getGoalsNeedingAttention(): Promise<FitnessGoal[]> {
    const today = new Date();
    const allGoals = await this.getActiveGoals();
    
    return allGoals.filter(goal => {
      const startDate = new Date(goal.start_date);
      const targetDate = new Date(goal.target_date);
      const totalDays = (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const elapsedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      
      const expectedProgress = (elapsedDays / totalDays) * 100;
      const actualProgress = goal.completion_percentage;
      
      // Goal needs attention if significantly behind schedule or overdue
      return actualProgress < expectedProgress * 0.7 || goal.target_date < DateUtils.getCurrentDate();
    });
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(goalId: string, newProgress: number): Promise<void> {
    const goal = await this.getById(goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    await this.update(goalId, {
      completion_percentage: Math.max(0, Math.min(100, newProgress)),
      status: newProgress >= 100 ? 'completed' : goal.status
    });
  }

  /**
   * Get goal completion rate (percentage of goals completed)
   */
  async getGoalCompletionRate(): Promise<number> {
    const allGoals = await this.getAll();
    
    if (allGoals.length === 0) return 0;
    
    const completedGoals = allGoals.filter(goal => goal.status === 'completed');
    return Math.round((completedGoals.length / allGoals.length) * 100);
  }

  /**
   * Get goals by tracking metric
   */
  async getGoalsByMetric(metric: string): Promise<FitnessGoal[]> {
    return this.query({ metric_to_track: metric });
  }

  /**
   * Archive old completed goals (older than specified months)
   */
  async archiveOldGoals(monthsOld: number = 12): Promise<number> {
    const cutoffDate = DateUtils.addDays(DateUtils.getCurrentDate(), -monthsOld * 30);
    const completedGoals = await this.getCompletedGoals();
    
    const goalsToArchive = completedGoals.filter(goal => {
      return new Date(goal.target_date) < new Date(cutoffDate);
    });

    for (const goal of goalsToArchive) {
      await this.delete(goal.id);
    }

    return goalsToArchive.length;
  }

  /**
   * Get goal statistics
   */
  async getGoalStatistics(): Promise<{
    total: number;
    active: number;
    completed: number;
    overdue: number;
    completionRate: number;
    averageDaysToComplete: number;
    mostCommonCategory: string;
  }> {
    const allGoals = await this.getAll();
    const activeGoals = allGoals.filter(g => g.status === 'active');
    const completedGoals = allGoals.filter(g => g.status === 'completed');
    const overdueGoals = await this.getOverdueGoals();

    // Calculate average days to complete
    let totalDaysToComplete = 0;
    let completedWithDates = 0;

    completedGoals.forEach(goal => {
      const startDate = new Date(goal.start_date);
      const targetDate = new Date(goal.target_date);
      const daysToComplete = (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysToComplete > 0) {
        totalDaysToComplete += daysToComplete;
        completedWithDates++;
      }
    });

    const averageDaysToComplete = completedWithDates > 0 
      ? Math.round(totalDaysToComplete / completedWithDates)
      : 0;

    // Find most common category
    const categoryCounts = allGoals.reduce((acc, goal) => {
      acc[goal.category] = (acc[goal.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

    return {
      total: allGoals.length,
      active: activeGoals.length,
      completed: completedGoals.length,
      overdue: overdueGoals.length,
      completionRate: await this.getGoalCompletionRate(),
      averageDaysToComplete,
      mostCommonCategory
    };
  }
}
