# Stage 6: Body Metrics & Baseline Testing

## Goal
Build comprehensive body metrics tracking, baseline fitness testing, and progress monitoring system with monthly assessments, strength standards, cardio benchmarks, and body composition tracking.

## Duration
3-4 days

## Deliverables

### 1. Body Metrics Tracking
- ✅ Daily weight and body composition logging
- ✅ Body measurement tracking (circumferences)
- ✅ Progress visualization with charts and trends
- ✅ Photo comparison system for visual progress
- ✅ BMI and body fat percentage calculations

### 2. Baseline Fitness Testing
- ✅ Monthly cardiovascular fitness tests (Rockport Walk, 12-minute run)
- ✅ Strength baseline testing (1RM calculations and bodyweight exercises)
- ✅ Flexibility and mobility assessments
- ✅ Heart rate recovery and resting HR tracking
- ✅ Test scheduling and reminder system

### 3. Progress Analytics
- ✅ Comprehensive progress dashboard
- ✅ Fitness level classification (beginner, intermediate, advanced)
- ✅ Strength standards comparison (bodyweight ratios)
- ✅ Cardio fitness age calculation
- ✅ Improvement trend analysis and predictions

### 4. Goal Setting & Tracking
- ✅ SMART goal creation with deadlines
- ✅ Target weight and body composition goals
- ✅ Strength and cardio performance targets
- ✅ Progress milestones and achievements
- ✅ Goal adjustment recommendations

### 5. Assessment Tools
- ✅ Guided baseline testing with instructions
- ✅ Form validation and data integrity checks
- ✅ Test condition recording (environment, pre-test prep)
- ✅ Progress photos management with privacy
- ✅ Export capabilities for healthcare providers

## Technical Requirements

### Body Metrics Components

#### 1. Metrics Dashboard
```typescript
// components/features/BodyMetrics/MetricsDashboard.tsx
interface MetricsDashboardProps {
  timeRange: '1month' | '3months' | '6months' | '1year';
  onTimeRangeChange: (range: string) => void;
  showTrends: boolean;
  showGoals: boolean;
}
```

#### 2. Weight Entry Form
```typescript
// components/features/BodyMetrics/WeightEntry.tsx
interface WeightEntryProps {
  onSave: (entry: BodyMetricEntry) => void;
  currentEntry?: BodyMetricEntry;
  unitSystem: 'imperial' | 'metric';
  onCancel?: () => void;
}
```

#### 3. Body Measurements Tracker
```typescript
// components/features/BodyMetrics/MeasurementsTracker.tsx
interface MeasurementsTrackerProps {
  onSave: (measurements: BodyMeasurement) => void;
  currentMeasurements?: BodyMeasurement;
  unitSystem: 'imperial' | 'metric';
  showGuide: boolean;
}
```

#### 4. Progress Charts
```typescript
// components/features/BodyMetrics/ProgressCharts.tsx
interface ProgressChartsProps {
  data: BodyMetricEntry[];
  metric: 'weight' | 'body_fat' | 'muscle_mass';
  timeRange: string;
  showGoal?: boolean;
  goalValue?: number;
}
```

### Baseline Testing Components

#### 1. Test Selection Interface
```typescript
// components/features/BaselineTesting/TestSelector.tsx
interface TestSelectorProps {
  availableTests: BaselineTest[];
  completedTests: string[];
  onSelectTest: (testId: string) => void;
  currentMonth: string;
  isMonthComplete: boolean;
}
```

#### 2. Cardio Test Runner
```typescript
// components/features/BaselineTesting/CardioTestRunner.tsx
interface CardioTestRunnerProps {
  testType: 'rockport' | 'twelve_minute' | 'continuous_jog';
  onComplete: (results: CardioTestResults) => void;
  onCancel: () => void;
  showInstructions: boolean;
}
```

#### 3. Strength Test Calculator
```typescript
// components/features/BaselineTesting/StrengthCalculator.tsx
interface StrengthCalculatorProps {
  exercise: 'bench_press' | 'squat' | 'deadlift' | 'overhead_press';
  onSave: (oneRM: number) => void;
  currentValue?: number;
  bodyWeight: number;
  unitSystem: 'imperial' | 'metric';
}
```

#### 4. Test Instructions Modal
```typescript
// components/features/BaselineTesting/TestInstructions.tsx
interface TestInstructionsProps {
  testType: string;
  isOpen: boolean;
  onClose: () => void;
  onStartTest: () => void;
  equipment?: string[];
  duration?: string;
}
```

### Progress Analytics Components

#### 1. Fitness Level Display
```typescript
// components/features/Analytics/FitnessLevel.tsx
interface FitnessLevelProps {
  currentLevel: 'untrained' | 'novice' | 'intermediate' | 'advanced' | 'elite';
  progressToNext: number;
  category: 'strength' | 'cardio' | 'overall';
  showDetails: boolean;
}
```

