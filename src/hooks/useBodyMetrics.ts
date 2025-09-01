"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  metricsRepository, 
  bodyMeasurementsRepository 
} from '@/repositories';
import { MetricsAnalysisService } from '@/services/metricsAnalysisService';
import type { 
  BodyMetricEntry, 
  BodyMeasurement, 
  MetricsTrend,
  CreateData
} from '@/types';

export interface UseBodyMetricsReturn {
  // Current data
  latestEntry: BodyMetricEntry | null;
  latestMeasurements: BodyMeasurement | null;
  
  // Historical data
  weightHistory: BodyMetricEntry[];
  measurementHistory: BodyMeasurement[];
  
  // Actions
  addWeightEntry: (entry: CreateData<BodyMetricEntry>) => Promise<void>;
  addMeasurements: (measurements: CreateData<BodyMeasurement>) => Promise<void>;
  updateWeightEntry: (id: string, updates: Partial<BodyMetricEntry>) => Promise<void>;
  updateMeasurements: (id: string, updates: Partial<BodyMeasurement>) => Promise<void>;
  deleteEntry: (id: string, type: 'weight' | 'measurements') => Promise<void>;
  
  // Analytics
  getWeightTrend: (days: number) => MetricsTrend;
  getBMI: () => number | null;
  getBodyFatTrend: (days: number) => MetricsTrend;
  getMeasurementChange: (bodyPart: keyof BodyMeasurement['measurements'], days: number) => Promise<{
    change: number;
    changePercent: number;
    unit: string;
  } | null>;
  
