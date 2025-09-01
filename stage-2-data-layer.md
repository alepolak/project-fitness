# Stage 2: Data Layer & Core Types

## Goal
Build the complete data foundation with TypeScript interfaces, Ajv validation schemas, repository patterns, and unit conversion utilities that support all app functionality.

## Duration
3-4 days

## Deliverables

### 1. Complete Type System
- ✅ All TypeScript interfaces matching masterplan data model
- ✅ Discriminated unions for exercise types (strength/cardio)
- ✅ Strict typing for all JSON data structures
- ✅ Type-safe utility functions and transformations

### 2. Ajv Validation System
- ✅ JSON schemas for all data entities
- ✅ Validation service with user-friendly error messages
- ✅ Data migration framework for version changes
- ✅ Import/export validation with error recovery

### 3. Repository Layer
- ✅ Repository classes for each data domain
- ✅ CRUD operations with proper error handling
- ✅ Query methods with filtering capabilities
- ✅ Batch operations for performance

### 4. Unit Conversion System
- ✅ Imperial ↔ Metric conversion utilities
- ✅ Weight, distance, and display formatting
- ✅ Context-aware unit display
- ✅ Safe rounding rules for different data types

### 5. Storage Implementation
- ✅ Complete IndexedDB wrapper with all object stores
- ✅ Backup and restore functionality
- ✅ Data migration system
- ✅ Storage quota management

## Technical Requirements

### Core Type Definitions

#### 1. Settings & Configuration
```typescript
// types/settings.ts
interface AppSettings {
  unit_system: 'imperial' | 'metric';
  theme: 'system' | 'light' | 'dark';
  language: 'en';
  data_version: number;
  privacy_acknowledged: boolean;
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
}
```

#### 2. Body Metrics
```typescript
// types/metrics.ts
interface BodyMetricEntry {
  id: string;
  date: string; // ISO date string
  body_weight: number;
  weight_unit: 'lb' | 'kg';
  body_fat_percent?: number;
  body_muscle_percent?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  version: number;
}
```

#### 3. Exercise Catalog
```typescript
// types/exercise.ts
interface ExerciseCatalogItem {
  id: string;
  name: string;
  aliases: string[];
  movement_pattern: 'hinge' | 'squat' | 'press' | 'pull' | 'carry' | 'core';
  primary_muscles: string[];
  equipment: string[];
  step_by_step_instructions: string[];
  safety_notes: string[];
  media: MediaItem[];
  beginner_friendly_name: string;
  created_at: string;
  updated_at: string;
  version: number;
}

interface MediaItem {
  type: 'photo' | 'gif';
  source: string; // blob reference or cached URL
  alt_text: string;
}
```

#### 4. Workout Planning
```typescript
// types/plan.ts
interface ProgramPlan {
  id: string;
  title: string;
  phases: Phase[];
  created_at: string;
  updated_at: string;
  version: number;
}

interface Phase {
  name: 'Base' | 'Build' | 'Peak';
  weeks: Week[];
}

interface Week {
  index: number;
  days: Day[];
}

interface Day {
  date?: string; // ISO string, optional for templates
  sessions: Session[];
}

interface Session {
  session_type: 'strength' | 'intervals' | 'steady walk' | 'soccer match';
  title: string;
  exercises: ExercisePrescription[];
}

interface ExercisePrescription {
  exercise_id: string;
  clear_description: string;
  sets?: SetPrescription[];
  cardio_block?: CardioBlock;
}

interface SetPrescription {
  target_repetitions: number | { min: number; max: number };
  target_weight_value?: number;
  target_weight_unit?: 'lb' | 'kg';
  rest_seconds?: number;
  tempo_text?: string;
  notes_for_user?: string;
}

interface CardioBlock {
  warm_up_minutes: number;
  work_intervals: {
    hard_seconds: number;
    easy_seconds: number;
    target_heart_rate_range_bpm?: [number, number];
  }[];
  cool_down_minutes: number;
  safety_notes: string;
}
```

#### 5. Workout Logging
```typescript
// types/log.ts
interface WorkoutLogEntry {
  id: string;
  date_time_start: string; // ISO string
  session_plan_ref?: string;
  entries: ExerciseEntry[];
  session_notes?: string;
  created_at: string;
  updated_at: string;
  version: number;
}

type ExerciseEntry = StrengthEntry | CardioEntry;

interface StrengthEntry {
  type: 'strength';
  exercise_id: string;
  performed_sets: PerformedSet[];
}

interface PerformedSet {
  repetitions_done: number;
  weight_value?: number;
  weight_unit?: 'lb' | 'kg';
  rest_seconds_observed?: number;
  perceived_effort_text: 'very easy' | 'easy' | 'moderately hard' | 'hard' | 'very hard';
  pain_back_0_to_10?: number;
  pain_quadriceps_0_to_10?: number;
}

interface CardioEntry {
  type: 'cardio';
  mode: string; // "treadmill walk", "treadmill run", "soccer match"
  segments: CardioSegment[];
}

interface CardioSegment {
  label: string; // "warm up", "hard minute 1", "easy minute 1"
  duration_seconds: number;
  speed_mph_or_kph?: number;
  incline_percent?: number;
  average_heart_rate_bpm?: number;
  max_heart_rate_bpm?: number;
}
```

#### 6. Baseline Testing
```typescript
// types/baseline.ts
interface BaselineTestEntry {
  id: string;
  month: string; // "YYYY-MM"
  rockport_time_mm_ss?: string;
  rockport_finish_heart_rate_bpm?: number;
  twelve_minute_distance?: number;
  twelve_minute_distance_unit?: 'miles' | 'kilometers';
  twelve_minute_average_heart_rate_bpm?: number;
  longest_continuous_jog_minutes?: number;
  best_one_minute_heart_rate_drop_bpm?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  version: number;
}
```

