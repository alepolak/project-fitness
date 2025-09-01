/**
 * Plan service for business logic and operations
 * Following cursor rules for type safety and error handling
 */

import { planRepository } from "@/repositories";
import { DateUtils } from "@/utils/dateUtils";
import { FriendlySentenceGenerator } from "@/utils/friendlySentences";
import type { 
  ProgramPlan, 
  Phase, 
  Week, 
  Session, 
  SessionPath, 
  ExercisePrescription,
  SetPrescription,
  CardioBlock,
  ExerciseCatalogItem
} from "@/types";

export class PlanService {
  /**
   * Create a new blank plan
   */
  static async createNewPlan(
    title: string = "New Workout Plan",
    template?: ProgramPlan
  ): Promise<ProgramPlan> {
    const now = DateUtils.getCurrentDateTime();
    
    if (template) {
      // Create from template
      const newPlan: ProgramPlan = {
        ...template,
        id: crypto.randomUUID(),
        title,
        is_template: false,
        created_at: now,
        updated_at: now,
        version: 1,
      };
      
      await planRepository.save(newPlan);
      return newPlan;
    }
    
    // Create default 4-week beginner plan structure
    const defaultPlan: ProgramPlan = {
      id: crypto.randomUUID(),
      title,
      description: "A beginner-friendly workout program",
      duration_weeks: 4,
      difficulty_level: "beginner",
      phases: [
        {
          name: "Base",
          description: "Building foundation",
          duration_weeks: 4,
          weeks: [
            this.createDefaultWeek(1),
            this.createDefaultWeek(2),
            this.createDefaultWeek(3),
            this.createDefaultWeek(4, true), // Week 4 is deload
          ]
        }
      ],
      tags: [],
      is_template: false,
      created_at: now,
      updated_at: now,
      version: 1,
    };
    
    await planRepository.save(defaultPlan);
    return defaultPlan;
  }

  /**
   * Create a default week structure
   */
  private static createDefaultWeek(weekIndex: number, isDeload: boolean = false): Week {
    return {
      index: weekIndex,
      deload_week: isDeload,
      days: [
        // Sunday - Rest
        { day_of_week: 0, is_rest_day: true, sessions: [] },
        // Monday - Strength
        { 
          day_of_week: 1, 
          is_rest_day: false, 
          sessions: [this.createDefaultStrengthSession()] 
        },
        // Tuesday - Rest
        { day_of_week: 2, is_rest_day: true, sessions: [] },
        // Wednesday - Intervals
        { 
          day_of_week: 3, 
          is_rest_day: false, 
          sessions: [this.createDefaultIntervalSession()] 
        },
        // Thursday - Rest
        { day_of_week: 4, is_rest_day: true, sessions: [] },
        // Friday - Strength
        { 
          day_of_week: 5, 
          is_rest_day: false, 
          sessions: [this.createDefaultStrengthSession()] 
        },
        // Saturday - Walk
        { 
          day_of_week: 6, 
          is_rest_day: false, 
          sessions: [this.createDefaultWalkSession()] 
        },
      ]
    };
  }

  /**
   * Create a default strength session
   */
  private static createDefaultStrengthSession(): Session {
    return {
      id: crypto.randomUUID(),
      session_type: "strength",
      title: "Strength Training",
      description: "Full body strength session",
      estimated_duration_minutes: 45,
      exercises: [],
      warm_up_notes: "5-10 minutes of light movement and dynamic stretches",
      cool_down_notes: "5-10 minutes of walking and static stretches",
    };
  }

  /**
   * Create a default interval session
   */
  private static createDefaultIntervalSession(): Session {
    return {
      id: crypto.randomUUID(),
      session_type: "intervals",
      title: "Interval Training",
      description: "High-intensity interval training",
      estimated_duration_minutes: 30,
      exercises: [],
      warm_up_notes: "5 minutes easy walking",
      cool_down_notes: "5 minutes easy walking until heart rate recovers",
    };
  }

  /**
   * Create a default walking session
   */
  private static createDefaultWalkSession(): Session {
    return {
      id: crypto.randomUUID(),
      session_type: "steady_cardio",
      title: "Easy Walk",
      description: "Steady state cardio",
      estimated_duration_minutes: 30,
      exercises: [],
      warm_up_notes: "Start with 2-3 minutes very easy pace",
      cool_down_notes: "End with 2-3 minutes very easy pace",
    };
  }

