# Stage 4: Workout Planning System

## Goal
Build the comprehensive workout planning system with phase/week/day structure, session editor, exercise prescription management, and friendly sentence generation.

## Duration
4-5 days

## Deliverables

### 1. Plan Structure Management
- ✅ Phase-based program organization (Base, Build, Peak)
- ✅ Week and day management within phases
- ✅ Session scheduling and calendar view
- ✅ Plan templates and duplication
- ✅ Plan versioning and history

### 2. Session Editor
- ✅ Session type selection (strength, intervals, steady walk, etc.)
- ✅ Exercise prescription builder
- ✅ Set and rep configuration
- ✅ Cardio interval planning
- ✅ Drag-and-drop exercise reordering

### 3. Exercise Prescription System
- ✅ Set-based prescription (reps, weight, rest)
- ✅ Range-based prescriptions (8-12 reps)
- ✅ Tempo and technique notes
- ✅ Cardio interval prescriptions
- ✅ Progressive overload planning

### 4. Friendly Sentence Generator
- ✅ Automatic description generation from structured data
- ✅ User override capability
- ✅ Context-aware language
- ✅ Unit-aware descriptions
- ✅ Safety note integration

### 5. Plan Calendar & Navigation
- ✅ Monthly/weekly calendar views
- ✅ Today's session highlighting
- ✅ Session completion tracking
- ✅ Phase progress visualization
- ✅ Week completion status

## Technical Requirements

### Plan Structure Components

#### 1. Plan Overview
```typescript
// components/features/WorkoutPlan/PlanOverview.tsx
interface PlanOverviewProps {
  plan: ProgramPlan;
  onEditPhase: (phaseIndex: number) => void;
  onEditSession: (phaseIndex: number, weekIndex: number, dayIndex: number, sessionIndex: number) => void;
}
```

#### 2. Phase Editor
```typescript
// components/features/WorkoutPlan/PhaseEditor.tsx
interface PhaseEditorProps {
  phase: Phase;
  phaseIndex: number;
  onUpdatePhase: (phase: Phase) => void;
  onAddWeek: () => void;
  onRemoveWeek: (weekIndex: number) => void;
}
```

#### 3. Session Editor
```typescript
// components/features/WorkoutPlan/SessionEditor.tsx
interface SessionEditorProps {
  session: Session;
  onUpdateSession: (session: Session) => void;
  onAddExercise: (exerciseId: string) => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onReorderExercises: (startIndex: number, endIndex: number) => void;
}
```

#### 4. Exercise Prescription Editor
```typescript
// components/features/WorkoutPlan/ExercisePrescriptionEditor.tsx
interface ExercisePrescriptionEditorProps {
  prescription: ExercisePrescription;
  exercise: ExerciseCatalogItem;
  onUpdate: (prescription: ExercisePrescription) => void;
  unitSystem: 'imperial' | 'metric';
}
```

### Calendar Components

#### 1. Plan Calendar
```typescript
// components/features/WorkoutPlan/PlanCalendar.tsx
interface PlanCalendarProps {
  plan: ProgramPlan;
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  onSessionSelect: (session: Session, date: Date) => void;
  completedSessions: Set<string>; // session IDs
}
```

#### 2. Week View
```typescript
// components/features/WorkoutPlan/WeekView.tsx
interface WeekViewProps {
  week: Week;
  weekIndex: number;
  phaseIndex: number;
  onEditDay: (dayIndex: number) => void;
  onSessionSelect: (sessionIndex: number, dayIndex: number) => void;
}
```

#### 3. Day Detail
```typescript
// components/features/WorkoutPlan/DayDetail.tsx
interface DayDetailProps {
  day: Day;
  date?: Date;
  onEditSession: (sessionIndex: number) => void;
  onAddSession: () => void;
  onRemoveSession: (sessionIndex: number) => void;
}
```

### Exercise Selection & Management

