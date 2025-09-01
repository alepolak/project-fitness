# Stage 5: Workout Logging & Execution

## Goal
Build the complete workout execution and logging system with session tracking, set-by-set recording, rest timers, cardio logging, and workout history management.

## Duration
4-5 days

## Deliverables

### 1. Workout Session Flow
- ✅ "Start Workout" from today's plan
- ✅ Session execution interface with exercise progression
- ✅ Set-by-set logging with real-time input
- ✅ Rest timer between sets
- ✅ Session completion and summary

### 2. Strength Exercise Logging
- ✅ Performed set tracking (reps, weight, rest time)
- ✅ Perceived effort selection
- ✅ Pain tracking (back and quadriceps 0-10 scale)
- ✅ Weight and unit conversion
- ✅ Set completion validation

### 3. Cardio Exercise Logging
- ✅ Interval-based cardio tracking
- ✅ Heart rate monitoring (optional inputs)
- ✅ Speed and incline tracking
- ✅ Segment-by-segment logging
- ✅ Real-time interval timer

### 4. Workout History & Analysis
- ✅ Complete workout log list with filtering
- ✅ Exercise-specific history tracking
- ✅ Progress visualization and trends
- ✅ Session comparison and analysis
- ✅ Export/share workout data

### 5. Rest Timer & Session Management
- ✅ Customizable rest timer with notifications
- ✅ Session pause and resume functionality
- ✅ Background timer support
- ✅ Exercise notes and modifications during workout
- ✅ Session abandonment handling

## Technical Requirements

### Workout Session Components

#### 1. Active Session Interface
```typescript
// components/features/WorkoutSession/ActiveSession.tsx
interface ActiveSessionProps {
  session: Session;
  workoutLog: Partial<WorkoutLogEntry>;
  onUpdateLog: (log: Partial<WorkoutLogEntry>) => void;
  onCompleteSession: () => void;
  onPauseSession: () => void;
  onAbandonSession: () => void;
}
```

#### 2. Exercise Card (Active)
```typescript
// components/features/WorkoutSession/ActiveExerciseCard.tsx
interface ActiveExerciseCardProps {
  exercise: ExerciseCatalogItem;
  prescription: ExercisePrescription;
  performedSets: PerformedSet[];
  isActive: boolean;
  onSetComplete: (set: PerformedSet) => void;
  onSetUpdate: (setIndex: number, set: PerformedSet) => void;
  onExerciseComplete: () => void;
}
```

#### 3. Set Logger
```typescript
// components/features/WorkoutSession/SetLogger.tsx
interface SetLoggerProps {
  targetSet: SetPrescription;
  performedSet?: PerformedSet;
  onSetSave: (set: PerformedSet) => void;
  onStartRest: () => void;
  exerciseId: string;
  setIndex: number;
  unitSystem: 'imperial' | 'metric';
}
```

#### 4. Rest Timer
```typescript
// components/features/WorkoutSession/RestTimer.tsx
interface RestTimerProps {
  targetRestSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
  onExtend: (additionalSeconds: number) => void;
  onCancel: () => void;
}
```

#### 5. Cardio Logger
```typescript
// components/features/WorkoutSession/CardioLogger.tsx
interface CardioLoggerProps {
  cardioBlock: CardioBlock;
  onSegmentComplete: (segment: CardioSegment) => void;
  onCardioComplete: (entry: CardioEntry) => void;
  onPause: () => void;
  onResume: () => void;
}
```

### Workout History Components

#### 1. Workout History List
```typescript
// components/features/WorkoutHistory/WorkoutHistoryList.tsx
interface WorkoutHistoryListProps {
  workouts: WorkoutLogEntry[];
  onWorkoutSelect: (workout: WorkoutLogEntry) => void;
  onFilterChange: (filters: WorkoutFilters) => void;
  filters: WorkoutFilters;
}

interface WorkoutFilters {
  exerciseId?: string;
  dateRange?: { start: Date; end: Date };
  sessionType?: string;
  sortBy: 'date' | 'exercise' | 'duration';
  sortOrder: 'asc' | 'desc';
}
```

#### 2. Workout Detail View
```typescript
// components/features/WorkoutHistory/WorkoutDetail.tsx
interface WorkoutDetailProps {
  workout: WorkoutLogEntry;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  showExerciseHistory?: boolean;
}
```

#### 3. Exercise Progress Chart
```typescript
// components/features/WorkoutHistory/ExerciseProgressChart.tsx
interface ExerciseProgressChartProps {
  exerciseId: string;
  workouts: WorkoutLogEntry[];
  metric: 'weight' | 'reps' | 'volume';
  timeRange: 'week' | 'month' | 'quarter' | 'year';
}
```