  /**
   * Duplicate an existing plan
   */
  static async duplicatePlan(planId: string, newTitle: string): Promise<ProgramPlan> {
    return await planRepository.duplicate(planId, newTitle);
  }

  /**
   * Add a new phase to a plan
   */
  static async addPhase(
    planId: string, 
    phaseName: "Base" | "Build" | "Peak",
    durationWeeks: number = 4
  ): Promise<void> {
    const plan = await planRepository.getById(planId);
    if (!plan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }

    const newPhase: Phase = {
      name: phaseName,
      description: `${phaseName} phase`,
      duration_weeks: durationWeeks,
      weeks: [],
    };

    // Create weeks for the phase
    for (let i = 1; i <= durationWeeks; i++) {
      newPhase.weeks.push(this.createDefaultWeek(i, i === durationWeeks)); // Last week is deload
    }

    plan.phases.push(newPhase);
    plan.duration_weeks += durationWeeks;
    
    await planRepository.save(plan);
  }

  /**
   * Add a week to a specific phase
   */
  static async addWeekToPhase(planId: string, phaseIndex: number): Promise<void> {
    const plan = await planRepository.getById(planId);
    if (!plan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }

    if (!plan.phases[phaseIndex]) {
      throw new Error(`Phase ${phaseIndex} not found`);
    }

    const phase = plan.phases[phaseIndex];
    const newWeekIndex = phase.weeks.length + 1;
    const newWeek = this.createDefaultWeek(newWeekIndex);
    
    phase.weeks.push(newWeek);
    phase.duration_weeks += 1;
    plan.duration_weeks += 1;
    
    await planRepository.save(plan);
  }

  /**
   * Schedule a session to a specific date
   */
  static async scheduleSession(
    planId: string,
    sessionPath: SessionPath,
    date: Date
  ): Promise<void> {
    const plan = await planRepository.getById(planId);
    if (!plan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }

    const { phaseIndex, weekIndex, dayIndex } = sessionPath;
    
    if (!plan.phases[phaseIndex] || 
        !plan.phases[phaseIndex].weeks[weekIndex] ||
        !plan.phases[phaseIndex].weeks[weekIndex].days[dayIndex]) {
      throw new Error("Invalid session path");
    }

    plan.phases[phaseIndex].weeks[weekIndex].days[dayIndex].date = date.toISOString().split("T")[0];
    
    await planRepository.save(plan);
  }

  /**
   * Update session exercises
   */
  static async updateSessionExercises(
    planId: string,
    sessionPath: SessionPath,
    exercises: ExercisePrescription[]
  ): Promise<void> {
    const plan = await planRepository.getById(planId);
    if (!plan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }

    const { phaseIndex, weekIndex, dayIndex, sessionIndex } = sessionPath;
    
    if (!plan.phases[phaseIndex] || 
        !plan.phases[phaseIndex].weeks[weekIndex] ||
        !plan.phases[phaseIndex].weeks[weekIndex].days[dayIndex] ||
        !plan.phases[phaseIndex].weeks[weekIndex].days[dayIndex].sessions[sessionIndex]) {
      throw new Error("Invalid session path");
    }

    plan.phases[phaseIndex].weeks[weekIndex].days[dayIndex].sessions[sessionIndex].exercises = exercises;
    
    await planRepository.save(plan);
  }

  /**
   * Add exercise to session
   */
  static async addExerciseToSession(
    planId: string,
    sessionPath: SessionPath,
    exerciseId: string,
    exercise: ExerciseCatalogItem
  ): Promise<void> {
    const plan = await planRepository.getById(planId);
    if (!plan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }

    const session = this.getSessionByPath(plan, sessionPath);
    if (!session) {
      throw new Error("Session not found");
    }

    // Create default prescription based on exercise type
    const prescription: ExercisePrescription = {
      exercise_id: exerciseId,
      clear_description: "", // Will be auto-generated
      order_index: session.exercises.length,
      ...this.createDefaultPrescription(exercise, session.session_type)
    };

    session.exercises.push(prescription);
    
    await planRepository.save(plan);
  }

