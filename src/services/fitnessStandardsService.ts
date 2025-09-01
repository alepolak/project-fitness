"use client";

import type { 
  StrengthStandard, 
  CardioStandard, 
  FitnessLevel, 
  BaselineTestEntry 
} from '@/types';

/**
 * Service for fitness standards classification and benchmarking
 * Following cursor rules for type safety and performance
 */
export class FitnessStandardsService {
  
  /**
   * Strength standards data (bodyweight multipliers)
   */
  private static readonly STRENGTH_STANDARDS: StrengthStandard[] = [
    {
      exercise_name: "bench_press",
      gender: "male",
      bodyweight_multiplier: {
        untrained: 0.60,
        novice: 0.85,
        intermediate: 1.15,
        advanced: 1.50,
        elite: 1.90
      }
    },
    {
      exercise_name: "bench_press", 
      gender: "female",
      bodyweight_multiplier: {
        untrained: 0.35,
        novice: 0.50,
        intermediate: 0.70,
        advanced: 0.95,
        elite: 1.25
      }
    },
    {
      exercise_name: "squat",
      gender: "male", 
      bodyweight_multiplier: {
        untrained: 0.75,
        novice: 1.10,
        intermediate: 1.50,
        advanced: 1.95,
        elite: 2.40
      }
    },
    {
      exercise_name: "squat",
      gender: "female",
      bodyweight_multiplier: {
        untrained: 0.45,
        novice: 0.70,
        intermediate: 1.00,
        advanced: 1.35,
        elite: 1.75
      }
    },
    {
      exercise_name: "deadlift",
      gender: "male",
      bodyweight_multiplier: {
        untrained: 1.00,
        novice: 1.35,
        intermediate: 1.80,
        advanced: 2.35,
        elite: 2.90
      }
    },
    {
      exercise_name: "deadlift",
      gender: "female", 
      bodyweight_multiplier: {
        untrained: 0.60,
        novice: 0.85,
        intermediate: 1.20,
        advanced: 1.60,
        elite: 2.05
      }
    },
    {
      exercise_name: "overhead_press",
      gender: "male",
      bodyweight_multiplier: {
        untrained: 0.40,
        novice: 0.55,
        intermediate: 0.75,
        advanced: 1.00,
        elite: 1.25
      }
    },
    {
      exercise_name: "overhead_press",
      gender: "female",
      bodyweight_multiplier: {
        untrained: 0.25,
        novice: 0.35,
        intermediate: 0.50,
        advanced: 0.65,
        elite: 0.85
      }
    }
  ];

