/**
 * Body measurements repository for managing circumference and photo tracking
 * Following cursor rules for repository pattern
 */

import { BaseRepository } from "./base";
import { ValidationService } from "@/validators";
import { DateUtils } from "@/utils/dateUtils";
import type { BodyMeasurement, ProgressPhoto } from "@/types";

export class BodyMeasurementsRepository extends BaseRepository<BodyMeasurement> {
  constructor() {
    super("body-measurements", ValidationService.validateBodyMeasurement);
  }

  /**
   * Get measurements by date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<BodyMeasurement[]> {
    return this.query({
      date: { min: startDate, max: endDate },
    });
  }

  /**
   * Get latest measurements
   */
  async getLatest(): Promise<BodyMeasurement | null> {
    const allMeasurements = await this.getAll();
    
    if (allMeasurements.length === 0) {
      return null;
    }

    return allMeasurements.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }

  /**
   * Get measurements for specific body part progression
   */
  async getPartProgression(
    bodyPart: keyof BodyMeasurement['measurements'],
    days: number = 90
  ): Promise<Array<{ date: string; measurement: number; unit: string }>> {
    const endDate = DateUtils.getCurrentDate();
    const startDate = DateUtils.getDaysAgo(days);
    const measurements = await this.getByDateRange(startDate, endDate);
    
    return measurements
      .filter(m => m.measurements[bodyPart] !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(m => ({
        date: m.date,
        measurement: m.measurements[bodyPart]!,
        unit: m.measurement_unit
      }));
  }

  /**
   * Calculate measurement change over period
   */
  async getMeasurementChange(
    bodyPart: keyof BodyMeasurement['measurements'],
    days: number = 30
  ): Promise<{
    change: number;
    changePercent: number;
    unit: string;
    startMeasurement: number;
    endMeasurement: number;
  } | null> {
    const endDate = DateUtils.getCurrentDate();
    const startDate = DateUtils.getDaysAgo(days);
    
    // Get measurements with some buffer for more accurate start/end points
    const startMeasurements = await this.getByDateRange(
      DateUtils.getDaysAgo(days + 7), 
      startDate
    );
    const endMeasurements = await this.getByDateRange(
      DateUtils.getDaysAgo(7), 
      endDate
    );

    // Filter for measurements that have the specific body part
    const validStartMeasurements = startMeasurements.filter(
      m => m.measurements[bodyPart] !== undefined
    );
    const validEndMeasurements = endMeasurements.filter(
      m => m.measurements[bodyPart] !== undefined
    );

    if (validStartMeasurements.length === 0 || validEndMeasurements.length === 0) {
      return null;
    }

    // Get closest entries to start and end dates
    const startEntry = validStartMeasurements.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    
    const endEntry = validEndMeasurements.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    // Convert to same unit if necessary
    let startMeasurement = startEntry.measurements[bodyPart]!;
    const endMeasurement = endEntry.measurements[bodyPart]!;
    const unit = endEntry.measurement_unit;

    if (startEntry.measurement_unit !== endEntry.measurement_unit) {
      if (endEntry.measurement_unit === "cm" && startEntry.measurement_unit === "in") {
        startMeasurement = startMeasurement * 2.54;
      } else if (endEntry.measurement_unit === "in" && startEntry.measurement_unit === "cm") {
        startMeasurement = startMeasurement / 2.54;
      }
    }

    const change = endMeasurement - startMeasurement;
    const changePercent = (change / startMeasurement) * 100;

    return {
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      unit,
      startMeasurement: Math.round(startMeasurement * 100) / 100,
      endMeasurement: Math.round(endMeasurement * 100) / 100,
    };
  }

  /**
   * Get comprehensive measurement changes for all body parts
   */
  async getAllMeasurementChanges(
    days: number = 30
  ): Promise<Record<string, {
    change: number;
    changePercent: number;
    unit: string;
  }>> {
    const bodyParts: Array<keyof BodyMeasurement['measurements']> = [
      'chest', 'waist', 'hips', 'bicep_left', 'bicep_right', 
      'thigh_left', 'thigh_right', 'neck', 'forearm_left', 
      'forearm_right', 'calf_left', 'calf_right'
    ];

    const changes: Record<string, { change: number; changePercent: number; unit: string }> = {};

    for (const bodyPart of bodyParts) {
      const change = await this.getMeasurementChange(bodyPart, days);
      if (change) {
        changes[bodyPart] = {
          change: change.change,
          changePercent: change.changePercent,
          unit: change.unit
        };
      }
    }

    return changes;
  }

  /**
   * Get measurements for specific date (closest match)
   */
  async getForDate(targetDate: string): Promise<BodyMeasurement | null> {
    const allMeasurements = await this.getAll();
    
    if (allMeasurements.length === 0) {
      return null;
    }

    // Find closest date
    const targetTime = new Date(targetDate).getTime();
    
    let closest = allMeasurements[0];
    let closestDiff = Math.abs(new Date(closest.date).getTime() - targetTime);

    for (const measurement of allMeasurements) {
      const diff = Math.abs(new Date(measurement.date).getTime() - targetTime);
      if (diff < closestDiff) {
        closest = measurement;
        closestDiff = diff;
      }
    }

    return closest;
  }

  /**
   * Get measurement statistics
   */
  async getStatistics(): Promise<{
    totalEntries: number;
    mostTrackedParts: Array<{ part: string; count: number }>;
    averageMeasurements: Partial<BodyMeasurement['measurements']>;
    unit: string;
    dateRange: { start: string; end: string } | null;
  }> {
    const allMeasurements = await this.getAll();
    
    if (allMeasurements.length === 0) {
      return {
        totalEntries: 0,
        mostTrackedParts: [],
        averageMeasurements: {},
        unit: "in",
        dateRange: null,
      };
    }

    // Count measurements for each body part
    const partCounts: Record<string, number> = {};
    const partTotals: Record<string, number> = {};

    allMeasurements.forEach(measurement => {
      Object.entries(measurement.measurements).forEach(([part, value]) => {
        if (value !== undefined) {
          partCounts[part] = (partCounts[part] || 0) + 1;
          partTotals[part] = (partTotals[part] || 0) + value;
        }
      });
    });

    // Calculate averages
    const averageMeasurements: Partial<BodyMeasurement['measurements']> = {};
    Object.entries(partTotals).forEach(([part, total]) => {
      const count = partCounts[part];
      if (count > 0) {
        (averageMeasurements as Record<string, number>)[part] = Math.round((total / count) * 100) / 100;
      }
    });

    // Get most tracked parts
    const mostTrackedParts = Object.entries(partCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([part, count]) => ({ part, count }));

    // Get date range
    const sortedDates = allMeasurements
      .map(m => m.date)
      .sort();

    const dateRange = sortedDates.length > 0
      ? { start: sortedDates[0], end: sortedDates[sortedDates.length - 1] }
      : null;

    // Get most common unit
    const unitCounts = allMeasurements.reduce((counts, measurement) => {
      counts[measurement.measurement_unit] = (counts[measurement.measurement_unit] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostCommonUnit = Object.entries(unitCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "in";

    return {
      totalEntries: allMeasurements.length,
      mostTrackedParts,
      averageMeasurements,
      unit: mostCommonUnit,
      dateRange,
    };
  }

  /**
   * Check if measurements exist for date
   */
  async existsForDate(date: string): Promise<boolean> {
    const measurements = await this.query({ date });
    return measurements.length > 0;
  }
}

/**
 * Progress Photos Repository
 */
export class ProgressPhotosRepository extends BaseRepository<ProgressPhoto> {
  constructor() {
    super("progress-photos", ValidationService.validateProgressPhoto);
  }

  /**
   * Get photos by date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<ProgressPhoto[]> {
    return this.query({
      date: { min: startDate, max: endDate },
    });
  }

  /**
   * Get photos by type
   */
  async getByType(type: "front" | "side" | "back" | "custom"): Promise<ProgressPhoto[]> {
    return this.query({ photo_type: type });
  }

  /**
   * Get photos for specific measurement session
   */
  async getByMeasurementId(measurementId: string): Promise<ProgressPhoto[]> {
    return this.query({ measurements_id: measurementId });
  }

  /**
   * Get latest photos by type
   */
  async getLatestByType(): Promise<Record<string, ProgressPhoto | null>> {
    const allPhotos = await this.getAll();
    const photoTypes = ["front", "side", "back", "custom"];
    
    const latestPhotos: Record<string, ProgressPhoto | null> = {};
    
    photoTypes.forEach(type => {
      const photosOfType = allPhotos.filter(p => p.photo_type === type);
      if (photosOfType.length > 0) {
        latestPhotos[type] = photosOfType.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
      } else {
        latestPhotos[type] = null;
      }
    });

    return latestPhotos;
  }

  /**
   * Get photo comparison data for progress tracking
   */
  async getProgressComparison(
    type: "front" | "side" | "back" | "custom",
    months: number = 6
  ): Promise<ProgressPhoto[]> {
    const endDate = DateUtils.getCurrentDate();
    const startDate = DateUtils.getDaysAgo(months * 30);
    
    const photos = await this.getByDateRange(startDate, endDate);
    
    return photos
      .filter(p => p.photo_type === type)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Clean up old photos (for storage management)
   */
  async cleanupOldPhotos(monthsOld: number = 24): Promise<number> {
    const cutoffDate = DateUtils.getDaysAgo(monthsOld * 30);
    const oldPhotos = await this.getByDateRange("2000-01-01", cutoffDate);
    
    // Keep at least one photo per type per month to maintain progress tracking
    const keepPhotos = new Set<string>();
    const photosByTypeAndMonth = new Map<string, ProgressPhoto[]>();
    
    // Group photos by type and month
    oldPhotos.forEach(photo => {
      const monthKey = photo.date.substring(0, 7); // YYYY-MM
      const typeMonthKey = `${photo.photo_type}-${monthKey}`;
      
      if (!photosByTypeAndMonth.has(typeMonthKey)) {
        photosByTypeAndMonth.set(typeMonthKey, []);
      }
      photosByTypeAndMonth.get(typeMonthKey)!.push(photo);
    });
    
    // Keep the most recent photo from each type/month combination
    photosByTypeAndMonth.forEach(photos => {
      if (photos.length > 0) {
        const mostRecent = photos.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        keepPhotos.add(mostRecent.id);
      }
    });
    
    // Delete photos not in the keep set
    let deletedCount = 0;
    for (const photo of oldPhotos) {
      if (!keepPhotos.has(photo.id)) {
        await this.delete(photo.id);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }
}
