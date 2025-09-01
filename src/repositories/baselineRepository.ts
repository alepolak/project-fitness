/**
 * Baseline repository for managing baseline test entries
 * Following cursor rules for repository pattern
 */

import { BaseRepository } from "./base";
import { ValidationService } from "@/validators";
import { DateUtils } from "@/utils/dateUtils";
import type { BaselineTestEntry } from "@/types";

export class BaselineRepository extends BaseRepository<BaselineTestEntry> {
  constructor() {
    super("baselines", ValidationService.validateBaselineTest);
  }

  /**
   * Get baseline entry for specific month
   */
  async getByMonth(month: string): Promise<BaselineTestEntry | null> {
    const entries = await this.query({ month });
    return entries.length > 0 ? entries[0] : null;
  }

  /**
   * Get latest baseline entry
   */
  async getLatest(): Promise<BaselineTestEntry | null> {
    const allBaselines = await this.getAll();
    
    if (allBaselines.length === 0) {
      return null;
    }

    return allBaselines.sort((a, b) => 
      new Date(b.test_date).getTime() - new Date(a.test_date).getTime()
    )[0];
  }

  /**
   * Get baselines by date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<BaselineTestEntry[]> {
    const allBaselines = await this.getAll();
    
    return allBaselines.filter((baseline) => {
      return baseline.test_date >= startDate && baseline.test_date <= endDate;
    });
  }

  /**
   * Get baseline progression for specific test
   */
  async getCardioProgression(
    testType: "rockport" | "twelve_minute" | "continuous_jog" | "heart_rate_recovery"
  ): Promise<Array<{ month: string; value: number; unit?: string }>> {
    const allBaselines = await this.getAll();
    
    return allBaselines
      .filter((baseline) => {
        switch (testType) {
          case "rockport":
            return baseline.rockport_time_mm_ss !== undefined;
          case "twelve_minute":
            return baseline.twelve_minute_distance !== undefined;
          case "continuous_jog":
            return baseline.longest_continuous_jog_minutes !== undefined;
          case "heart_rate_recovery":
            return baseline.best_one_minute_heart_rate_drop_bpm !== undefined;
          default:
            return false;
        }
      })
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((baseline) => {
        let value: number;
        let unit: string | undefined;

        switch (testType) {
          case "rockport":
            // Convert MM:SS to total seconds
            const [minutes, seconds] = baseline.rockport_time_mm_ss!.split(":").map(Number);
            value = minutes * 60 + seconds;
            unit = "seconds";
            break;
          case "twelve_minute":
            value = baseline.twelve_minute_distance!;
            unit = baseline.twelve_minute_distance_unit;
            break;
          case "continuous_jog":
            value = baseline.longest_continuous_jog_minutes!;
            unit = "minutes";
            break;
          case "heart_rate_recovery":
            value = baseline.best_one_minute_heart_rate_drop_bpm!;
            unit = "bpm";
            break;
          default:
            value = 0;
        }

        return { month: baseline.month, value, unit };
      });
  }

  /**
   * Get strength progression
   */
  async getStrengthProgression(
    exercise: "bench_press" | "squat" | "deadlift" | "overhead_press"
  ): Promise<Array<{ month: string; value: number }>> {
    const allBaselines = await this.getAll();
    
    return allBaselines
      .filter((baseline) => {
        const fieldName = `${exercise}_1rm_lb` as keyof BaselineTestEntry;
        return baseline[fieldName] !== undefined;
      })
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((baseline) => {
        const fieldName = `${exercise}_1rm_lb` as keyof BaselineTestEntry;
        return {
          month: baseline.month,
          value: baseline[fieldName] as number,
        };
      });
  }

  /**
   * Get bodyweight exercise progression
   */
  async getBodyweightProgression(
    exercise: "pull_up" | "push_up" | "plank"
  ): Promise<Array<{ month: string; value: number; unit: string }>> {
    const allBaselines = await this.getAll();
    
    const fieldName = exercise === "plank" 
      ? "plank_max_seconds" 
      : `${exercise}_max_reps` as keyof BaselineTestEntry;
      
    const unit = exercise === "plank" ? "seconds" : "reps";
    
    return allBaselines
      .filter((baseline) => baseline[fieldName] !== undefined)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((baseline) => ({
        month: baseline.month,
        value: baseline[fieldName] as number,
        unit,
      }));
  }

