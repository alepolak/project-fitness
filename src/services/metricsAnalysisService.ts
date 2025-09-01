"use client";

import type { 
  BodyMetricEntry, 
  BodyMeasurement, 
  MetricsTrend, 
  HealthIndicators,
  FitnessGoal 
} from '@/types';

/**
 * Service for analyzing body metrics and calculating health indicators
 * Following cursor rules for type safety and performance
 */
export class MetricsAnalysisService {
  /**
   * Calculate BMI from weight and height
   */
  static calculateBMI(
    weight: number, 
    height: number, 
    units: 'imperial' | 'metric'
  ): number {
    if (weight <= 0 || height <= 0) {
      throw new Error('Weight and height must be positive numbers');
    }

    let bmi: number;
    
    if (units === 'imperial') {
      // BMI = (weight in pounds × 703) / (height in inches)²
      bmi = (weight * 703) / (height * height);
    } else {
      // BMI = weight in kg / (height in meters)²
      bmi = weight / (height * height);
    }
    
    return Math.round(bmi * 10) / 10;
  }

  /**
   * Get BMI category classification
   */
  static getBMICategory(bmi: number): "underweight" | "normal" | "overweight" | "obese" {
    if (bmi < 18.5) return "underweight";
    if (bmi < 25) return "normal";
    if (bmi < 30) return "overweight";
    return "obese";
  }

  /**
   * Calculate body fat category based on age and gender
   */
  static calculateBodyFatCategory(
    bodyFat: number, 
    _age: number, 
    gender: 'male' | 'female'
  ): "essential" | "athletic" | "fitness" | "average" | "obese" {
    const ranges = gender === 'male' 
      ? { essential: 5, athletic: 13, fitness: 17, average: 25 }
      : { essential: 12, athletic: 20, fitness: 24, average: 31 };

    if (bodyFat <= ranges.essential) return "essential";
    if (bodyFat <= ranges.athletic) return "athletic";
    if (bodyFat <= ranges.fitness) return "fitness";
    if (bodyFat <= ranges.average) return "average";
    return "obese";
  }

  /**
   * Calculate lean body mass
   */
  static calculateLeanBodyMass(weight: number, bodyFatPercent: number): number {
    if (bodyFatPercent < 0 || bodyFatPercent > 100) {
      throw new Error('Body fat percentage must be between 0 and 100');
    }
    
    const leanMass = weight * (1 - bodyFatPercent / 100);
    return Math.round(leanMass * 10) / 10;
  }

  /**
   * Calculate waist-to-hip ratio and risk assessment
   */
  static calculateWaistToHipRatio(
    waist: number, 
    hips: number, 
    gender: 'male' | 'female'
  ): { ratio: number; riskLevel: "low" | "moderate" | "high" } {
    const ratio = waist / hips;
    const roundedRatio = Math.round(ratio * 100) / 100;
    
    let riskLevel: "low" | "moderate" | "high";
    
    if (gender === 'male') {
      if (ratio < 0.95) riskLevel = "low";
      else if (ratio < 1.0) riskLevel = "moderate";
      else riskLevel = "high";
    } else {
      if (ratio < 0.80) riskLevel = "low";
      else if (ratio < 0.85) riskLevel = "moderate";
      else riskLevel = "high";
    }
    
    return { ratio: roundedRatio, riskLevel };
  }

  /**
   * Analyze weight trend over time
   */
  static calculateWeightTrend(
    entries: BodyMetricEntry[], 
    days: number = 30
  ): MetricsTrend {
    if (entries.length < 2) {
      return {
        metric: 'body_weight',
        trend: 'stable',
        rate: 0,
        confidence: 0,
        period_days: days
      };
    }

    // Filter entries within the specified period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentEntries = entries
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (recentEntries.length < 2) {
      return {
        metric: 'body_weight',
        trend: 'stable',
        rate: 0,
        confidence: 0,
        period_days: days
      };
    }

    // Calculate linear regression for trend
    const dataPoints = recentEntries.map((entry, index) => ({
      x: index,
      y: entry.body_weight
    }));

    const { slope, correlation } = this.calculateLinearRegression(dataPoints);
    
    // Convert slope to rate per day
    const ratePerDay = slope;
    let trend: "increasing" | "decreasing" | "stable";
    
    if (Math.abs(ratePerDay) < 0.01) {
      trend = "stable";
    } else if (ratePerDay > 0) {
      trend = "increasing";
    } else {
      trend = "decreasing";
    }

    return {
      metric: 'body_weight',
      trend,
      rate: Math.round(ratePerDay * 1000) / 1000,
      confidence: Math.abs(correlation),
      period_days: days
    };
  }

