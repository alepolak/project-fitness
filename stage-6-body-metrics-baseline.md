# Stage 6: Body Metrics & Baseline Testing

## Goal
Complete the fitness tracking app with body metrics logging, baseline testing system, progress visualization, data backup/restore, and final polish.

## Duration
3-4 days

## Deliverables

### 1. Body Metrics System
- ✅ Daily body weight logging with quick entry
- ✅ Body fat and muscle percentage tracking (optional)
- ✅ Metrics history with trend visualization
- ✅ Unit conversion and display preferences
- ✅ Notes and context for readings

### 2. Baseline Testing
- ✅ Monthly baseline test scheduling
- ✅ Rockport 1-mile walk test recording
- ✅12-minute distance test tracking
- ✅ Heart rate recovery monitoring
- ✅ Progress comparison and trends

### 3. Home Dashboard
- ✅ Today's workout plan display
- ✅ Quick body weight entry
- ✅ Weekly progress summary
- ✅ "Start Workout" primary action
- ✅ Recent metrics and baseline status

### 4. Data Management
- ✅ Complete data export (JSON with validation)
- ✅ Data import with error handling
- ✅ Monthly backup reminders
- ✅ Data reset and cleanup options
- ✅ Privacy and local-only guarantees

### 5. Final Polish & PWA
- ✅ Error boundaries and graceful failures
- ✅ Loading states and skeleton screens
- ✅ Accessibility improvements
- ✅ Performance optimization
- ✅ PWA setup for offline usage

## Technical Requirements

### Body Metrics Components

#### 1. Quick Weight Entry
```typescript
// components/features/BodyMetrics/QuickWeightEntry.tsx
interface QuickWeightEntryProps {
  onSave: (entry: BodyMetricEntry) => Promise<void>;
  unitSystem: 'imperial' | 'metric';
  placeholder?: number; // Previous or estimated weight
}
```

#### 2. Metrics History
```typescript
// components/features/BodyMetrics/MetricsHistory.tsx
interface MetricsHistoryProps {
  entries: BodyMetricEntry[];
  onEntryEdit: (entry: BodyMetricEntry) => void;
  onEntryDelete: (entryId: string) => void;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  showTrend?: boolean;
}
```

#### 3. Metrics Chart
```typescript
// components/features/BodyMetrics/MetricsChart.tsx
interface MetricsChartProps {
  entries: BodyMetricEntry[];
  metric: 'weight' | 'body_fat' | 'muscle';
  timeRange: 'month' | 'quarter' | 'year';
  unitSystem: 'imperial' | 'metric';
}
```

#### 4. Full Metrics Entry
```typescript
// components/features/BodyMetrics/FullMetricsEntry.tsx
interface FullMetricsEntryProps {
  entry?: BodyMetricEntry;
  onSave: (entry: BodyMetricEntry) => Promise<void>;
  onCancel: () => void;
  unitSystem: 'imperial' | 'metric';
}
```

### Baseline Testing Components

#### 1. Baseline Test Scheduler
```typescript
// components/features/BaselineTesting/BaselineScheduler.tsx
interface BaselineSchedulerProps {
  lastTestDate?: Date;
  onStartTest: (testType: 'rockport' | 'twelve_minute') => void;
  currentMonth: string;
  hasCurrentMonthTest: boolean;
}
```

#### 2. Rockport Test Form
```typescript
// components/features/BaselineTesting/RockportTestForm.tsx
interface RockportTestFormProps {
  onSave: (result: RockportResult) => Promise<void>;
  onCancel: () => void;
  testInstructions: string[];
}

interface RockportResult {
  time_mm_ss: string;
  finish_heart_rate_bpm: number;
  notes?: string;
}
```

