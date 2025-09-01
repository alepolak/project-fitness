/**
 * Metrics repository for managing body measurements
 * Following cursor rules for repository pattern
 */

import { BaseRepository } from "./base";
import { ValidationService } from "@/validators";
import { DateUtils } from "@/utils/dateUtils";
import type { BodyMetricEntry } from "@/types";

export class MetricsRepository extends BaseRepository<BodyMetricEntry> {
  constructor() {
    super("metrics", ValidationService.validateBodyMetricEntry);
  }

  /**
   * Get metrics by date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<BodyMetricEntry[]> {
    return this.query({
      date: { min: startDate, max: endDate },
    });
  }

  /**
   * Get latest metric entry
   */
  async getLatest(): Promise<BodyMetricEntry | null> {
    const allMetrics = await this.getAll();
    
    if (allMetrics.length === 0) {
      return null;
    }

    return allMetrics.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }

  /**
   * Get metrics for specific month
   */
  async getMonthMetrics(year: number, month: number): Promise<BodyMetricEntry[]> {
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
    const endDate = DateUtils.addDays(
      DateUtils.addDays(startDate, 32),
      -1
    ).substring(0, 7) + "-31"; // Last day of month

    return this.getByDateRange(startDate, endDate);
  }

  /**
   * Get recent metrics
   */
  async getRecentMetrics(days: number = 30): Promise<BodyMetricEntry[]> {
    const endDate = DateUtils.getCurrentDate();
    const startDate = DateUtils.getDaysAgo(days);
    
    return this.getByDateRange(startDate, endDate);
  }

  /**
   * Get weight progression data
   */
  async getWeightProgression(
    days: number = 90
  ): Promise<Array<{ date: string; weight: number; unit: string }>> {
    const metrics = await this.getRecentMetrics(days);
    
    return metrics
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((metric) => ({
        date: metric.date,
        weight: metric.body_weight,
        unit: metric.weight_unit,
      }));
  }

  /**
   * Get body fat progression
   */
  async getBodyFatProgression(
    days: number = 90
  ): Promise<Array<{ date: string; bodyFat: number }>> {
    const metrics = await this.getRecentMetrics(days);
    
    return metrics
      .filter((metric) => metric.body_fat_percent !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((metric) => ({
        date: metric.date,
        bodyFat: metric.body_fat_percent!,
      }));
  }

  /**
   * Calculate weight change over period
   */
  async getWeightChange(days: number = 30): Promise<{
    change: number;
    changePercent: number;
    unit: string;
    startWeight: number;
    endWeight: number;
  } | null> {
    const endDate = DateUtils.getCurrentDate();
    const startDate = DateUtils.getDaysAgo(days);
    
    const startMetrics = await this.getByDateRange(
      DateUtils.getDaysAgo(days + 7), // Give some buffer
      startDate
    );
    const endMetrics = await this.getByDateRange(
      DateUtils.getDaysAgo(7), // Recent entries
      endDate
    );

    if (startMetrics.length === 0 || endMetrics.length === 0) {
      return null;
    }

    // Get closest entries to start and end dates
    const startEntry = startMetrics.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    
    const endEntry = endMetrics.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    // Convert to same unit
    let startWeight = startEntry.body_weight;
    const endWeight = endEntry.body_weight;
    const unit = endEntry.weight_unit;

    if (startEntry.weight_unit !== endEntry.weight_unit) {
      if (endEntry.weight_unit === "kg" && startEntry.weight_unit === "lb") {
        startWeight = startWeight / 2.205;
      } else if (endEntry.weight_unit === "lb" && startEntry.weight_unit === "kg") {
        startWeight = startWeight * 2.205;
      }
    }

    const change = endWeight - startWeight;
    const changePercent = (change / startWeight) * 100;

    return {
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      unit,
      startWeight: Math.round(startWeight * 100) / 100,
      endWeight: Math.round(endWeight * 100) / 100,
    };
  }

  /**
   * Get metric statistics
   */
  async getStatistics(): Promise<{
    totalEntries: number;
    averageWeight: number;
    weightUnit: string;
    averageBodyFat?: number;
    averageMuscleMass?: number;
    dateRange: { start: string; end: string } | null;
  }> {
    const allMetrics = await this.getAll();
    
    if (allMetrics.length === 0) {
      return {
        totalEntries: 0,
        averageWeight: 0,
        weightUnit: "lb",
        dateRange: null,
      };
    }

    // Calculate averages
    const totalWeight = allMetrics.reduce((sum, metric) => {
      let weight = metric.body_weight;
      // Convert all to pounds for consistency
      if (metric.weight_unit === "kg") {
        weight = weight * 2.205;
      }
      return sum + weight;
    }, 0);

    const bodyFatEntries = allMetrics.filter((m) => m.body_fat_percent !== undefined);
    const muscleMassEntries = allMetrics.filter((m) => m.body_muscle_percent !== undefined);

    const averageBodyFat = bodyFatEntries.length > 0
      ? bodyFatEntries.reduce((sum, m) => sum + m.body_fat_percent!, 0) / bodyFatEntries.length
      : undefined;

    const averageMuscleMass = muscleMassEntries.length > 0
      ? muscleMassEntries.reduce((sum, m) => sum + m.body_muscle_percent!, 0) / muscleMassEntries.length
      : undefined;

    // Get date range
    const sortedDates = allMetrics
      .map((m) => m.date)
      .sort();

    const dateRange = sortedDates.length > 0
      ? { start: sortedDates[0], end: sortedDates[sortedDates.length - 1] }
      : null;

    // Use most common unit
    const unitCounts = allMetrics.reduce((counts, metric) => {
      counts[metric.weight_unit] = (counts[metric.weight_unit] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostCommonUnit = Object.entries(unitCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "lb";

    return {
      totalEntries: allMetrics.length,
      averageWeight: Math.round((totalWeight / allMetrics.length) * 100) / 100,
      weightUnit: mostCommonUnit,
      averageBodyFat: averageBodyFat ? Math.round(averageBodyFat * 100) / 100 : undefined,
      averageMuscleMass: averageMuscleMass ? Math.round(averageMuscleMass * 100) / 100 : undefined,
      dateRange,
    };
  }

  /**
   * Get metric entry for specific date (closest match)
   */
  async getForDate(targetDate: string): Promise<BodyMetricEntry | null> {
    const allMetrics = await this.getAll();
    
    if (allMetrics.length === 0) {
      return null;
    }

    // Find closest date
    const targetTime = new Date(targetDate).getTime();
    
    let closest = allMetrics[0];
    let closestDiff = Math.abs(new Date(closest.date).getTime() - targetTime);

    for (const metric of allMetrics) {
      const diff = Math.abs(new Date(metric.date).getTime() - targetTime);
      if (diff < closestDiff) {
        closest = metric;
        closestDiff = diff;
      }
    }

    return closest;
  }

  /**
   * Check if metric exists for date
   */
  async existsForDate(date: string): Promise<boolean> {
    const metrics = await this.query({ date });
    return metrics.length > 0;
  }

  /**
   * Get missing metric dates in range
   */
  async getMissingDates(startDate: string, endDate: string): Promise<string[]> {
    const existingMetrics = await this.getByDateRange(startDate, endDate);
    const existingDates = new Set(existingMetrics.map((m) => m.date));
    
    const allDates = DateUtils.generateDateRange(startDate, endDate);
    
    return allDates.filter((date) => !existingDates.has(date));
  }
}
