/**
 * Plan repository for managing workout programs and templates
 * Following cursor rules for type safety and error handling
 */

import { storageService } from "@/services/storage";
import { DateUtils } from "@/utils/dateUtils";
import type { 
  ProgramPlan, 
  PlanSearchFilters, 
  SessionPath, 
  CompletedSession, 
  PlanProgress, 
  PlanStats,
  Session
} from "@/types";

export class PlanRepository {
  private static readonly STORE_NAME = "plans";
  private static readonly COMPLETED_SESSIONS_STORE = "completed_sessions";

  /**
   * Save a plan
   */
  async save(plan: ProgramPlan): Promise<void> {
    try {
      // TODO: Add plan validation
      
      // Update timestamp
      const now = DateUtils.getCurrentDateTime();
      const planToSave = {
        ...plan,
        updated_at: now,
        version: plan.version + 1,
      };
      
      await storageService.save(PlanRepository.STORE_NAME, planToSave);
    } catch (error) {
      console.error("Failed to save plan:", error);
      throw error;
    }
  }

  /**
   * Save multiple plans at once
   */
  async saveBatch(plans: ProgramPlan[]): Promise<void> {
    try {
      for (const plan of plans) {
        // TODO: Add plan validation
        await storageService.save(PlanRepository.STORE_NAME, plan);
      }
    } catch (error) {
      console.error("Failed to save batch plans:", error);
      throw error;
    }
  }

  /**
   * Get a plan by ID
   */
  async getById(id: string): Promise<ProgramPlan | null> {
    try {
      return await storageService.get<ProgramPlan>(PlanRepository.STORE_NAME, id);
    } catch (error) {
      console.error("Failed to get plan:", error);
      return null;
    }
  }

  /**
   * Get all plans
   */
  async getAll(): Promise<ProgramPlan[]> {
    try {
      return await storageService.getAll<ProgramPlan>(PlanRepository.STORE_NAME);
    } catch (error) {
      console.error("Failed to get all plans:", error);
      return [];
    }
  }