### Session Management Hooks

```typescript
// hooks/useWorkoutSession.ts
export const useWorkoutSession = (sessionPlan?: Session) => {
  const [currentSession, setCurrentSession] = useState<WorkoutLogEntry | null>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [sessionStatus, setSessionStatus] = useState<'not-started' | 'active' | 'paused' | 'completed'>('not-started');
  
  const startSession = useCallback(async (session: Session) => {
    // Initialize new workout log entry
    const newWorkoutLog: WorkoutLogEntry = {
      id: generateId(),
      date_time_start: new Date().toISOString(),
      session_plan_ref: session.title,
      entries: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1
    };
    setCurrentSession(newWorkoutLog);
    setSessionStatus('active');
  }, []);
  
  const completeSet = useCallback(async (exerciseIndex: number, set: PerformedSet) => {
    // Add set to current session
    // Start rest timer if applicable
  }, [currentSession]);
  
  const completeExercise = useCallback(async (exerciseIndex: number) => {
    // Mark exercise complete, move to next
  }, [activeExerciseIndex]);
  
  const completeSession = useCallback(async (sessionNotes?: string) => {
    // Finalize and save workout log
  }, [currentSession]);
  
  const pauseSession = useCallback(() => {
    setSessionStatus('paused');
  }, []);
  
  const resumeSession = useCallback(() => {
    setSessionStatus('active');
  }, []);
  
  const abandonSession = useCallback(() => {
    // Handle session abandonment
  }, [currentSession]);
  
  return {
    currentSession,
    activeExerciseIndex,
    isResting,
    restTimeRemaining,
    sessionStatus,
    startSession,
    completeSet,
    completeExercise,
    completeSession,
    pauseSession,
    resumeSession,
    abandonSession
  };
};
```

### Rest Timer Hook

```typescript
// hooks/useRestTimer.ts
export const useRestTimer = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  
  const startTimer = useCallback((seconds: number) => {
    setInitialTime(seconds);
    setTimeRemaining(seconds);
    setIsActive(true);
  }, []);
  
  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);
  
  const resumeTimer = useCallback(() => {
    setIsActive(true);
  }, []);
  
  const extendTimer = useCallback((additionalSeconds: number) => {
    setTimeRemaining(prev => prev + additionalSeconds);
  }, []);
  
  const skipTimer = useCallback(() => {
    setIsActive(false);
    setTimeRemaining(0);
  }, []);
  
  // Timer countdown effect
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsActive(false);
          // Trigger notification/sound
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);
  
  return {
    isActive,
    timeRemaining,
    initialTime,
    progress: initialTime > 0 ? (initialTime - timeRemaining) / initialTime : 0,
    startTimer,
    pauseTimer,
    resumeTimer,
    extendTimer,
    skipTimer
  };
};
```

### Workout Analysis Utilities

```typescript
// utils/workoutAnalysis.ts
export class WorkoutAnalysis {
  static calculateVolume(sets: PerformedSet[]): number {
    return sets.reduce((total, set) => {
      const weight = set.weight_value || 0;
      return total + (weight * set.repetitions_done);
    }, 0);
  }
  
  static calculateAverageIntensity(sets: PerformedSet[]): number {
    const efforts = sets.map(set => this.perceivedEffortToNumber(set.perceived_effort_text));
    return efforts.reduce((sum, effort) => sum + effort, 0) / efforts.length;
  }
  
  static perceivedEffortToNumber(effort: string): number {
    const mapping = {
      'very easy': 1,
      'easy': 2,
      'moderately hard': 3,
      'hard': 4,
      'very hard': 5
    };
    return mapping[effort as keyof typeof mapping] || 3;
  }
  
  static getProgressTrend(workouts: WorkoutLogEntry[], exerciseId: string, metric: 'weight' | 'reps' | 'volume'): 'increasing' | 'decreasing' | 'stable' {
    // Analyze trend over recent workouts
  }
  
  static calculateWorkoutDuration(workout: WorkoutLogEntry): number {
    // Calculate total workout duration including rest
  }
  
  static getPersonalRecords(workouts: WorkoutLogEntry[], exerciseId: string): {
    maxWeight: number;
    maxReps: number;
    maxVolume: number;
  } {
    // Find personal records for exercise
  }
}
```