#### 3. Twelve Minute Test Form
```typescript
// components/features/BaselineTesting/TwelveMinuteTestForm.tsx
interface TwelveMinuteTestFormProps {
  onSave: (result: TwelveMinuteResult) => Promise<void>;
  onCancel: () => void;
  unitSystem: 'imperial' | 'metric';
  testInstructions: string[];
}

interface TwelveMinuteResult {
  distance: number;
  distance_unit: 'miles' | 'kilometers';
  average_heart_rate_bpm?: number;
  notes?: string;
}
```

#### 4. Baseline Progress View
```typescript
// components/features/BaselineTesting/BaselineProgress.tsx
interface BaselineProgressProps {
  tests: BaselineTestEntry[];
  onTestSelect: (test: BaselineTestEntry) => void;
  showComparison?: boolean;
}
```

### Home Dashboard Components

#### 1. Today's Plan Card
```typescript
// components/features/Home/TodaysPlan.tsx
interface TodaysPlanProps {
  todaysSession?: Session;
  onStartWorkout: () => void;
  completedToday: boolean;
  onViewPlan: () => void;
}
```

#### 2. Progress Summary
```typescript
// components/features/Home/ProgressSummary.tsx
interface ProgressSummaryProps {
  weeklyStats: {
    sessionsCompleted: number;
    totalSessions: number;
    lastWorkout?: Date;
    nextBaseline?: Date;
  };
  recentMetrics?: BodyMetricEntry[];
  onViewDetails: (section: 'workouts' | 'metrics' | 'baseline') => void;
}
```

#### 3. Quick Actions
```typescript
// components/features/Home/QuickActions.tsx
interface QuickActionsProps {
  onQuickWeight: () => void;
  onQuickNote: () => void;
  onStartWorkout: () => void;
  hasActiveSession: boolean;
}
```

### Data Management System

#### 1. Data Export Service
```typescript
// services/dataExportService.ts
export class DataExportService {
  async exportAllData(includeMedia: boolean = false): Promise<string> {
    const exportData = {
      version: DATA_VERSION,
      exported_at: new Date().toISOString(),
      settings: await this.settingsRepo.getSettings(),
      exercises: await this.exerciseRepo.getAll(),
      plans: await this.planRepo.getAll(),
      workouts: await this.workoutRepo.getAll(),
      metrics: await this.metricsRepo.getAll(),
      baseline: await this.baselineRepo.getAll(),
      glossary: await this.glossaryRepo.getAll(),
      media: includeMedia ? await this.exportMedia() : []
    };
    
    // Validate export data
    await this.validateExportData(exportData);
    
    return JSON.stringify(exportData, null, 2);
  }
  
  async importData(jsonData: string): Promise<ImportResult> {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate import data
      const validation = await this.validateImportData(data);
      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }
      
      // Run migrations if needed
      const migratedData = await this.runMigrations(data);
      
      // Import all data
      await this.importAllStores(migratedData);
      
      return { success: true };
    } catch (error) {
      return { success: false, errors: [error.message] };
    }
  }
}

interface ImportResult {
  success: boolean;
  errors?: string[];
  warnings?: string[];
}
```

#### 2. Backup Reminder System
```typescript
// hooks/useBackupReminder.ts
export const useBackupReminder = () => {
  const [shouldShowReminder, setShouldShowReminder] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
  
  useEffect(() => {
    const checkBackupStatus = async () => {
      const lastBackup = localStorage.getItem('last_backup_iso');
      if (lastBackup) {
        const lastDate = new Date(lastBackup);
        setLastBackupDate(lastDate);
        
        // Show reminder if more than 30 days
        const daysSinceBackup = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        setShouldShowReminder(daysSinceBackup > 30);
      } else {
        setShouldShowReminder(true);
      }
    };
    
    checkBackupStatus();
  }, []);
  
  const markBackupComplete = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem('last_backup_iso', now);
    setLastBackupDate(new Date(now));
    setShouldShowReminder(false);
  }, []);
  
  return { shouldShowReminder, lastBackupDate, markBackupComplete };
};
```

### Trend Analysis Utilities