#### 2. Improvement Tracker
```typescript
// components/features/Analytics/ImprovementTracker.tsx
interface ImprovementTrackerProps {
  improvements: Array<{
    metric: string;
    change: number;
    changePercent: number;
    period: string;
    trend: 'improving' | 'declining' | 'stable';
  }>;
  timeFrame: '30days' | '90days' | '6months' | '1year';
}
```

#### 3. Standards Comparison
```typescript
// components/features/Analytics/StandardsComparison.tsx
interface StandardsComparisonProps {
  userStats: {
    bodyWeight: number;
    age: number;
    gender: 'male' | 'female';
    lifts: Record<string, number>;
  };
  showPercentiles: boolean;
  category: 'strength' | 'cardio';
}
```

## Data Types

### Enhanced Body Metrics
```typescript
export interface BodyMetricEntry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  body_weight: number;
  weight_unit: 'lb' | 'kg';
  body_fat_percent?: number;
  body_muscle_percent?: number;
  hydration_percent?: number;
  bone_mass?: number;
  visceral_fat_rating?: number;
  metabolic_age?: number;
  notes?: string;
  measurement_device?: string; // Scale model/brand
  measurement_time?: string; // Time of day
  created_at: string;
  updated_at: string;
  version: number;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicep_left?: number;
    bicep_right?: number;
    thigh_left?: number;
    thigh_right?: number;
    neck?: number;
    forearm_left?: number;
    forearm_right?: number;
    calf_left?: number;
    calf_right?: number;
  };
  measurement_unit: 'in' | 'cm';
  measurement_technique?: string;
  notes?: string;
  progress_photo_ids?: string[]; // References to stored photos
  created_at: string;
  updated_at: string;
  version: number;
}
```

### Goal Management
```typescript
export interface FitnessGoal {
  id: string;
  title: string;
  description?: string;
  category: 'weight' | 'strength' | 'cardio' | 'body_composition' | 'custom';
  goal_type: 'target_value' | 'increase_by' | 'decrease_by' | 'maintain';
  
  // Target values
  target_value?: number;
  target_unit?: string;
  current_value?: number;
  
  // Timeline
  start_date: string;
  target_date: string;
  
  // Tracking
  metric_to_track: string; // e.g., 'body_weight', 'bench_press_1rm_lb'
  measurement_frequency: 'daily' | 'weekly' | 'monthly';
  
  // Progress
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  completion_percentage: number;
  
  // Motivation
  why_important?: string;
  reward_for_completion?: string;
  
  created_at: string;
  updated_at: string;
  version: number;
}
```

### Testing Standards
```typescript
export interface StrengthStandard {
  exercise_name: string;
  bodyweight_multiplier: {
    untrained: number;
    novice: number;
    intermediate: number;
    advanced: number;
    elite: number;
  };
  gender: 'male' | 'female';
}

export interface CardioStandard {
  test_name: string;
  age_ranges: Array<{
    min_age: number;
    max_age: number;
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  }>;
  gender: 'male' | 'female';
  unit: string;
  description: string;
}
```

## Custom Hooks

### 1. Body Metrics Hook
```typescript
// hooks/useBodyMetrics.ts
export interface UseBodyMetricsReturn {
  // Current data
  latestEntry: BodyMetricEntry | null;
  latestMeasurements: BodyMeasurement | null;
  
  // Historical data
  weightHistory: BodyMetricEntry[];
  measurementHistory: BodyMeasurement[];
  
  // Actions
  addWeightEntry: (entry: Omit<BodyMetricEntry, 'id' | 'created_at' | 'updated_at' | 'version'>) => Promise<void>;
  addMeasurements: (measurements: Omit<BodyMeasurement, 'id' | 'created_at' | 'updated_at' | 'version'>) => Promise<void>;
  deleteEntry: (id: string, type: 'weight' | 'measurements') => Promise<void>;
  
  // Analytics
  getWeightTrend: (days: number) => { trend: 'increasing' | 'decreasing' | 'stable'; rate: number };
  getBMI: () => number | null;
  getBodyFatTrend: (days: number) => { trend: 'increasing' | 'decreasing' | 'stable'; rate: number };
  
  // State
  isLoading: boolean;
  error: string | null;
}
```