  // State
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for managing body metrics
 * Following cursor rules for state management and type safety
 */
export const useBodyMetrics = (): UseBodyMetricsReturn => {
  // State
  const [latestEntry, setLatestEntry] = useState<BodyMetricEntry | null>(null);
  const [latestMeasurements, setLatestMeasurements] = useState<BodyMeasurement | null>(null);
  const [weightHistory, setWeightHistory] = useState<BodyMetricEntry[]>([]);
  const [measurementHistory, setMeasurementHistory] = useState<BodyMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate unique ID
  const generateId = useCallback(() => crypto.randomUUID(), []);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load latest entries
      const [latestMetric, latestMeasurement] = await Promise.all([
        metricsRepository.getLatest(),
        bodyMeasurementsRepository.getLatest()
      ]);

      setLatestEntry(latestMetric);
      setLatestMeasurements(latestMeasurement);

      // Load historical data (last 6 months)
      const [weightData, measurementData] = await Promise.all([
        metricsRepository.getRecentMetrics(180),
        bodyMeasurementsRepository.getByDateRange(
          new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        )
      ]);

      setWeightHistory(weightData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setMeasurementHistory(measurementData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load body metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add weight entry
  const addWeightEntry = useCallback(async (entry: CreateData<BodyMetricEntry>) => {
    try {
      setError(null);
      
      const newEntry: BodyMetricEntry = {
        ...entry,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1
      };

      await metricsRepository.save(newEntry);
      
      // Update local state
      setLatestEntry(newEntry);
      setWeightHistory(prev => [...prev, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save weight entry');
      throw err;
    }
  }, [generateId]);

  // Add measurements
  const addMeasurements = useCallback(async (measurements: CreateData<BodyMeasurement>) => {
    try {
      setError(null);
      
      const newMeasurement: BodyMeasurement = {
        ...measurements,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1
      };

      await bodyMeasurementsRepository.save(newMeasurement);
      
      // Update local state
      setLatestMeasurements(newMeasurement);
      setMeasurementHistory(prev => [...prev, newMeasurement].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save measurements');
      throw err;
    }
  }, [generateId]);

  // Update weight entry
  const updateWeightEntry = useCallback(async (id: string, updates: Partial<BodyMetricEntry>) => {
    try {
      setError(null);
      
      const existing = await metricsRepository.getById(id);
      if (!existing) {
        throw new Error('Weight entry not found');
      }

      const updated = await metricsRepository.update(id, updates);
      
      // Update local state
      if (latestEntry?.id === id) {
        setLatestEntry(updated);
      }
      setWeightHistory(prev => prev.map(entry => entry.id === id ? updated : entry));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update weight entry');
      throw err;
    }
  }, [latestEntry]);

  // Update measurements
  const updateMeasurements = useCallback(async (id: string, updates: Partial<BodyMeasurement>) => {
    try {
      setError(null);
      
      const existing = await bodyMeasurementsRepository.getById(id);
      if (!existing) {
        throw new Error('Measurements not found');
      }

      const updated = await bodyMeasurementsRepository.update(id, updates);
      
      // Update local state
      if (latestMeasurements?.id === id) {
        setLatestMeasurements(updated);
      }
      setMeasurementHistory(prev => prev.map(measurement => measurement.id === id ? updated : measurement));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update measurements');
      throw err;
    }
  }, [latestMeasurements]);

  // Delete entry
  const deleteEntry = useCallback(async (id: string, type: 'weight' | 'measurements') => {
    try {
      setError(null);
      
      if (type === 'weight') {
        await metricsRepository.delete(id);
        
        // Update local state
        if (latestEntry?.id === id) {
          // Find next latest entry
          const remaining = weightHistory.filter(entry => entry.id !== id);
          const newLatest = remaining.length > 0 
            ? remaining.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
            : null;
          setLatestEntry(newLatest);
        }
        setWeightHistory(prev => prev.filter(entry => entry.id !== id));
        
      } else {
        await bodyMeasurementsRepository.delete(id);
        
        // Update local state
        if (latestMeasurements?.id === id) {
          // Find next latest measurement
          const remaining = measurementHistory.filter(measurement => measurement.id !== id);
          const newLatest = remaining.length > 0 
            ? remaining.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
            : null;
          setLatestMeasurements(newLatest);
        }
        setMeasurementHistory(prev => prev.filter(measurement => measurement.id !== id));
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      throw err;
    }
  }, [latestEntry, latestMeasurements, weightHistory, measurementHistory]);

  // Get weight trend
  const getWeightTrend = useCallback((days: number = 30): MetricsTrend => {
    return MetricsAnalysisService.calculateWeightTrend(weightHistory, days);
  }, [weightHistory]);

  // Get BMI
  const getBMI = useCallback((): number | null => {
    if (!latestEntry || !latestEntry.body_weight) {
      return null;
    }

    // We would need height from user settings or separate height tracking
    // For now, return null if height is not available
    // This could be enhanced to get height from user profile
    return null;
  }, [latestEntry]);

  // Get body fat trend
  const getBodyFatTrend = useCallback((days: number = 30): MetricsTrend => {
    const bodyFatEntries = weightHistory.filter(entry => entry.body_fat_percent !== undefined);
    
    if (bodyFatEntries.length < 2) {
      return {
        metric: 'body_fat_percent',
        trend: 'stable',
        rate: 0,
        confidence: 0,
        period_days: days
      };
    }

    // Calculate trend similar to weight trend but for body fat
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentEntries = bodyFatEntries
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (recentEntries.length < 2) {
      return {
        metric: 'body_fat_percent',
        trend: 'stable',
        rate: 0,
        confidence: 0,
        period_days: days
      };
    }

    const firstEntry = recentEntries[0];
    const lastEntry = recentEntries[recentEntries.length - 1];
    const daysDiff = (new Date(lastEntry.date).getTime() - new Date(firstEntry.date).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff === 0) {
      return {
        metric: 'body_fat_percent',
        trend: 'stable',
        rate: 0,
        confidence: 0,
        period_days: days
      };
    }

    const change = lastEntry.body_fat_percent! - firstEntry.body_fat_percent!;
    const ratePerDay = change / daysDiff;
    
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(ratePerDay) < 0.01) {
      trend = 'stable';
    } else if (ratePerDay > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    return {
      metric: 'body_fat_percent',
      trend,
      rate: Math.round(ratePerDay * 1000) / 1000,
      confidence: recentEntries.length / days, // Simple confidence based on data density
      period_days: days
    };
  }, [weightHistory]);

  // Get measurement change
  const getMeasurementChange = useCallback(async (
    bodyPart: keyof BodyMeasurement['measurements'], 
    days: number = 30
  ) => {
    return bodyMeasurementsRepository.getMeasurementChange(bodyPart, days);
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    // Current data
    latestEntry,
    latestMeasurements,
    
    // Historical data
    weightHistory,
    measurementHistory,
    
    // Actions
    addWeightEntry,
    addMeasurements,
    updateWeightEntry,
    updateMeasurements,
    deleteEntry,
    
    // Analytics
    getWeightTrend,
    getBMI,
    getBodyFatTrend,
    getMeasurementChange,
    
    // State
    isLoading,
    error,
    refreshData
  };
};