```typescript
// utils/trendAnalysis.ts
export class TrendAnalysis {
  static calculateWeightTrend(entries: BodyMetricEntry[], days: number = 30): TrendResult {
    const recentEntries = this.getRecentEntries(entries, days);
    if (recentEntries.length < 2) return { trend: 'insufficient_data' };
    
    const weights = recentEntries.map(entry => ({
      date: new Date(entry.date),
      weight: UnitConverter.normalizeWeight(entry.body_weight, entry.weight_unit)
    }));
    
    const slope = this.calculateLinearRegression(weights);
    
    return {
      trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
      changePerWeek: slope * 7,
      confidence: this.calculateConfidence(weights)
    };
  }
  
  static calculateBaselineProgress(tests: BaselineTestEntry[]): BaselineProgress {
    const sortedTests = tests.sort((a, b) => a.month.localeCompare(b.month));
    
    const rockportProgress = this.analyzeRockportProgress(sortedTests);
    const distanceProgress = this.analyzeDistanceProgress(sortedTests);
    
    return {
      overall: this.determineOverallProgress(rockportProgress, distanceProgress),
      rockport: rockportProgress,
      distance: distanceProgress,
      recommendations: this.generateRecommendations(rockportProgress, distanceProgress)
    };
  }
  
  private static calculateLinearRegression(data: Array<{date: Date, weight: number}>): number {
    // Implementation of linear regression for trend calculation
  }
}

interface TrendResult {
  trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  changePerWeek?: number;
  confidence?: number;
}

interface BaselineProgress {
  overall: 'improving' | 'maintaining' | 'declining' | 'insufficient_data';
  rockport: TrendResult;
  distance: TrendResult;
  recommendations: string[];
}
```

## File Structure
```
src/
├── components/
│   └── features/
│       ├── BodyMetrics/
│       │   ├── QuickWeightEntry/
│       │   ├── FullMetricsEntry/
│       │   ├── MetricsHistory/
│       │   ├── MetricsChart/
│       │   └── TrendSummary/
│       ├── BaselineTesting/
│       │   ├── BaselineScheduler/
│       │   ├── RockportTestForm/
│       │   ├── TwelveMinuteTestForm/
│       │   ├── BaselineProgress/
│       │   └── TestInstructions/
│       ├── Home/
│       │   ├── TodaysPlan/
│       │   ├── ProgressSummary/
│       │   ├── QuickActions/
│       │   └── WeeklyStats/
│       └── DataManagement/
│           ├── ExportData/
│           ├── ImportData/
│           ├── BackupReminder/
│           └── DataReset/
├── services/
│   ├── dataExportService.ts
│   ├── backupService.ts
│   └── migrationService.ts
├── utils/
│   ├── trendAnalysis.ts
│   ├── baselineCalculations.ts
│   └── progressUtils.ts
└── hooks/
    ├── useBodyMetrics.ts
    ├── useBaselineTesting.ts
    ├── useBackupReminder.ts
    └── useHomeStats.ts
```

## Page Implementation

### Home Page
```typescript
// app/(dashboard)/home/page.tsx
"use client";

export default function HomePage() {
  const { todaysSession, weeklyStats } = useHomeStats();
  const { startWorkout } = useWorkoutSession();
  const { saveQuickWeight } = useBodyMetrics();
  const { shouldShowReminder } = useBackupReminder();
  
  return (
    <div className={styles.homePage}>
      <header className={styles.header}>
        <h1>Today</h1>
        <QuickActions 
          onStartWorkout={startWorkout}
          onQuickWeight={saveQuickWeight}
        />
      </header>
      
      <TodaysPlan 
        todaysSession={todaysSession}
        onStartWorkout={startWorkout}
      />
      
      <ProgressSummary 
        weeklyStats={weeklyStats}
        onViewDetails={handleViewDetails}
      />
      
      {shouldShowReminder && (
        <BackupReminder onBackupComplete={handleBackupComplete} />
      )}
    </div>
  );
}
```