  /**
   * Cardio fitness standards
   */
  private static readonly CARDIO_STANDARDS: CardioStandard[] = [
    {
      test_name: "rockport_walk",
      gender: "male",
      unit: "minutes",
      description: "1-mile walk time",
      age_ranges: [
        { min_age: 20, max_age: 29, excellent: 11.5, good: 13.0, fair: 15.0, poor: 17.0 },
        { min_age: 30, max_age: 39, excellent: 12.0, good: 13.5, fair: 15.5, poor: 17.5 },
        { min_age: 40, max_age: 49, excellent: 12.5, good: 14.0, fair: 16.0, poor: 18.0 },
        { min_age: 50, max_age: 59, excellent: 13.0, good: 14.5, fair: 16.5, poor: 18.5 },
        { min_age: 60, max_age: 69, excellent: 13.5, good: 15.0, fair: 17.0, poor: 19.0 }
      ]
    },
    {
      test_name: "rockport_walk",
      gender: "female", 
      unit: "minutes",
      description: "1-mile walk time",
      age_ranges: [
        { min_age: 20, max_age: 29, excellent: 12.5, good: 14.0, fair: 16.0, poor: 18.0 },
        { min_age: 30, max_age: 39, excellent: 13.0, good: 14.5, fair: 16.5, poor: 18.5 },
        { min_age: 40, max_age: 49, excellent: 13.5, good: 15.0, fair: 17.0, poor: 19.0 },
        { min_age: 50, max_age: 59, excellent: 14.0, good: 15.5, fair: 17.5, poor: 19.5 },
        { min_age: 60, max_age: 69, excellent: 14.5, good: 16.0, fair: 18.0, poor: 20.0 }
      ]
    },
    {
      test_name: "twelve_minute_run",
      gender: "male",
      unit: "miles", 
      description: "12-minute run distance",
      age_ranges: [
        { min_age: 20, max_age: 29, excellent: 1.8, good: 1.6, fair: 1.4, poor: 1.2 },
        { min_age: 30, max_age: 39, excellent: 1.7, good: 1.5, fair: 1.3, poor: 1.1 },
        { min_age: 40, max_age: 49, excellent: 1.6, good: 1.4, fair: 1.2, poor: 1.0 },
        { min_age: 50, max_age: 59, excellent: 1.5, good: 1.3, fair: 1.1, poor: 0.9 },
        { min_age: 60, max_age: 69, excellent: 1.4, good: 1.2, fair: 1.0, poor: 0.8 }
      ]
    },
    {
      test_name: "twelve_minute_run",
      gender: "female",
      unit: "miles",
      description: "12-minute run distance", 
      age_ranges: [
        { min_age: 20, max_age: 29, excellent: 1.6, good: 1.4, fair: 1.2, poor: 1.0 },
        { min_age: 30, max_age: 39, excellent: 1.5, good: 1.3, fair: 1.1, poor: 0.9 },
        { min_age: 40, max_age: 49, excellent: 1.4, good: 1.2, fair: 1.0, poor: 0.8 },
        { min_age: 50, max_age: 59, excellent: 1.3, good: 1.1, fair: 0.9, poor: 0.7 },
        { min_age: 60, max_age: 69, excellent: 1.2, good: 1.0, fair: 0.8, poor: 0.6 }
      ]
    }
  ];

  /**
   * Get strength level based on lift performance
   */
  static getStrengthLevel(
    liftAmount: number,
    bodyWeight: number, 
    exercise: "bench_press" | "squat" | "deadlift" | "overhead_press",
    gender: "male" | "female"
  ): FitnessLevel {
    const standard = this.STRENGTH_STANDARDS.find(
      s => s.exercise_name === exercise && s.gender === gender
    );

    if (!standard) {
      return {
        category: "strength",
        level: "untrained",
        percentile: 0,
        progress_to_next: 0
      };
    }

    const ratio = liftAmount / bodyWeight;
    const multipliers = standard.bodyweight_multiplier;

    let level: "untrained" | "novice" | "intermediate" | "advanced" | "elite";
    let nextLevelTarget: number | undefined;
    let progressToNext: number;

    if (ratio < multipliers.untrained) {
      level = "untrained";
      nextLevelTarget = bodyWeight * multipliers.untrained;
      progressToNext = (ratio / multipliers.untrained) * 100;
    } else if (ratio < multipliers.novice) {
      level = "untrained";
      nextLevelTarget = bodyWeight * multipliers.novice;
      const range = multipliers.novice - multipliers.untrained;
      const progress = ratio - multipliers.untrained;
      progressToNext = (progress / range) * 100;
    } else if (ratio < multipliers.intermediate) {
      level = "novice";
      nextLevelTarget = bodyWeight * multipliers.intermediate;
      const range = multipliers.intermediate - multipliers.novice;
      const progress = ratio - multipliers.novice;
      progressToNext = (progress / range) * 100;
    } else if (ratio < multipliers.advanced) {
      level = "intermediate";
      nextLevelTarget = bodyWeight * multipliers.advanced;
      const range = multipliers.advanced - multipliers.intermediate;
      const progress = ratio - multipliers.intermediate;
      progressToNext = (progress / range) * 100;
    } else if (ratio < multipliers.elite) {
      level = "advanced";
      nextLevelTarget = bodyWeight * multipliers.elite;
      const range = multipliers.elite - multipliers.advanced;
      const progress = ratio - multipliers.advanced;
      progressToNext = (progress / range) * 100;
    } else {
      level = "elite";
      progressToNext = 100;
    }

    // Calculate percentile (simplified approximation)
    const percentile = this.calculatePercentile(ratio, Object.values(multipliers));

    return {
      category: "strength",
      level,
      percentile,
      next_level_target: nextLevelTarget,
      progress_to_next: Math.min(100, Math.max(0, progressToNext))
    };
  }