### 2. Baseline Testing Hook
```typescript
// hooks/useBaselineTesting.ts
export interface UseBaselineTestingReturn {
  // Current month data
  currentMonthBaseline: BaselineTestEntry | null;
  isCurrentMonthComplete: boolean;
  
  // Testing
  startTest: (testType: string) => void;
  saveTestResults: (results: Partial<BaselineTestEntry>) => Promise<void>;
  
  // Progress tracking
  getStrengthProgress: (exercise: string) => Array<{ month: string; value: number }>;
  getCardioProgress: (testType: string) => Array<{ month: string; value: number; unit?: string }>;
  
  // Analysis
  getFitnessLevel: (category: 'strength' | 'cardio') => 'untrained' | 'novice' | 'intermediate' | 'advanced' | 'elite';
  getImprovementStats: (testType: string, months?: number) => ImprovementStats | null;
  
  // Scheduling
  getNextTestDate: () => string;
  getTestReminders: () => Array<{ testType: string; dueDate: string; overdue: boolean }>;
  
  // State
  activeTest: string | null;
  isLoading: boolean;
  error: string | null;
}
```

### 3. Goals Management Hook
```typescript
// hooks/useGoals.ts
export interface UseGoalsReturn {
  // Goals data
  activeGoals: FitnessGoal[];
  completedGoals: FitnessGoal[];
  
  // Actions
  createGoal: (goal: Omit<FitnessGoal, 'id' | 'created_at' | 'updated_at' | 'version'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<FitnessGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Progress
  updateGoalProgress: (goalId: string) => Promise<void>;
  getGoalProgress: (goalId: string) => { current: number; target: number; percentage: number };
  
  // Analytics
  getGoalsNeedingAttention: () => FitnessGoal[];
  getGoalCompletionRate: () => number;
  
  // State
  isLoading: boolean;
  error: string | null;
}
```

## Services & Utilities

### 1. Metrics Analysis Service
```typescript
// services/metricsAnalysisService.ts
export class MetricsAnalysisService {
  static calculateBMI(weight: number, height: number, units: 'imperial' | 'metric'): number;
  static calculateBodyFatCategory(bodyFat: number, age: number, gender: 'male' | 'female'): string;
  static calculateLeanBodyMass(weight: number, bodyFat: number): number;
  static predictWeightTrend(entries: BodyMetricEntry[], days: number): number;
  static calculateCalorieNeeds(metrics: BodyMetricEntry, activity: string): number;
}
```

### 2. Fitness Standards Service
```typescript
// services/fitnessStandardsService.ts
export class FitnessStandardsService {
  static getStrengthLevel(lift: number, bodyWeight: number, exercise: string, gender: 'male' | 'female'): string;
  static getCardioFitnessAge(testResult: number, age: number, gender: 'male' | 'female'): number;
  static getPercentileRank(value: number, standards: number[]): number;
  static getNextLevelTarget(current: number, currentLevel: string, exercise: string): number;
}
```

## Implementation Plan

### Day 1: Core Infrastructure
1. **Enhance type definitions** - Complete body metrics and goal types
2. **Update repositories** - Add methods for complex queries and analytics
3. **Create base services** - Metrics analysis and fitness standards
4. **Set up validation schemas** - Ajv validators for all new data types

### Day 2: Body Metrics System
1. **Metrics dashboard** - Weight trends, body composition, measurements
2. **Entry forms** - Weight logging, body measurements, progress photos
3. **Progress charts** - Interactive charts with goal overlays
4. **BMI and health calculators** - Real-time health indicators

### Day 3: Baseline Testing
1. **Test selection interface** - Monthly test calendar and progress
2. **Cardio test runners** - Rockport walk, 12-minute run timers
3. **Strength calculators** - 1RM estimation and bodyweight tests
4. **Results analysis** - Fitness level classification and improvement tracking

### Day 4: Goals & Analytics
1. **Goal creation wizard** - SMART goal setup with templates
2. **Progress tracking** - Automated progress updates and milestone detection
3. **Analytics dashboard** - Comprehensive fitness overview
4. **Achievement system** - Progress badges and completion rewards

## Quality Standards

### Performance Requirements
- **Chart rendering**: < 200ms for 1 year of data
- **Data queries**: < 100ms for progress calculations
- **Image handling**: Lazy loading for progress photos
- **Background calculations**: Web Workers for complex analytics

### Accessibility Requirements
- **Chart alternatives**: Data tables for screen readers
- **Touch targets**: 44px minimum for mobile controls
- **Color coding**: High contrast with pattern alternatives
- **Voice input**: Support for metric entry via speech

### Data Privacy
- **Local storage only**: No cloud sync for body metrics
- **Photo encryption**: Client-side encryption for progress photos
- **Data export**: Full user control over personal data
- **Selective sharing**: Choose what metrics to include in exports

## Testing Strategy

### Unit Tests
- Metrics calculation functions
- Fitness standards classification
- Goal progress calculations
- Data validation schemas

### Integration Tests
- Repository data flow
- Chart component rendering
- Form validation and submission
- Photo storage and retrieval

### User Testing
- Baseline testing workflow
- Goal setting experience
- Progress tracking usability
- Data entry efficiency