  /**
   * Search plans with filters
   */
  async search(filters: PlanSearchFilters): Promise<ProgramPlan[]> {
    try {
      const allPlans = await this.getAll();
      
      return allPlans.filter(plan => {
        // Text search
        if (filters.query) {
          const query = filters.query.toLowerCase();
          const matchesTitle = plan.title.toLowerCase().includes(query);
          const matchesDescription = plan.description?.toLowerCase().includes(query);
          const matchesTags = plan.tags.some(tag => 
            tag.toLowerCase().includes(query)
          );
          
          if (!matchesTitle && !matchesDescription && !matchesTags) {
            return false;
          }
        }

        // Difficulty filter
        if (filters.difficulty_level && plan.difficulty_level !== filters.difficulty_level) {
          return false;
        }

        // Duration filter
        if (filters.duration_weeks) {
          if (filters.duration_weeks.min && plan.duration_weeks < filters.duration_weeks.min) {
            return false;
          }
          if (filters.duration_weeks.max && plan.duration_weeks > filters.duration_weeks.max) {
            return false;
          }
        }

        // Session types filter
        if (filters.session_types && filters.session_types.length > 0) {
          const planSessionTypes = new Set<string>();
          plan.phases.forEach(phase => {
            phase.weeks.forEach(week => {
              week.days.forEach(day => {
                day.sessions.forEach(session => {
                  planSessionTypes.add(session.session_type);
                });
              });
            });
          });
          
          const hasMatchingType = filters.session_types.some(type => 
            planSessionTypes.has(type)
          );
          if (!hasMatchingType) {
            return false;
          }
        }

        // Tags filter
        if (filters.tags && filters.tags.length > 0) {
          const hasMatchingTag = filters.tags.some(tag => 
            plan.tags.includes(tag)
          );
          if (!hasMatchingTag) {
            return false;
          }
        }

        // Template filter
        if (filters.is_template !== undefined && plan.is_template !== filters.is_template) {
          return false;
        }

        return true;
      }).sort((a, b) => {
        // Sort by updated date, newest first
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
    } catch (error) {
      console.error("Failed to search plans:", error);
      return [];
    }
  }

  /**
   * Delete a plan
   */
  async delete(id: string): Promise<void> {
    try {
      await storageService.delete(PlanRepository.STORE_NAME, id);
    } catch (error) {
      console.error("Failed to delete plan:", error);
      throw error;
    }
  }

  /**
   * Duplicate a plan
   */
  async duplicate(planId: string, newTitle: string): Promise<ProgramPlan> {
    try {
      const originalPlan = await this.getById(planId);
      if (!originalPlan) {
        throw new Error(`Plan with ID ${planId} not found`);
      }

      const now = DateUtils.getCurrentDateTime();
      const duplicatedPlan: ProgramPlan = {
        ...originalPlan,
        id: crypto.randomUUID(),
        title: newTitle,
        is_template: false,
        created_at: now,
        updated_at: now,
        version: 1,
      };

      await this.save(duplicatedPlan);
      return duplicatedPlan;
    } catch (error) {
      console.error("Failed to duplicate plan:", error);
      throw error;
    }
  }

  /**
   * Get templates only
   */
  async getTemplates(): Promise<ProgramPlan[]> {
    try {
      const allPlans = await this.getAll();
      return allPlans.filter(plan => plan.is_template);
    } catch (error) {
      console.error("Failed to get templates:", error);
      return [];
    }
  }

  /**
   * Get user plans (non-templates)
   */
  async getUserPlans(): Promise<ProgramPlan[]> {
    try {
      const allPlans = await this.getAll();
      return allPlans.filter(plan => !plan.is_template);
    } catch (error) {
      console.error("Failed to get user plans:", error);
      return [];
    }
  }

  /**
   * Count total plans
   */
  async count(): Promise<number> {
    try {
      return await storageService.count(PlanRepository.STORE_NAME);
    } catch (error) {
      console.error("Failed to count plans:", error);
      return 0;
    }
  }

  /**
   * Mark session as completed
   */
  async markSessionCompleted(completedSession: CompletedSession): Promise<void> {
    try {
      // TODO: Add completed session validation
      await storageService.save(PlanRepository.COMPLETED_SESSIONS_STORE, completedSession);
    } catch (error) {
      console.error("Failed to mark session completed:", error);
      throw error;
    }
  }

  /**
   * Get completed sessions for a plan
   */
  async getCompletedSessions(planId: string): Promise<CompletedSession[]> {
    try {
      const allCompleted = await storageService.getAll<CompletedSession>(
        PlanRepository.COMPLETED_SESSIONS_STORE
      );
      return allCompleted.filter(session => session.plan_id === planId);
    } catch (error) {
      console.error("Failed to get completed sessions:", error);
      return [];
    }
  }

  /**
   * Calculate plan progress
   */
  async calculateProgress(planId: string): Promise<PlanProgress | null> {
    try {
      const plan = await this.getById(planId);
      if (!plan) {
        return null;
      }

      const completedSessions = await this.getCompletedSessions(planId);
      const completedSessionIds = new Set(completedSessions.map(s => s.session_id));

      // Count total sessions
      let totalSessions = 0;
      plan.phases.forEach(phase => {
        phase.weeks.forEach(week => {
          week.days.forEach(day => {
            totalSessions += day.sessions.length;
          });
        });
      });

      const completedCount = completedSessions.length;
      const completionPercentage = totalSessions > 0 ? (completedCount / totalSessions) * 100 : 0;

      // Find current position
      let currentPhaseIndex = 0;
      let currentWeekIndex = 0;

      if (completedSessions.length > 0) {
        const lastSession = completedSessions
          .sort((a, b) => new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime())[0];
        
        currentPhaseIndex = lastSession.session_path.phaseIndex;
        currentWeekIndex = lastSession.session_path.weekIndex;
      }

      return {
        plan_id: planId,
        current_phase_index: currentPhaseIndex,
        current_week_index: currentWeekIndex,
        completed_sessions: completedSessionIds,
        total_sessions: totalSessions,
        completed_count: completedCount,
        completion_percentage: completionPercentage,
        last_session_date: completedSessions.length > 0 
          ? completedSessions[completedSessions.length - 1].completion_date 
          : undefined,
      };
    } catch (error) {
      console.error("Failed to calculate progress:", error);
      return null;
    }
  }

  /**
   * Get plan statistics
   */
  async getStats(planId: string): Promise<PlanStats | null> {
    try {
      const plan = await this.getById(planId);
      if (!plan) {
        return null;
      }

      const sessionsByType: Record<string, number> = {};
      const uniqueExercises = new Set<string>();
      let totalSessions = 0;
      let totalExercises = 0;
      let totalDurationMinutes = 0;

      plan.phases.forEach(phase => {
        phase.weeks.forEach(week => {
          week.days.forEach(day => {
            day.sessions.forEach(session => {
              totalSessions++;
              sessionsByType[session.session_type] = (sessionsByType[session.session_type] || 0) + 1;
              totalDurationMinutes += session.estimated_duration_minutes;
              
              session.exercises.forEach(exercise => {
                totalExercises++;
                uniqueExercises.add(exercise.exercise_id);
              });
            });
          });
        });
      });

      return {
        total_sessions: totalSessions,
        sessions_by_type: sessionsByType,
        total_exercises: totalExercises,
        unique_exercises: uniqueExercises.size,
        estimated_total_duration_minutes: totalDurationMinutes,
        phases_count: plan.phases.length,
        weeks_per_phase: plan.phases.map(phase => phase.duration_weeks),
      };
    } catch (error) {
      console.error("Failed to get plan stats:", error);
      return null;
    }
  }

  /**
   * Update session within a plan
   */
  async updateSession(
    planId: string, 
    sessionPath: SessionPath, 
    updatedSession: Partial<Session>
  ): Promise<void> {
    try {
      const plan = await this.getById(planId);
      if (!plan) {
        throw new Error(`Plan with ID ${planId} not found`);
      }

      const { phaseIndex, weekIndex, dayIndex, sessionIndex } = sessionPath;
      
      // Validate path
      if (!plan.phases[phaseIndex] || 
          !plan.phases[phaseIndex].weeks[weekIndex] ||
          !plan.phases[phaseIndex].weeks[weekIndex].days[dayIndex] ||
          !plan.phases[phaseIndex].weeks[weekIndex].days[dayIndex].sessions[sessionIndex]) {
        throw new Error("Invalid session path");
      }

      // Update the session
      const currentSession = plan.phases[phaseIndex].weeks[weekIndex].days[dayIndex].sessions[sessionIndex];
      plan.phases[phaseIndex].weeks[weekIndex].days[dayIndex].sessions[sessionIndex] = {
        ...currentSession,
        ...updatedSession,
      };

      await this.save(plan);
    } catch (error) {
      console.error("Failed to update session:", error);
      throw error;
    }
  }
}

export const planRepository = new PlanRepository();