  /**
   * Get cardio fitness level and age
   */
  static getCardioFitnessLevel(
    testResult: number,
    age: number,
    gender: "male" | "female",
    testType: "rockport_walk" | "twelve_minute_run"
  ): { level: string; fitnessAge: number; percentile: number } {
    const standard = this.CARDIO_STANDARDS.find(
      s => s.test_name === testType && s.gender === gender
    );

    if (!standard) {
      return { level: "unknown", fitnessAge: age, percentile: 50 };
    }

    // Find appropriate age range
    const ageRange = standard.age_ranges.find(
      range => age >= range.min_age && age <= range.max_age
    ) || standard.age_ranges[standard.age_ranges.length - 1]; // Default to oldest range

    let level: string;
    let percentile: number;

    // For time-based tests (lower is better)
    if (testType === "rockport_walk") {
      if (testResult <= ageRange.excellent) {
        level = "excellent";
        percentile = 90;
      } else if (testResult <= ageRange.good) {
        level = "good";
        percentile = 75;
      } else if (testResult <= ageRange.fair) {
        level = "fair";
        percentile = 50;
      } else {
        level = "poor";
        percentile = 25;
      }
    } else {
      // For distance-based tests (higher is better)
      if (testResult >= ageRange.excellent) {
        level = "excellent";
        percentile = 90;
      } else if (testResult >= ageRange.good) {
        level = "good";
        percentile = 75;
      } else if (testResult >= ageRange.fair) {
        level = "fair";
        percentile = 50;
      } else {
        level = "poor";
        percentile = 25;
      }
    }

    // Calculate fitness age (simplified)
    const fitnessAge = this.calculateFitnessAge(testResult, standard, gender);

    return { level, fitnessAge, percentile };
  }

  /**
   * Get next level target for strength exercise
   */
  static getNextLevelTarget(
    currentLift: number,
    bodyWeight: number,
    exercise: "bench_press" | "squat" | "deadlift" | "overhead_press",
    gender: "male" | "female"
  ): { target: number; level: string } | null {
    const fitnessLevel = this.getStrengthLevel(currentLift, bodyWeight, exercise, gender);
    
    if (fitnessLevel.next_level_target) {
      const nextLevels = ["novice", "intermediate", "advanced", "elite"];
      const currentIndex = ["untrained", "novice", "intermediate", "advanced"].indexOf(fitnessLevel.level);
      const nextLevel = nextLevels[currentIndex] || "elite";
      
      return {
        target: Math.round(fitnessLevel.next_level_target),
        level: nextLevel
      };
    }
    
    return null;
  }

  /**
   * Calculate percentile rank
   */
  static getPercentileRank(value: number, standards: number[]): number {
    const sortedStandards = [...standards].sort((a, b) => a - b);
    const rank = sortedStandards.filter(s => s <= value).length;
    return Math.round((rank / sortedStandards.length) * 100);
  }