  /**
   * Predict weight based on current trend
   */
  static predictWeightTrend(
    entries: BodyMetricEntry[], 
    futureDays: number
  ): number | null {
    if (entries.length < 3) return null;

    const trend = this.calculateWeightTrend(entries, 60); // Use 60-day trend
    
    if (trend.confidence < 0.3) return null; // Low confidence
    
    const latestEntry = entries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const predictedWeight = latestEntry.body_weight + (trend.rate * futureDays);
    
    return Math.round(predictedWeight * 10) / 10;
  }

  /**
   * Calculate estimated daily calorie needs
   */
  static calculateCalorieNeeds(
    metrics: BodyMetricEntry,
    height: number, // in inches or cm
    age: number,
    gender: 'male' | 'female',
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active',
    units: 'imperial' | 'metric'
  ): number {
    let weight = metrics.body_weight;
    let heightCm = height;
    
    // Convert to metric if needed
    if (units === 'imperial') {
      weight = weight * 0.453592; // lb to kg
      heightCm = height * 2.54; // inches to cm
    }
    
    // Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * heightCm - 5 * age - 161;
    }
    
    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };
    
    const tdee = bmr * activityMultipliers[activityLevel];
    
    return Math.round(tdee);
  }

  /**
   * Get comprehensive health indicators
   */
  static getHealthIndicators(
    latestMetrics: BodyMetricEntry,
    latestMeasurements?: BodyMeasurement,
    height?: number,
    age?: number,
    gender?: 'male' | 'female',
    units: 'imperial' | 'metric' = 'imperial'
  ): HealthIndicators {
    const indicators: HealthIndicators = {
      bmi: {
        value: 0,
        category: "normal",
        healthy_range: { min: 18.5, max: 24.9 }
      }
    };

    // Calculate BMI if height is available
    if (height) {
      const bmi = this.calculateBMI(latestMetrics.body_weight, height, units);
      indicators.bmi = {
        value: bmi,
        category: this.getBMICategory(bmi),
        healthy_range: { min: 18.5, max: 24.9 }
      };
    }

    // Calculate body fat indicators if available
    if (latestMetrics.body_fat_percent && age && gender) {
      const category = this.calculateBodyFatCategory(
        latestMetrics.body_fat_percent, 
        age, 
        gender
      );
      
      const healthyRanges = gender === 'male' 
        ? { min: 10, max: 20 }
        : { min: 16, max: 24 };
      
      indicators.body_fat = {
        value: latestMetrics.body_fat_percent,
        category,
        healthy_range: healthyRanges
      };
    }

    // Calculate waist-to-hip ratio if measurements available
    if (latestMeasurements?.measurements.waist && 
        latestMeasurements?.measurements.hips && 
        gender) {
      const whrResult = this.calculateWaistToHipRatio(
        latestMeasurements.measurements.waist,
        latestMeasurements.measurements.hips,
        gender
      );
      
      indicators.waist_to_hip_ratio = {
        value: whrResult.ratio,
        risk_level: whrResult.riskLevel
      };
    }

    return indicators;
  }

  /**
   * Calculate goal progress percentage
   */
  static calculateGoalProgress(
    goal: FitnessGoal,
    currentValue: number
  ): { current: number; target: number; percentage: number; onTrack: boolean } {
    if (!goal.target_value) {
      return { current: currentValue, target: 0, percentage: 0, onTrack: false };
    }

    let percentage: number;
    let onTrack = true;
    
    switch (goal.goal_type) {
      case 'target_value':
        if (goal.current_value !== undefined) {
          const totalChange = goal.target_value - goal.current_value;
          const currentChange = currentValue - goal.current_value;
          percentage = totalChange !== 0 ? (currentChange / totalChange) * 100 : 0;
        } else {
          percentage = (currentValue / goal.target_value) * 100;
        }
        break;
        
      case 'increase_by':
        const startValue = goal.current_value || 0;
        const achieved = currentValue - startValue;
        percentage = (achieved / goal.target_value) * 100;
        break;
        
      case 'decrease_by':
        const initialValue = goal.current_value || currentValue;
        const reduction = initialValue - currentValue;
        percentage = (reduction / goal.target_value) * 100;
        break;
        
      default:
        percentage = 0;
    }

    // Check if on track based on timeline
    const now = new Date();
    const startDate = new Date(goal.start_date);
    const targetDate = new Date(goal.target_date);
    const totalDays = (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const expectedProgress = (elapsedDays / totalDays) * 100;
    
    onTrack = percentage >= expectedProgress * 0.8; // 80% threshold
    
    return {
      current: currentValue,
      target: goal.target_value,
      percentage: Math.max(0, Math.min(100, Math.round(percentage * 10) / 10)),
      onTrack
    };
  }

  /**
   * Helper method for linear regression calculation
   */
  private static calculateLinearRegression(
    points: Array<{ x: number; y: number }>
  ): { slope: number; intercept: number; correlation: number } {
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumYY = points.reduce((sum, p) => sum + p.y * p.y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate correlation coefficient
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    const correlation = denominator !== 0 ? numerator / denominator : 0;

    return { slope, intercept, correlation };
  }
}
