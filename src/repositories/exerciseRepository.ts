/**
 * Exercise repository for managing exercise catalog
 * Following cursor rules for repository pattern
 */

import { BaseRepository } from "./base";
import { ValidationService } from "@/validators";
import type { ExerciseCatalogItem } from "@/types";

export class ExerciseRepository extends BaseRepository<ExerciseCatalogItem> {
  constructor() {
    super("exercises", ValidationService.validateExercise);
  }

  /**
   * Search exercises by name or aliases
   */
  async searchByName(query: string): Promise<ExerciseCatalogItem[]> {
    const allExercises = await this.getAll();
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return allExercises;
    }

    return allExercises.filter((exercise) => {
      // Search in name
      if (exercise.name.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in beginner-friendly name
      if (exercise.beginner_friendly_name.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in aliases
      return exercise.aliases.some((alias) =>
        alias.toLowerCase().includes(searchTerm)
      );
    });
  }

  /**
   * Get exercises by movement pattern
   */
  async getByMovementPattern(
    pattern: ExerciseCatalogItem["movement_pattern"]
  ): Promise<ExerciseCatalogItem[]> {
    return this.query({ movement_pattern: pattern });
  }

  /**
   * Get exercises by equipment
   */
  async getByEquipment(equipment: string[]): Promise<ExerciseCatalogItem[]> {
    const allExercises = await this.getAll();
    
    return allExercises.filter((exercise) =>
      equipment.some((eq) => exercise.equipment.includes(eq))
    );
  }

  /**
   * Get exercises by muscle groups
   */
  async getByMuscleGroups(muscles: string[]): Promise<ExerciseCatalogItem[]> {
    const allExercises = await this.getAll();
    
    return allExercises.filter((exercise) =>
      muscles.some((muscle) => 
        exercise.primary_muscles.includes(muscle) ||
        (exercise.secondary_muscles && exercise.secondary_muscles.includes(muscle))
      )
    );
  }

  /**
   * Get exercises by difficulty level
   */
  async getByDifficultyLevel(
    level: ExerciseCatalogItem["difficulty_level"]
  ): Promise<ExerciseCatalogItem[]> {
    return this.query({ difficulty_level: level });
  }

  /**
   * Get exercises by type
   */
  async getByType(
    type: ExerciseCatalogItem["exercise_type"]
  ): Promise<ExerciseCatalogItem[]> {
    return this.query({ exercise_type: type });
  }

  /**
   * Get beginner-friendly exercises
   */
  async getBeginnerFriendly(): Promise<ExerciseCatalogItem[]> {
    return this.getByDifficultyLevel("beginner");
  }

  /**
   * Get exercises that require no equipment
   */
  async getBodyweightExercises(): Promise<ExerciseCatalogItem[]> {
    const allExercises = await this.getAll();
    
    return allExercises.filter((exercise) =>
      exercise.equipment.length === 0 ||
      exercise.equipment.every((eq) => 
        eq.toLowerCase().includes("bodyweight") || 
        eq.toLowerCase().includes("none")
      )
    );
  }

  /**
   * Get similar exercises based on movement pattern and muscles
   */
  async getSimilarExercises(
    exerciseId: string,
    limit: number = 5
  ): Promise<ExerciseCatalogItem[]> {
    const targetExercise = await this.getById(exerciseId);
    if (!targetExercise) {
      return [];
    }

    const allExercises = await this.getAll();
    
    const similar = allExercises
      .filter((exercise) => exercise.id !== exerciseId)
      .map((exercise) => {
        let score = 0;
        
        // Same movement pattern gets highest score
        if (exercise.movement_pattern === targetExercise.movement_pattern) {
          score += 10;
        }
        
        // Shared primary muscles
        const sharedPrimary = exercise.primary_muscles.filter((muscle) =>
          targetExercise.primary_muscles.includes(muscle)
        ).length;
        score += sharedPrimary * 5;
        
        // Shared secondary muscles
        if (exercise.secondary_muscles && targetExercise.secondary_muscles) {
          const sharedSecondary = exercise.secondary_muscles.filter((muscle) =>
            targetExercise.secondary_muscles!.includes(muscle)
          ).length;
          score += sharedSecondary * 2;
        }
        
        // Same difficulty level
        if (exercise.difficulty_level === targetExercise.difficulty_level) {
          score += 3;
        }
        
        // Shared equipment
        const sharedEquipment = exercise.equipment.filter((eq) =>
          targetExercise.equipment.includes(eq)
        ).length;
        score += sharedEquipment * 1;
        
        return { exercise, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ exercise }) => exercise);

    return similar;
  }

  /**
   * Get exercises grouped by category
   */
  async getGroupedByMovementPattern(): Promise<
    Record<ExerciseCatalogItem["movement_pattern"], ExerciseCatalogItem[]>
  > {
    const allExercises = await this.getAll();
    const grouped: Record<ExerciseCatalogItem["movement_pattern"], ExerciseCatalogItem[]> = {
      hinge: [],
      squat: [],
      press: [],
      pull: [],
      carry: [],
      core: [],
    };

    allExercises.forEach((exercise) => {
      grouped[exercise.movement_pattern].push(exercise);
    });

    return grouped;
  }

  /**
   * Get most popular exercises (based on usage - would need workout data)
   * For now, returns exercises sorted by name
   */
  async getMostPopular(limit: number = 10): Promise<ExerciseCatalogItem[]> {
    const allExercises = await this.getAll();
    
    // For now, return exercises sorted by name
    // In a real implementation, this would query workout logs
    return allExercises
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, limit);
  }

  /**
   * Get exercise statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byDifficulty: Record<ExerciseCatalogItem["difficulty_level"], number>;
    byType: Record<ExerciseCatalogItem["exercise_type"], number>;
    byMovementPattern: Record<ExerciseCatalogItem["movement_pattern"], number>;
  }> {
    const allExercises = await this.getAll();
    
    const stats = {
      total: allExercises.length,
      byDifficulty: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
      },
      byType: {
        strength: 0,
        cardio: 0,
        flexibility: 0,
        balance: 0,
      },
      byMovementPattern: {
        hinge: 0,
        squat: 0,
        press: 0,
        pull: 0,
        carry: 0,
        core: 0,
      },
    };

    allExercises.forEach((exercise) => {
      stats.byDifficulty[exercise.difficulty_level]++;
      stats.byType[exercise.exercise_type]++;
      stats.byMovementPattern[exercise.movement_pattern]++;
    });

    return stats;
  }
}