  /**
   * Get comprehensive fitness assessment from baseline
   */
  static getComprehensiveFitnessLevel(
    baseline: BaselineTestEntry,
    bodyWeight: number,
    age: number,
    gender: "male" | "female"
  ): {
    overall: FitnessLevel;
    strength: Record<string, FitnessLevel>;
    cardio: Record<string, { level: string; fitnessAge: number; percentile: number }>;
  } {
    const strength: Record<string, FitnessLevel> = {};
    const cardio: Record<string, { level: string; fitnessAge: number; percentile: number }> = {};

    // Analyze strength metrics
    if (baseline.bench_press_1rm_lb) {
      strength.bench_press = this.getStrengthLevel(
        baseline.bench_press_1rm_lb, bodyWeight, "bench_press", gender
      );
    }
    if (baseline.squat_1rm_lb) {
      strength.squat = this.getStrengthLevel(
        baseline.squat_1rm_lb, bodyWeight, "squat", gender
      );
    }
    if (baseline.deadlift_1rm_lb) {
      strength.deadlift = this.getStrengthLevel(
        baseline.deadlift_1rm_lb, bodyWeight, "deadlift", gender
      );
    }
    if (baseline.overhead_press_1rm_lb) {
      strength.overhead_press = this.getStrengthLevel(
        baseline.overhead_press_1rm_lb, bodyWeight, "overhead_press", gender
      );
    }

    // Analyze cardio metrics
    if (baseline.rockport_time_mm_ss) {
      const timeInMinutes = this.convertTimeToMinutes(baseline.rockport_time_mm_ss);
      cardio.rockport_walk = this.getCardioFitnessLevel(
        timeInMinutes, age, gender, "rockport_walk"
      );
    }
    if (baseline.twelve_minute_distance) {
      cardio.twelve_minute_run = this.getCardioFitnessLevel(
        baseline.twelve_minute_distance, age, gender, "twelve_minute_run"
      );
    }

    // Calculate overall fitness level
    const allLevels = Object.values(strength).map(s => s.level);
    const averagePercentile = Object.values(strength).length > 0 
      ? Object.values(strength).reduce((sum, s) => sum + s.percentile, 0) / Object.values(strength).length
      : 50;

    const overallLevel = this.determineOverallLevel(allLevels, averagePercentile);

    const overall: FitnessLevel = {
      category: "overall",
      level: overallLevel,
      percentile: averagePercentile,
      progress_to_next: this.calculateOverallProgress(strength)
    };

    return { overall, strength, cardio };
  }

  /**
   * Private helper methods
   */
  private static calculatePercentile(value: number, standards: number[]): number {
    const sortedStandards = [...standards].sort((a, b) => a - b);
    let rank = 0;
    
    for (const standard of sortedStandards) {
      if (value >= standard) rank++;
    }
    
    return Math.round((rank / sortedStandards.length) * 100);
  }

  private static calculateFitnessAge(
    testResult: number,
    standard: CardioStandard,
    _gender: "male" | "female"
  ): number {
    // Simplified fitness age calculation
    // Find which age range the performance matches
    for (const range of standard.age_ranges) {
      const isGoodPerformance = standard.test_name === "rockport_walk"
        ? testResult <= range.good
        : testResult >= range.good;
      
      if (isGoodPerformance) {
        return Math.round((range.min_age + range.max_age) / 2);
      }
    }
    
    // If no good performance found, return oldest age range
    const oldestRange = standard.age_ranges[standard.age_ranges.length - 1];
    return oldestRange.max_age + 5;
  }

  private static convertTimeToMinutes(timeString: string): number {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes + (seconds / 60);
  }

  private static determineOverallLevel(
    levels: Array<"untrained" | "novice" | "intermediate" | "advanced" | "elite">,
    averagePercentile: number
  ): "untrained" | "novice" | "intermediate" | "advanced" | "elite" {
    if (levels.length === 0) {
      return averagePercentile >= 75 ? "intermediate" : 
             averagePercentile >= 50 ? "novice" : "untrained";
    }

    // Count occurrences of each level
    const levelCounts = levels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find the most common level
    const mostCommonLevel = Object.entries(levelCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as "untrained" | "novice" | "intermediate" | "advanced" | "elite";

    return mostCommonLevel;
  }

  private static calculateOverallProgress(
    strength: Record<string, FitnessLevel>
  ): number {
    const progressValues = Object.values(strength).map(s => s.progress_to_next);
    
    if (progressValues.length === 0) return 0;
    
    return progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length;
  }
}
