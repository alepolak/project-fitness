/**
 * Formatting utilities for user-friendly data display
 * Following cursor rules for beginner-friendly interface
 */

import type {
  ExercisePrescription,
  ExerciseCatalogItem,
  PerformedSet,
  CardioSegment,
} from "@/types";
import { UnitConverter } from "./units";

export class FriendlyFormatter {
  // Format exercise prescription for display
  static exerciseDescription(
    prescription: ExercisePrescription,
    exercise: ExerciseCatalogItem,
    userUnitSystem: "imperial" | "metric" = "imperial"
  ): string {
    let description = exercise.beginner_friendly_name || exercise.name;

    if (prescription.sets && prescription.sets.length > 0) {
      const setInfo = prescription.sets[0];
      const reps = this.formatRepRange(setInfo.target_repetitions);
      
      if (setInfo.target_weight_value && setInfo.target_weight_unit) {
        const weight = this.formatWeightDisplay(
          setInfo.target_weight_value,
          setInfo.target_weight_unit,
          userUnitSystem
        );
        description += ` - ${prescription.sets.length} sets of ${reps} at ${weight}`;
      } else {
        description += ` - ${prescription.sets.length} sets of ${reps}`;
      }

      if (setInfo.rest_seconds) {
        const restTime = this.timeToReadable(setInfo.rest_seconds);
        description += `, rest ${restTime}`;
      }
    }

    return description;
  }

  // Format rep ranges
  private static formatRepRange(reps: number | { min: number; max: number }): string {
    if (typeof reps === "number") {
      return `${reps} reps`;
    } else {
      return `${reps.min}-${reps.max} reps`;
    }
  }

  // Format weight with appropriate unit
  static formatWeightDisplay(
    value: number,
    unit: "lb" | "kg",
    targetUnit: "imperial" | "metric"
  ): string {
    const targetWeightUnit = targetUnit === "imperial" ? "lb" : "kg";
    const converted = UnitConverter.convertWeight(value, unit, targetWeightUnit, "dumbbell");
    const unitDisplay = UnitConverter.getUnitDisplay(targetWeightUnit);
    
    return `${converted} ${unitDisplay}`;
  }

  // Format perceived effort for display
  static perceivedEffortText(level: string | number): string {
    if (typeof level === "string") {
      return level;
    }

    const effortMap: Record<number, string> = {
      1: "very easy",
      2: "easy", 
      3: "moderately easy",
      4: "moderately hard",
      5: "hard",
      6: "hard",
      7: "very hard",
      8: "very hard",
      9: "extremely hard",
      10: "maximum effort",
    };

    return effortMap[level] || "unknown";
  }

  // Convert seconds to readable time format
  static timeToReadable(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 
        ? `${minutes}m ${remainingSeconds}s`
        : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 
        ? `${hours}h ${minutes}m`
        : `${hours}h`;
    }
  }

  // Format time from MM:SS string
  static formatTimeFromString(timeString: string): string {
    const [minutes, seconds] = timeString.split(":").map(Number);
    if (isNaN(minutes) || isNaN(seconds)) {
      return timeString;
    }
    return this.timeToReadable(minutes * 60 + seconds);
  }

  // Format workout summary
  static formatWorkoutSummary(
    totalSets: number,
    totalReps: number,
    duration: number,
    averageRating?: number
  ): string {
    const durationText = this.timeToReadable(duration);
    let summary = `${totalSets} sets, ${totalReps} reps in ${durationText}`;
    
    if (averageRating) {
      const ratingText = this.formatWorkoutRating(averageRating);
      summary += ` • ${ratingText}`;
    }
    
    return summary;
  }

  // Format workout rating
  static formatWorkoutRating(rating: number): string {
    const ratingMap: Record<number, string> = {
      1: "😔 Tough day",
      2: "😐 Below average", 
      3: "😊 Good workout",
      4: "😄 Great session",
      5: "🔥 Crushing it!",
    };

    return ratingMap[Math.round(rating)] || "Not rated";
  }

  // Format set performance summary
  static formatSetSummary(performedSet: PerformedSet, unitSystem: "imperial" | "metric"): string {
    let summary = `${performedSet.repetitions_done} reps`;
    
    if (performedSet.weight_value && performedSet.weight_unit) {
      const weight = this.formatWeightDisplay(
        performedSet.weight_value,
        performedSet.weight_unit,
        unitSystem
      );
      summary += ` @ ${weight}`;
    }
    
    if (performedSet.perceived_effort_text) {
      const effort = performedSet.perceived_effort_text;
      summary += ` • ${effort}`;
    }
    
    return summary;
  }

  // Format cardio segment summary
  static formatCardioSummary(segment: CardioSegment): string {
    const duration = this.timeToReadable(segment.duration_seconds);
    let summary = `${segment.label}: ${duration}`;
    
    if (segment.distance_value && segment.distance_unit) {
      summary += ` • ${segment.distance_value} ${segment.distance_unit}`;
    }
    
    if (segment.speed_mph_or_kph) {
      const speedUnit = segment.distance_unit === "miles" ? "mph" : "kph";
      summary += ` • ${segment.speed_mph_or_kph} ${speedUnit}`;
    }
    
    if (segment.average_heart_rate_bpm) {
      summary += ` • ${segment.average_heart_rate_bpm} bpm avg`;
    }
    
    return summary;
  }

  // Format date for display
  static formatDate(dateString: string, format: "short" | "long" | "relative" = "short"): string {
    const date = new Date(dateString);
    const now = new Date();
    
    if (format === "relative") {
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    }
    
    const options: Intl.DateTimeFormatOptions = format === "long" 
      ? { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" };
    
    return date.toLocaleDateString("en-US", options);
  }

  // Format number with appropriate precision
  static formatNumber(value: number, decimals: number = 1): string {
    return value.toFixed(decimals).replace(/\.?0+$/, "");
  }

  // Format body weight for display
  static formatBodyWeight(weight: number, unit: "lb" | "kg"): string {
    const formatted = this.formatNumber(weight, 1);
    const unitDisplay = UnitConverter.getUnitDisplay(unit);
    return `${formatted} ${unitDisplay}`;
  }

  // Format body fat percentage
  static formatBodyFatPercentage(percentage: number): string {
    return `${this.formatNumber(percentage, 1)}%`;
  }
}