#### 7. Glossary
```typescript
// types/glossary.ts
interface GlossaryItem {
  id: string;
  term: string;
  plain_definition: string;
  why_it_matters: string;
  how_to_do_it_safely: string[];
  media: MediaItem[];
  related_terms: string[];
  created_at: string;
  updated_at: string;
  version: number;
}
```

### Repository Layer Implementation

```typescript
// repositories/base.ts
abstract class BaseRepository<T> {
  constructor(protected storage: StorageService, protected storeName: string) {}
  
  async save(item: T): Promise<void>
  async getById(id: string): Promise<T | null>
  async getAll(): Promise<T[]>
  async delete(id: string): Promise<void>
  async query(filter: Partial<T>): Promise<T[]>
}

// repositories/exerciseRepository.ts
export class ExerciseRepository extends BaseRepository<ExerciseCatalogItem> {
  async searchByName(query: string): Promise<ExerciseCatalogItem[]>
  async getByMovementPattern(pattern: string): Promise<ExerciseCatalogItem[]>
  async getByEquipment(equipment: string[]): Promise<ExerciseCatalogItem[]>
}

// repositories/workoutRepository.ts
export class WorkoutRepository extends BaseRepository<WorkoutLogEntry> {
  async getByExercise(exerciseId: string): Promise<WorkoutLogEntry[]>
  async getByDateRange(startDate: string, endDate: string): Promise<WorkoutLogEntry[]>
  async getRecentSessions(limit: number): Promise<WorkoutLogEntry[]>
}
```

### Unit Conversion System

```typescript
// utils/units.ts
export class UnitConverter {
  static poundsToKg(pounds: number): number
  static kgToPounds(kg: number): number
  static milesToKm(miles: number): number
  static kmToMiles(km: number): number
  
  static formatWeight(value: number, unit: 'lb' | 'kg', targetUnit: 'lb' | 'kg'): string
  static formatDistance(value: number, unit: 'miles' | 'kilometers', targetUnit: 'miles' | 'kilometers'): string
  static roundToNearestDumbbell(weight: number, unit: 'lb' | 'kg'): number
}

// utils/formatting.ts
export class FriendlyFormatter {
  static exerciseDescription(prescription: ExercisePrescription, exercise: ExerciseCatalogItem): string
  static perceivedEffortText(level: number): string
  static timeToReadable(seconds: number): string
  static weightWithUnit(value: number, unit: 'lb' | 'kg'): string
}
```

### Ajv Validation Schemas

```typescript
// validators/schemas.ts
export const settingsSchema = {
  type: "object",
  properties: {
    unit_system: { enum: ["imperial", "metric"] },
    theme: { enum: ["system", "light", "dark"] },
    // ... complete schema
  },
  required: ["unit_system", "theme", "privacy_acknowledged"],
  additionalProperties: false
};

export const workoutLogSchema = {
  type: "object",
  properties: {
    entries: {
      type: "array",
      items: {
        oneOf: [
          { $ref: "#/definitions/strengthEntry" },
          { $ref: "#/definitions/cardioEntry" }
        ]
      }
    }
    // ... complete schema with all validation rules
  }
};
```

## File Structure
```
src/
├── types/
│   ├── settings.ts
│   ├── metrics.ts
│   ├── exercise.ts
│   ├── plan.ts
│   ├── log.ts
│   ├── baseline.ts
│   └── glossary.ts
├── repositories/
│   ├── base.ts
│   ├── settingsRepository.ts
│   ├── exerciseRepository.ts
│   ├── workoutRepository.ts
│   ├── metricsRepository.ts
│   └── baselineRepository.ts
├── services/
│   ├── storage.ts
│   ├── validation.ts
│   └── migration.ts
├── utils/
│   ├── units.ts
│   ├── formatting.ts
│   └── dateUtils.ts
└── validators/
    ├── schemas.ts
    └── index.ts
```

## Acceptance Criteria

### ✅ Type Safety
- Zero TypeScript errors in strict mode
- All data structures properly typed
- No `any` types anywhere in codebase
- Discriminated unions work correctly

### ✅ Data Validation
- All Ajv schemas validate correctly
- User-friendly error messages for validation failures
- Migration system handles version changes
- Import/export validates all data

### ✅ Repository Pattern
- CRUD operations work for all data types
- Query methods return filtered results
- Error handling prevents data corruption
- Batch operations complete successfully

### ✅ Unit Conversion
- Imperial ↔ Metric conversions are accurate
- Rounding follows masterplan specifications
- Display formatting matches user preferences
- Context-aware unit selection works

### ✅ Storage Layer
- IndexedDB stores all data types correctly
- Backup/restore preserves all data
- Storage quota is monitored and handled
- Database migrations work seamlessly

## Testing Checklist

- [ ] All TypeScript interfaces compile without errors
- [ ] Ajv validation catches invalid data correctly
- [ ] Unit conversions are mathematically accurate
- [ ] Repository CRUD operations work reliably
- [ ] Storage persists data across browser sessions
- [ ] Migration system updates old data format
- [ ] Error messages are user-friendly and actionable
- [ ] Performance is acceptable for expected data volumes

## Notes

- Focus on data integrity and type safety
- Ensure all patterns can handle the full app scale
- Test edge cases thoroughly (invalid data, storage full, etc.)
- Document any complex validation rules
- Keep migration system simple but robust