## File Structure
```
src/
├── components/
│   └── features/
│       ├── WorkoutSession/
│       │   ├── ActiveSession/
│       │   ├── ActiveExerciseCard/
│       │   ├── SetLogger/
│       │   ├── RestTimer/
│       │   ├── CardioLogger/
│       │   ├── SessionSummary/
│       │   └── AbandonConfirmation/
│       └── WorkoutHistory/
│           ├── WorkoutHistoryList/
│           ├── WorkoutDetail/
│           ├── WorkoutFilters/
│           ├── ExerciseProgressChart/
│           └── ProgressSummary/
├── hooks/
│   ├── useWorkoutSession.ts
│   ├── useRestTimer.ts
│   ├── useWorkoutHistory.ts
│   └── useProgressTracking.ts
├── utils/
│   ├── workoutAnalysis.ts
│   ├── timerUtils.ts
│   └── progressCalculations.ts
└── services/
    └── workoutService.ts
```

## Page Implementation

### Active Workout Page
```typescript
// app/(dashboard)/workout/active/page.tsx
"use client";

export default function ActiveWorkoutPage() {
  const { currentSession, sessionStatus, startSession, completeSession } = useWorkoutSession();
  const { timeRemaining, startTimer } = useRestTimer();
  
  if (!currentSession) {
    return <StartWorkoutPrompt onStart={startSession} />;
  }
  
  if (sessionStatus === 'completed') {
    return <SessionSummary session={currentSession} />;
  }
  
  return (
    <div className={styles.activeWorkoutPage}>
      <header className={styles.sessionHeader}>
        <h1>Active Workout</h1>
        <Button variant="ghost" onClick={pauseSession}>Pause</Button>
      </header>
      
      <ActiveSession 
        session={currentSession}
        onCompleteSession={completeSession}
      />
      
      {timeRemaining > 0 && (
        <RestTimer 
          timeRemaining={timeRemaining}
          onComplete={() => {/* handle rest complete */}}
        />
      )}
    </div>
  );
}
```

### Workout History Page
```typescript
// app/(dashboard)/log/page.tsx
"use client";

export default function LogPage() {
  const { workouts, filters, updateFilters, isLoading } = useWorkoutHistory();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLogEntry | null>(null);
  
  return (
    <div className={styles.logPage}>
      <header className={styles.header}>
        <h1>Workout History</h1>
        <WorkoutFilters filters={filters} onFiltersChange={updateFilters} />
      </header>
      
      <WorkoutHistoryList 
        workouts={workouts}
        onWorkoutSelect={setSelectedWorkout}
        isLoading={isLoading}
      />
      
      {selectedWorkout && (
        <Sheet open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
          <WorkoutDetail 
            workout={selectedWorkout}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Sheet>
      )}
    </div>
  );
}
```

## Acceptance Criteria

### ✅ Session Execution
- "Start Workout" initiates session correctly from plan
- Exercise progression works smoothly through session
- Set logging captures all required data accurately
- Rest timer functions properly with notifications
- Session completion saves all data correctly

### ✅ Strength Logging
- Weight and rep entry works with unit conversion
- Perceived effort selection is intuitive
- Pain tracking (0-10) captures back and quadriceps discomfort
- Set validation prevents invalid entries
- Previous set data pre-fills for efficiency

### ✅ Cardio Logging
- Interval timer guides through cardio sessions
- Heart rate capture works (optional entries)
- Speed and incline tracking is accurate
- Segment completion progresses correctly
- Real-time feedback during intervals

### ✅ Session Management
- Pause and resume functionality preserves state
- Session abandonment handles data appropriately
- Background operation doesn't lose progress
- Notes and modifications save during workout
- Error recovery handles edge cases

### ✅ History & Analysis
- Workout history displays all sessions clearly
- Filtering by exercise, date, type works correctly
- Progress visualization shows meaningful trends
- Exercise-specific history is comprehensive
- Data export/sharing functions properly

## Testing Checklist

- [ ] Complete workout session end-to-end (start to finish)
- [ ] Rest timer works correctly with all controls
- [ ] Weight unit conversion during logging
- [ ] Perceived effort and pain tracking save correctly
- [ ] Cardio interval progression and timing
- [ ] Session pause/resume preserves all data
- [ ] Workout history filtering and sorting
- [ ] Progress charts display accurate trends
- [ ] Background timer continues when app minimized
- [ ] Session abandonment confirmation and cleanup
- [ ] Mobile touch interactions during workout
- [ ] Data validation prevents corrupted entries

## Notes

- Prioritize smooth workout experience over feature completeness
- Test extensively with real workout scenarios
- Ensure timer works reliably in background
- Focus on mobile usability during active workouts
- Validate data integrity throughout session lifecycle
- Consider offline functionality for workout logging