  /**
   * Create default prescription for an exercise
   */
  private static createDefaultPrescription(
    exercise: ExerciseCatalogItem,
    sessionType: string
  ): Partial<ExercisePrescription> {
    if (exercise.exercise_type === 'cardio' || sessionType === 'intervals') {
      // Create cardio block
      const cardioBlock: CardioBlock = {
        warm_up_minutes: 5,
        work_intervals: [
          {
            interval_number: 1,
            hard_seconds: 30,
            easy_seconds: 90,
          }
        ],
        cool_down_minutes: 5,
        safety_notes: "Stop immediately if you feel dizzy or short of breath",
      };

      return { cardio_block: cardioBlock };
    } else {
      // Create strength sets
      const defaultSets: SetPrescription[] = [
        {
          set_number: 1,
          target_repetitions: { min: 8, max: 12 },
          rest_seconds: 60,
        },
        {
          set_number: 2,
          target_repetitions: { min: 8, max: 12 },
          rest_seconds: 60,
        },
        {
          set_number: 3,
          target_repetitions: { min: 8, max: 12 },
          rest_seconds: 60,
        }
      ];

      return { sets: defaultSets };
    }
  }

  /**
   * Remove exercise from session
   */
  static async removeExerciseFromSession(
    planId: string,
    sessionPath: SessionPath,
    exerciseIndex: number
  ): Promise<void> {
    const plan = await planRepository.getById(planId);
    if (!plan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }

    const session = this.getSessionByPath(plan, sessionPath);
    if (!session) {
      throw new Error("Session not found");
    }

    session.exercises.splice(exerciseIndex, 1);
    
    // Reorder indices
    session.exercises.forEach((ex, index) => {
      ex.order_index = index;
    });
    
    await planRepository.save(plan);
  }

  /**
   * Reorder exercises in a session
   */
  static async reorderExercises(
    planId: string,
    sessionPath: SessionPath,
    startIndex: number,
    endIndex: number
  ): Promise<void> {
    const plan = await planRepository.getById(planId);
    if (!plan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }

    const session = this.getSessionByPath(plan, sessionPath);
    if (!session) {
      throw new Error("Session not found");
    }

    const exercises = [...session.exercises];
    const [removed] = exercises.splice(startIndex, 1);
    exercises.splice(endIndex, 0, removed);
    
    // Update order indices
    exercises.forEach((ex, index) => {
      ex.order_index = index;
    });
    
    session.exercises = exercises;
    
    await planRepository.save(plan);
  }

  /**
   * Generate friendly descriptions for all exercises in a session
   */
  static async generateSessionDescriptions(
    session: Session,
    exercises: ExerciseCatalogItem[],
    unitSystem: 'imperial' | 'metric'
  ): Promise<Session> {
    const exerciseMap = new Map(exercises.map(ex => [ex.id, ex]));
    
    session.exercises.forEach(prescription => {
      const exercise = exerciseMap.get(prescription.exercise_id);
      if (exercise && prescription.clear_description.trim() === '') {
        prescription.clear_description = FriendlySentenceGenerator.generateExerciseDescription(
          prescription,
          exercise,
          unitSystem
        );
      }
    });
    
    return session;
  }

  /**
   * Get session by path helper
   */
  static getSessionByPath(plan: ProgramPlan, path: SessionPath): Session | null {
    const { phaseIndex, weekIndex, dayIndex, sessionIndex } = path;
    
    try {
      return plan.phases[phaseIndex].weeks[weekIndex].days[dayIndex].sessions[sessionIndex] || null;
    } catch {
      return null;
    }
  }

  /**
   * Get all sessions from a plan as a flat array with their paths
   */
  static getAllSessionsWithPaths(plan: ProgramPlan): Array<{
    session: Session;
    path: SessionPath;
    date?: Date;
  }> {
    const sessions: Array<{ session: Session; path: SessionPath; date?: Date }> = [];
    
    plan.phases.forEach((phase, phaseIndex) => {
      phase.weeks.forEach((week, weekIndex) => {
        week.days.forEach((day, dayIndex) => {
          day.sessions.forEach((session, sessionIndex) => {
            sessions.push({
              session,
              path: { phaseIndex, weekIndex, dayIndex, sessionIndex },
              date: day.date ? new Date(day.date) : undefined,
            });
          });
        });
      });
    });
    
    return sessions;
  }

  /**
   * Calculate next recommended session date
   */
  static getNextSessionDate(plan: ProgramPlan, completedSessions: Set<string>): Date | null {
    const allSessions = this.getAllSessionsWithPaths(plan);
    
    // Find first incomplete session
    const nextSession = allSessions.find(({ session }) => 
      !completedSessions.has(session.id)
    );
    
    if (!nextSession) {
      return null; // All sessions completed
    }
    
    // If session has a scheduled date, return that
    if (nextSession.date) {
      return nextSession.date;
    }
    
    // Otherwise suggest today or tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return today;
  }
}
