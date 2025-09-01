"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Scale, 
  Target, 
  TrendingUp, 
  Calendar,
  Activity,
  Heart,
  Plus,
  User,
  Zap
} from "lucide-react";
import { WeightEntry } from "@/components/features/BodyMetrics/WeightEntry";
import { useBodyMetrics } from "@/hooks/useBodyMetrics";
import { useBaselineTesting } from "@/hooks/useBaselineTesting";
import { useGoals } from "@/hooks/useGoals";
import { useSettings } from "@/hooks/useSettings";
import { MetricsAnalysisService } from "@/services/metricsAnalysisService";
import type { CreateData, BodyMetricEntry } from "@/types";

/**
 * Enhanced Baseline page showcasing Stage 6 functionality
 * Following cursor rules for client components and modern UX
 */
export default function BaselinePage() {
  const [showWeightEntry, setShowWeightEntry] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'metrics' | 'tests' | 'goals'>('overview');

  // Hooks
  const { settings } = useSettings();
  const { 
    latestEntry, 
    weightHistory, 
    addWeightEntry, 
    getWeightTrend,
    isLoading: metricsLoading, 
    error: metricsError 
  } = useBodyMetrics();
  
  const { 
    isCurrentMonthComplete,
    isLoading: baselineLoading 
  } = useBaselineTesting();
  
  const { 
    activeGoals, 
    getGoalsNeedingAttention,
    getGoalCompletionRate 
  } = useGoals();

  // Handle weight entry submission
  const handleWeightSave = useCallback(async (entry: CreateData<BodyMetricEntry>) => {
    try {
      await addWeightEntry(entry);
      setShowWeightEntry(false);
    } catch (error) {
      console.error('Failed to save weight entry:', error);
    }
  }, [addWeightEntry]);

  // Calculate health indicators
  const healthIndicators = latestEntry && settings ? 
    MetricsAnalysisService.getHealthIndicators(
      latestEntry,
      undefined, // We would need measurements here
      undefined, // We would need height from settings
      undefined, // We would need age from settings
      undefined, // We would need gender from settings
      settings.unit_system
    ) : null;

  // Get weight trend
  const weightTrend = getWeightTrend(30);

  // Get goal completion rate
  const goalCompletionRate = getGoalCompletionRate();

  // Quick stats for overview
  const quickStats = [
    {
      title: "Current Weight",
      value: latestEntry ? 
        `${latestEntry.body_weight} ${latestEntry.weight_unit}` : 
        "Not set",
      icon: Scale,
      trend: weightTrend.trend !== 'stable' ? weightTrend.trend : undefined,
      trendValue: weightTrend.rate !== 0 ? `${Math.abs(weightTrend.rate).toFixed(1)} ${latestEntry?.weight_unit}/day` : undefined
    },
    {
      title: "BMI",
      value: healthIndicators?.bmi ? 
        `${healthIndicators.bmi.value.toFixed(1)} (${healthIndicators.bmi.category})` : 
        "Needs height",
      icon: Activity,
      status: healthIndicators?.bmi?.category === 'normal' ? 'good' : 
              healthIndicators?.bmi?.category === 'overweight' ? 'warning' : 'info'
    },
    {
      title: "Body Fat",
      value: latestEntry?.body_fat_percent ? 
        `${latestEntry.body_fat_percent.toFixed(1)}%` : 
        "Not tracked",
      icon: User,
      status: latestEntry?.body_fat_percent ? 'good' : undefined
    },
    {
      title: "Monthly Test",
      value: isCurrentMonthComplete ? "Complete" : "Pending",
      icon: Heart,
      status: isCurrentMonthComplete ? 'good' : 'warning'
    },
    {
      title: "Active Goals",
      value: `${activeGoals.length} goals`,
      icon: Target,
      subtitle: `${goalCompletionRate}% completion rate`
    },
    {
      title: "Weight Entries",
      value: `${weightHistory.length} entries`,
      icon: TrendingUp,
      subtitle: weightHistory.length > 0 ? `Since ${weightHistory[0]?.date}` : undefined
    }
  ];

  if (showWeightEntry) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <WeightEntry 
          onSave={handleWeightSave}
          unitSystem={settings?.unit_system || 'imperial'}
          onCancel={() => setShowWeightEntry(false)}
          isLoading={metricsLoading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Body Metrics & Baseline</h1>
            <p className="text-muted-foreground">
              Track your progress with comprehensive body metrics and fitness assessments
            </p>
          </div>
          <Button 
            onClick={() => setShowWeightEntry(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Log Weight
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'metrics', label: 'Body Metrics', icon: Scale },
            { id: 'tests', label: 'Baseline Tests', icon: Heart },
            { id: 'goals', label: 'Goals', icon: Target }
          ].map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection(section.id as 'overview' | 'metrics' | 'tests' | 'goals')}
              className="flex-shrink-0"
            >
              <section.icon className="mr-2 h-3 w-3" />
              {section.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {(metricsError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <Zap className="h-4 w-4" />
              <span>{metricsError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickStats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      {stat.subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                      )}
                      {stat.trend && stat.trendValue && (
                        <div className={`flex items-center gap-1 mt-1 ${
                          stat.trend === 'increasing' ? 'text-red-500' : 'text-green-500'
                        }`}>
                          <TrendingUp className={`h-3 w-3 ${
                            stat.trend === 'decreasing' ? 'rotate-180' : ''
                          }`} />
                          <span className="text-xs">{stat.trendValue}</span>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${
                      stat.status === 'good' ? 'bg-green-100 text-green-600' :
                      stat.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestEntry ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last weigh-in:</span>
                      <span className="font-medium">{latestEntry.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Weight:</span>
                      <span className="font-medium">{latestEntry.body_weight} {latestEntry.weight_unit}</span>
                    </div>
                    {latestEntry.body_fat_percent && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Body fat:</span>
                        <span className="font-medium">{latestEntry.body_fat_percent}%</span>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">30-day trend:</span>
                        <span className={`font-medium ${
                          weightTrend.trend === 'increasing' ? 'text-red-500' :
                          weightTrend.trend === 'decreasing' ? 'text-green-500' :
                          'text-muted-foreground'
                        }`}>
                          {weightTrend.trend} {weightTrend.rate !== 0 && `(${Math.abs(weightTrend.rate).toFixed(2)}/day)`}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No weight data yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setShowWeightEntry(true)}
                    >
                      Add First Entry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goals & Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active goals:</span>
                      <span className="font-medium">{activeGoals.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Completion rate:</span>
                      <span className="font-medium">{goalCompletionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Monthly baseline:</span>
                      <span className={`font-medium ${
                        isCurrentMonthComplete ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {isCurrentMonthComplete ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t space-y-2">
                    {getGoalsNeedingAttention().length > 0 && (
                      <div className="text-sm text-yellow-600">
                        ⚠️ {getGoalsNeedingAttention().length} goals need attention
                      </div>
                    )}
                    {!isCurrentMonthComplete && (
                      <div className="text-sm text-blue-600">
                        📊 Monthly fitness assessment due
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Placeholder sections for other tabs */}
      {activeSection === 'metrics' && (
        <Card>
          <CardHeader>
            <CardTitle>Body Metrics Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3" />
              <p>Comprehensive metrics dashboard coming soon...</p>
              <p className="text-sm mt-2">Will include weight trends, body composition analysis, and measurement tracking</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'tests' && (
        <Card>
          <CardHeader>
            <CardTitle>Baseline Testing Suite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-3" />
              <p>Fitness testing interface coming soon...</p>
              <p className="text-sm mt-2">Will include cardio tests, strength assessments, and progress tracking</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'goals' && (
        <Card>
          <CardHeader>
            <CardTitle>Goal Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3" />
              <p>Goal creation and tracking interface coming soon...</p>
              <p className="text-sm mt-2">Will include SMART goal wizard, progress tracking, and achievement system</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {(metricsLoading || baselineLoading) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading your data...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