### Baseline Page
```typescript
// app/(dashboard)/baseline/page.tsx
"use client";

export default function BaselinePage() {
  const { tests, saveTest, isLoading } = useBaselineTesting();
  const [activeTest, setActiveTest] = useState<'rockport' | 'twelve_minute' | null>(null);
  
  return (
    <div className={styles.baselinePage}>
      <header className={styles.header}>
        <h1>Baseline Testing</h1>
      </header>
      
      <BaselineScheduler 
        lastTestDate={getLastTestDate(tests)}
        onStartTest={setActiveTest}
        currentMonth={getCurrentMonth()}
        hasCurrentMonthTest={hasTestForCurrentMonth(tests)}
      />
      
      <BaselineProgress 
        tests={tests}
        onTestSelect={handleTestSelect}
        showComparison={true}
      />
      
      {activeTest === 'rockport' && (
        <Dialog open={true} onOpenChange={() => setActiveTest(null)}>
          <RockportTestForm 
            onSave={handleRockportSave}
            onCancel={() => setActiveTest(null)}
          />
        </Dialog>
      )}
      
      {activeTest === 'twelve_minute' && (
        <Dialog open={true} onOpenChange={() => setActiveTest(null)}>
          <TwelveMinuteTestForm 
            onSave={handleDistanceSave}
            onCancel={() => setActiveTest(null)}
            unitSystem={unitSystem}
          />
        </Dialog>
      )}
    </div>
  );
}
```

## Acceptance Criteria

### ✅ Body Metrics
- Quick weight entry works smoothly from home screen
- Full metrics form captures all optional data
- Trends display meaningful progress information
- Unit conversion works consistently
- History shows data clearly with filtering options

### ✅ Baseline Testing
- Monthly test scheduling reminds user appropriately
- Rockport test captures time and heart rate accurately
- 12-minute test captures distance with unit conversion
- Progress comparison shows improvement/decline clearly
- Test instructions are clear and beginner-friendly

### ✅ Home Dashboard
- Today's workout displays correctly and links to start
- Weekly progress summary is accurate and motivating
- Quick actions are accessible and functional
- Recent data displays appropriately
- Overall interface feels complete and polished

### ✅ Data Management
- Export creates valid JSON with all data
- Import validates and handles errors gracefully
- Backup reminders appear at appropriate intervals
- Data reset functionality works safely
- Privacy guarantees are clearly communicated

### ✅ Final Polish
- All error states are handled gracefully
- Loading states show appropriate feedback
- Accessibility meets established standards
- Performance is smooth on mobile devices
- PWA functionality works offline

## Testing Checklist

- [ ] Complete user journey from setup to daily use
- [ ] Body weight quick entry and full metrics form
- [ ] Baseline tests save and display progress correctly
- [ ] Data export/import preserves all information
- [ ] Backup reminder system functions properly
- [ ] Home dashboard shows accurate current state
- [ ] All unit conversions work correctly
- [ ] Trends and progress calculations are accurate
- [ ] Mobile performance is smooth throughout
- [ ] Offline functionality works for core features
- [ ] Error boundaries prevent app crashes
- [ ] Accessibility works with screen readers

## Production Readiness Checklist

- [ ] All TypeScript errors resolved
- [ ] All console warnings addressed
- [ ] Performance optimization completed
- [ ] Bundle size is reasonable for mobile
- [ ] PWA manifest and service worker configured
- [ ] Privacy policy and local-only notices in place
- [ ] User data validation is comprehensive
- [ ] Error tracking configured (local only)
- [ ] Backup and restore tested thoroughly
- [ ] App works completely offline

## Notes

- Focus on completing a polished, production-ready app
- Ensure all safety features for back/quadriceps are prominent
- Test the complete user journey multiple times
- Validate that all masterplan requirements are met
- Document any limitations or future enhancement opportunities
- Prepare deployment and user onboarding materials