  /**
   * Calculate improvement percentage
   */
  async getImprovementStats(
    testType: string,
    months: number = 6
  ): Promise<{
    improvement: number;
    improvementPercent: number;
    startValue: number;
    endValue: number;
    unit?: string;
  } | null> {
    const cutoffDate = DateUtils.getMonthKey(
      DateUtils.addDays(DateUtils.getCurrentDate(), -months * 30)
    );
    
    const recentBaselines = await this.getAll();
    const filteredBaselines = recentBaselines.filter(
      (baseline) => baseline.month >= cutoffDate
    );

    if (filteredBaselines.length < 2) {
      return null;
    }

    const sortedBaselines = filteredBaselines.sort(
      (a, b) => a.month.localeCompare(b.month)
    );
    
    const startBaseline = sortedBaselines[0];
    const endBaseline = sortedBaselines[sortedBaselines.length - 1];

    // Get values based on test type
    let startValue: number | undefined;
    let endValue: number | undefined;
    let unit: string | undefined;

    switch (testType) {
      case "bench_press_1rm_lb":
        startValue = startBaseline.bench_press_1rm_lb;
        endValue = endBaseline.bench_press_1rm_lb;
        unit = "lb";
        break;
      case "squat_1rm_lb":
        startValue = startBaseline.squat_1rm_lb;
        endValue = endBaseline.squat_1rm_lb;
        unit = "lb";
        break;
      case "deadlift_1rm_lb":
        startValue = startBaseline.deadlift_1rm_lb;
        endValue = endBaseline.deadlift_1rm_lb;
        unit = "lb";
        break;
      case "twelve_minute_distance":
        startValue = startBaseline.twelve_minute_distance;
        endValue = endBaseline.twelve_minute_distance;
        unit = endBaseline.twelve_minute_distance_unit;
        break;
      default:
        return null;
    }

    if (startValue === undefined || endValue === undefined) {
      return null;
    }

    const improvement = endValue - startValue;
    const improvementPercent = (improvement / startValue) * 100;

    return {
      improvement: Math.round(improvement * 100) / 100,
      improvementPercent: Math.round(improvementPercent * 100) / 100,
      startValue,
      endValue,
      unit,
    };
  }

  /**
   * Get current month's baseline (if exists)
   */
  async getCurrentMonth(): Promise<BaselineTestEntry | null> {
    const currentMonth = DateUtils.getMonthKey(DateUtils.getCurrentDate());
    return this.getByMonth(currentMonth);
  }

  /**
   * Check if baseline exists for current month
   */
  async existsForCurrentMonth(): Promise<boolean> {
    const current = await this.getCurrentMonth();
    return current !== null;
  }

  /**
   * Get next suggested test date
   */
  async getNextTestDate(): Promise<string> {
    const latest = await this.getLatest();
    
    if (!latest) {
      return DateUtils.getCurrentDate();
    }

    // Suggest first day of next month
    const lastTestDate = new Date(latest.test_date);
    const nextMonth = new Date(lastTestDate.getFullYear(), lastTestDate.getMonth() + 1, 1);
    
    return nextMonth.toISOString().split("T")[0];
  }

  /**
   * Get baseline statistics
   */
  async getStatistics(): Promise<{
    totalTests: number;
    monthsCovered: number;
    averageTestsPerMonth: number;
    mostRecentTest: string | null;
    oldestTest: string | null;
    completionRate: {
      cardio: number;
      strength: number;
      flexibility: number;
    };
  }> {
    const allBaselines = await this.getAll();
    
    if (allBaselines.length === 0) {
      return {
        totalTests: 0,
        monthsCovered: 0,
        averageTestsPerMonth: 0,
        mostRecentTest: null,
        oldestTest: null,
        completionRate: { cardio: 0, strength: 0, flexibility: 0 },
      };
    }

    const sortedDates = allBaselines
      .map((b) => b.test_date)
      .sort();
    
    const months = new Set(allBaselines.map((b) => b.month));
    
    // Calculate completion rates
    let cardioComplete = 0;
    let strengthComplete = 0;
    let flexibilityComplete = 0;

    allBaselines.forEach((baseline) => {
      // Cardio tests
      if (baseline.rockport_time_mm_ss || baseline.twelve_minute_distance) {
        cardioComplete++;
      }
      
      // Strength tests
      if (baseline.bench_press_1rm_lb || baseline.squat_1rm_lb || 
          baseline.deadlift_1rm_lb || baseline.overhead_press_1rm_lb) {
        strengthComplete++;
      }
      
      // Flexibility tests
      if (baseline.sit_and_reach_inches || baseline.overhead_reach_test_pass) {
        flexibilityComplete++;
      }
    });

    return {
      totalTests: allBaselines.length,
      monthsCovered: months.size,
      averageTestsPerMonth: allBaselines.length / months.size,
      mostRecentTest: sortedDates[sortedDates.length - 1],
      oldestTest: sortedDates[0],
      completionRate: {
        cardio: Math.round((cardioComplete / allBaselines.length) * 100),
        strength: Math.round((strengthComplete / allBaselines.length) * 100),
        flexibility: Math.round((flexibilityComplete / allBaselines.length) * 100),
      },
    };
  }
}