```typescript
// components/features/WorkoutPlan/ExerciseSelector.tsx
interface ExerciseSelectorProps {
  selectedExercises: string[]; // exercise IDs
  onExerciseSelect: (exerciseId: string) => void;
  onExerciseRemove: (exerciseId: string) => void;
  filterByEquipment?: string[];
  filterByMovementPattern?: string[];
}

// hooks/useExerciseSelection.ts
export const useExerciseSelection = (initialSelected: string[] = []) => {
  const [selectedExercises, setSelectedExercises] = useState<string[]>(initialSelected);
  const [availableExercises, setAvailableExercises] = useState<ExerciseCatalogItem[]>([]);
  
  const addExercise = useCallback((exerciseId: string) => {
    // Implementation
  }, [selectedExercises]);
  
  const removeExercise = useCallback((exerciseId: string) => {
    // Implementation
  }, [selectedExercises]);
  
  const reorderExercises = useCallback((startIndex: number, endIndex: number) => {
    // Implementation
  }, [selectedExercises]);
  
  return {
    selectedExercises,
    availableExercises,
    addExercise,
    removeExercise,
    reorderExercises
  };
};
```

### Friendly Sentence Generator

```typescript
// utils/friendlySentences.ts
export class FriendlySentenceGenerator {
  static generateExerciseDescription(
    prescription: ExercisePrescription,
    exercise: ExerciseCatalogItem,
    unitSystem: 'imperial' | 'metric'
  ): string {
    if (prescription.sets && prescription.sets.length > 0) {
      return this.generateStrengthDescription(prescription, exercise, unitSystem);
    } else if (prescription.cardio_block) {
      return this.generateCardioDescription(prescription, exercise);
    }
    return exercise.name;
  }
  
  private static generateStrengthDescription(
    prescription: ExercisePrescription,
    exercise: ExerciseCatalogItem,
    unitSystem: 'imperial' | 'metric'
  ): string {
    const sets = prescription.sets!;
    const setCount = sets.length;
    const firstSet = sets[0];
    
    // Handle repetition display
    let repText: string;
    if (typeof firstSet.target_repetitions === 'number') {
      repText = `${firstSet.target_repetitions} repetitions`;
    } else {
      const range = firstSet.target_repetitions;
      repText = `${range.min} to ${range.max} repetitions`;
    }
    
    // Handle weight display
    let weightText = '';
    if (firstSet.target_weight_value && firstSet.target_weight_unit) {
      const weightValue = UnitConverter.convertWeight(
        firstSet.target_weight_value,
        firstSet.target_weight_unit,
        unitSystem === 'imperial' ? 'lb' : 'kg'
      );
      const unit = unitSystem === 'imperial' ? 'pounds' : 'kilograms';
      weightText = ` with ${weightValue} ${unit}${exercise.equipment.includes('dumbbells') ? ' per dumbbell' : ''}`;
    }
    
    // Handle rest time
    let restText = '';
    if (firstSet.rest_seconds) {
      restText = ` Rest ${firstSet.rest_seconds} seconds between series.`;
    }
    
    // Handle tempo
    let tempoText = '';
    if (firstSet.tempo_text) {
      tempoText = ` ${firstSet.tempo_text}`;
    }
    
    return `${exercise.name}: ${setCount} series of ${repText}${weightText}.${restText}${tempoText}`;
  }
  
  private static generateCardioDescription(
    prescription: ExercisePrescription,
    exercise: ExerciseCatalogItem
  ): string {
    const cardio = prescription.cardio_block!;
    
    let description = `Warm up for ${cardio.warm_up_minutes} minutes with an easy walk.`;
    
    if (cardio.work_intervals.length > 0) {
      const interval = cardio.work_intervals[0];
      const rounds = cardio.work_intervals.length;
      
      description += ` Do ${rounds} rounds: ${interval.hard_seconds} seconds of fast pace followed by ${interval.easy_seconds} seconds of easy pace.`;
    }
    
    description += ` Cool down for ${cardio.cool_down_minutes} minutes, then walk until your heart rate is at or below one hundred ten beats per minute.`;
    
    return description;
  }
}
```

### Plan Management Service

```typescript
// services/planService.ts
export class PlanService {
  constructor(private planRepository: PlanRepository) {}
  
  async createNewPlan(template?: ProgramPlan): Promise<ProgramPlan> {
    // Create new plan from template or default structure
  }
  
  async duplicatePlan(planId: string, newTitle: string): Promise<ProgramPlan> {
    // Create copy of existing plan
  }
  
  async addPhase(planId: string, phaseName: string): Promise<void> {
    // Add new phase to plan
  }
  
  async addWeekToPhase(planId: string, phaseIndex: number): Promise<void> {
    // Add new week to specific phase
  }
  
  async scheduleSession(
    planId: string,
    phaseIndex: number,
    weekIndex: number,
    dayIndex: number,
    date: Date
  ): Promise<void> {
    // Assign specific date to session
  }
  
  async updateSessionExercises(
    planId: string,
    sessionPath: SessionPath,
    exercises: ExercisePrescription[]
  ): Promise<void> {
    // Update exercise list for session
  }
}

interface SessionPath {
  phaseIndex: number;
  weekIndex: number;
  dayIndex: number;
  sessionIndex: number;
}
```

## File Structure
```
src/
├── components/
│   └── features/
│       └── WorkoutPlan/
│           ├── PlanOverview/
│           ├── PhaseEditor/
│           ├── WeekView/
│           ├── DayDetail/
│           ├── SessionEditor/
│           ├── ExercisePrescriptionEditor/
│           ├── ExerciseSelector/
│           ├── PlanCalendar/
│           ├── SetEditor/
│           ├── CardioBlockEditor/
│           └── DescriptionPreview/
├── services/
│   └── planService.ts
├── hooks/
│   ├── usePlan.ts
│   ├── useExerciseSelection.ts
│   ├── usePlanCalendar.ts
│   └── useSessionEditor.ts
├── utils/
│   ├── friendlySentences.ts
│   ├── planUtils.ts
│   └── progressCalculation.ts
└── data/
    └── planTemplates.ts
```

## Page Implementation

### Plan Page
```typescript
// app/(dashboard)/plan/page.tsx
"use client";

export default function PlanPage() {
  const { plan, updatePlan, isLoading } = usePlan();
  const [selectedSession, setSelectedSession] = useState<SessionPath | null>(null);
  const [editMode, setEditMode] = useState<'overview' | 'session' | 'calendar'>('overview');
  
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  return (
    <div className={styles.planPage}>
      <header className={styles.header}>
        <h1>{plan.title}</h1>
        <div className={styles.viewToggle}>
          <ToggleGroup value={editMode} onValueChange={setEditMode}>
            <ToggleGroupItem value="overview">Overview</ToggleGroupItem>
            <ToggleGroupItem value="calendar">Calendar</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </header>
      
      {editMode === 'overview' && (
        <PlanOverview 
          plan={plan}
          onEditSession={setSelectedSession}
        />
      )}
      
      {editMode === 'calendar' && (
        <PlanCalendar 
          plan={plan}
          onSessionSelect={setSelectedSession}
        />
      )}
      
      {selectedSession && (
        <Sheet open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <SessionEditor 
            session={getSessionByPath(plan, selectedSession)}
            onUpdateSession={handleSessionUpdate}
          />
        </Sheet>
      )}
    </div>
  );
}
```

## Acceptance Criteria

### ✅ Plan Structure
- Can create and manage multi-phase programs
- Week and day management works intuitively
- Sessions can be scheduled to specific dates
- Plan duplication and templates work correctly
- Phase progress tracking is accurate

### ✅ Session Management
- Session types (strength, intervals, etc.) work correctly
- Exercise prescription builder is intuitive
- Set and rep configuration handles ranges and specific values
- Cardio interval planning is complete and functional
- Exercise reordering works smoothly

### ✅ Friendly Descriptions
- Automatic sentence generation matches masterplan examples
- User can override generated descriptions
- Unit system affects generated text appropriately
- Safety notes integrate naturally
- Tempo and technique notes display clearly

### ✅ Calendar Integration
- Calendar view shows plan structure clearly
- Today's session is highlighted
- Session completion tracking works
- Week/month navigation is smooth
- Mobile calendar is touch-friendly

### ✅ User Experience
- Plan editing is intuitive and efficient
- Exercise selection is fast and well-organized
- Prescription editing handles edge cases
- Mobile interface works completely
- Loading and error states are handled properly

## Testing Checklist

- [ ] Plan creation and editing work end-to-end
- [ ] Session scheduling assigns dates correctly
- [ ] Exercise prescription generates proper friendly sentences
- [ ] Cardio interval planning produces correct descriptions
- [ ] Calendar navigation shows correct sessions for dates
- [ ] Exercise reordering persists changes
- [ ] Unit system changes update all descriptions
- [ ] Mobile touch interactions work smoothly
- [ ] Plan duplication creates independent copies
- [ ] Session completion tracking updates correctly

## Notes

- Focus on generating sentences that match masterplan examples exactly
- Ensure safety notes for back/quadriceps exercises are prominently displayed
- Test thoroughly with different session types and exercise combinations
- Keep mobile experience as primary focus
- Validate that plan structure supports progressive overload planning
