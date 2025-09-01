# Stage 3: Exercise Catalog & Glossary

## Goal
Build the exercise catalog and glossary systems with CRUD operations, media handling, search functionality, and beginner-friendly content management.

## Duration
3-4 days

## Deliverables

### 1. Exercise Catalog Management
- ✅ Complete exercise catalog CRUD interface
- ✅ Exercise card component with media display
- ✅ Search and filter functionality
- ✅ Media upload and management system
- ✅ Exercise form with validation and safety notes

### 2. Glossary System
- ✅ Glossary CRUD operations
- ✅ Search functionality with fuzzy matching
- ✅ Term detail view with media carousel
- ✅ Related terms linking system
- ✅ Beginner-friendly content display

### 3. Media Management
- ✅ Local media storage with IndexedDB blobs
- ✅ Image optimization and resizing
- ✅ Media picker with file validation
- ✅ Lazy loading and caching system
- ✅ Alt text management for accessibility

### 4. Content Templates
- ✅ 15+ starter exercises with complete data
- ✅ Safety notes for back and quadriceps sensitivity
- ✅ Movement pattern categorization
- ✅ Equipment-based filtering
- ✅ Beginner-friendly descriptions

### 5. Search & Discovery
- ✅ Multi-field search (name, aliases, movement patterns)
- ✅ Equipment-based filtering
- ✅ Movement pattern browsing
- ✅ Muscle group filtering
- ✅ Recently used exercises tracking

## Technical Requirements

### Exercise Catalog Components

#### 1. Exercise List View
```typescript
// components/features/ExerciseCatalog/ExerciseList.tsx
interface ExerciseListProps {
  exercises: ExerciseCatalogItem[];
  onSelect?: (exercise: ExerciseCatalogItem) => void;
  onEdit?: (exercise: ExerciseCatalogItem) => void;
  selectionMode?: boolean;
}
```

#### 2. Exercise Card Component
```typescript
// components/features/ExerciseCatalog/ExerciseCard.tsx
interface ExerciseCardProps {
  exercise: ExerciseCatalogItem;
  displayMode: 'compact' | 'detailed' | 'selection';
  onSelect?: () => void;
  onEdit?: () => void;
  showSafetyNotes?: boolean;
}
```

#### 3. Exercise Form
```typescript
// components/features/ExerciseCatalog/ExerciseForm.tsx
interface ExerciseFormProps {
  exercise?: ExerciseCatalogItem;
  onSave: (exercise: ExerciseCatalogItem) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}
```

#### 4. Media Manager
```typescript
// components/common/MediaManager/MediaManager.tsx
interface MediaManagerProps {
  media: MediaItem[];
  onAdd: (file: File) => Promise<void>;
  onRemove: (mediaId: string) => Promise<void>;
  onUpdateAltText: (mediaId: string, altText: string) => Promise<void>;
  maxItems?: number;
}
```

### Search & Filter System

```typescript
// hooks/useExerciseSearch.ts
interface ExerciseSearchFilters {
  query: string;
  movementPatterns: string[];
  equipment: string[];
  primaryMuscles: string[];
  beginnerFriendly?: boolean;
}

export const useExerciseSearch = () => {
  const [filters, setFilters] = useState<ExerciseSearchFilters>({
    query: '',
    movementPatterns: [],
    equipment: [],
    primaryMuscles: []
  });
  
  const [results, setResults] = useState<ExerciseCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const search = useCallback(async (newFilters: ExerciseSearchFilters) => {
    // Implementation
  }, []);
  
  return { filters, results, isLoading, search, setFilters };
};
```

### Glossary Components

#### 1. Glossary List
```typescript
// components/features/Glossary/GlossaryList.tsx
interface GlossaryListProps {
  searchQuery: string;
  onTermSelect: (term: GlossaryItem) => void;
}
```

#### 2. Term Detail View
```typescript
// components/features/Glossary/TermDetail.tsx
interface TermDetailProps {
  term: GlossaryItem;
  onEdit?: () => void;
  onRelatedTermClick: (termId: string) => void;
}
```

#### 3. Term Form
```typescript
// components/features/Glossary/TermForm.tsx
interface TermFormProps {
  term?: GlossaryItem;
  onSave: (term: GlossaryItem) => Promise<void>;
  onCancel: () => void;
}
```

### Media Storage Service

```typescript
// services/mediaService.ts
export class MediaService {
  async storeMedia(file: File): Promise<string> {
    // Resize if needed, store in IndexedDB, return media ID
  }
  
  async getMediaUrl(mediaId: string): Promise<string> {
    // Return blob URL for display
  }
  
  async removeMedia(mediaId: string): Promise<void> {
    // Clean up media storage
  }
  
  async optimizeImage(file: File, maxWidth: number, maxHeight: number): Promise<File> {
    // Resize and compress images
  }
  
  async validateMediaFile(file: File): Promise<{ valid: boolean; error?: string }> {
    // Check file type, size, etc.
  }
}
```

### Starter Content Data

```typescript
// data/starterExercises.ts
export const starterExercises: Omit<ExerciseCatalogItem, 'id' | 'created_at' | 'updated_at' | 'version'>[] = [
  {
    name: "Seated Shoulder Press with Dumbbells",
    aliases: ["Dumbbell Shoulder Press", "Seated Press"],
    movement_pattern: "press",
    primary_muscles: ["shoulders", "upper back"],
    equipment: ["dumbbells"],
    step_by_step_instructions: [
      "Sit on a bench with back support, holding a dumbbell in each hand",
      "Start with dumbbells at shoulder height, elbows below shoulders",
      "Press dumbbells straight up without leaning back",
      "Lower slowly to starting position"
    ],
    safety_notes: [
      "Keep your back against the bench support",
      "Do not press behind your head",
      "Start with light weight to learn the movement"
    ],
    beginner_friendly_name: "Seated Shoulder Press with Dumbbells",
    media: []
  },
  {
    name: "Romanian Deadlift with Dumbbells",
    aliases: ["RDL", "Dumbbell RDL"],
    movement_pattern: "hinge",
    primary_muscles: ["back of thigh", "buttocks", "lower back"],
    equipment: ["dumbbells"],
    step_by_step_instructions: [
      "Stand holding dumbbells in front of your thighs",
      "Keep knees slightly bent throughout the movement",
      "Push your hips back and lower the weights slowly",
      "Feel a stretch in the back of your thighs",
      "Return to standing by pushing hips forward"
    ],
    safety_notes: [
      "Keep your back neutral. Stop the movement if your lower back discomfort goes above two out of ten.",
      "Move slowly and focus on the hip movement",
      "Keep the weights close to your body"
    ],
    beginner_friendly_name: "Romanian Deadlift with Dumbbells",
    media: []
  },
  // ... 13 more exercises
];

// data/starterGlossary.ts
export const starterGlossary: Omit<GlossaryItem, 'id' | 'created_at' | 'updated_at' | 'version'>[] = [
  {
    term: "Romanian Deadlift",
    plain_definition: "A hip hinge movement where you bend at the hips while keeping your knees slightly bent to work the back of your thighs and buttocks.",
    why_it_matters: "Strengthens the muscles that support your lower back and improves hip mobility for daily activities like bending over to pick things up.",
    how_to_do_it_safely: [
      "Start with light weight or no weight to learn the movement",
      "Keep your back in a neutral position throughout",
      "Move slowly and focus on feeling the stretch in your thigh muscles",
      "Stop if you feel any lower back discomfort above 2 out of 10"
    ],
    related_terms: ["Hip Hinge", "Deadlift", "Hamstrings"],
    media: []
  },
  // ... more glossary terms
];
```

## File Structure
```
src/
├── components/
│   ├── features/
│   │   ├── ExerciseCatalog/
│   │   │   ├── ExerciseList/
│   │   │   │   ├── ExerciseList.tsx
│   │   │   │   ├── ExerciseList.module.css
│   │   │   │   └── ExerciseList.test.tsx
│   │   │   ├── ExerciseCard/
│   │   │   ├── ExerciseForm/
│   │   │   ├── ExerciseFilters/
│   │   │   └── ExerciseSearch/
│   │   └── Glossary/
│   │       ├── GlossaryList/
│   │       ├── TermDetail/
│   │       ├── TermForm/
│   │       └── TermSearch/
│   └── common/
│       ├── MediaManager/
│       ├── MediaPicker/
│       └── ImageGallery/
├── services/
│   └── mediaService.ts
├── hooks/
│   ├── useExerciseSearch.ts
│   ├── useGlossarySearch.ts
│   └── useMediaUpload.ts
├── data/
│   ├── starterExercises.ts
│   └── starterGlossary.ts
└── utils/
    ├── searchUtils.ts
    └── mediaUtils.ts
```

## Page Implementation

### Exercise Catalog Page
```typescript
// app/(dashboard)/glossary/page.tsx
"use client";

export default function GlossaryPage() {
  return (
    <div className={styles.glossaryPage}>
      <header className={styles.header}>
        <h1>Exercise Library</h1>
        <Button onClick={() => setShowForm(true)}>Add Exercise</Button>
      </header>
      
      <ExerciseSearch onFiltersChange={setFilters} />
      <ExerciseList 
        exercises={filteredExercises}
        onEdit={handleEdit}
        onSelect={handleSelect}
      />
      
      {showForm && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <ExerciseForm 
            exercise={editingExercise}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        </Dialog>
      )}
    </div>
  );
}
```

### Glossary Page
```typescript
// app/(dashboard)/glossary/page.tsx
"use client";

export default function GlossaryPage() {
  return (
    <div className={styles.glossaryPage}>
      <header className={styles.header}>
        <h1>Fitness Glossary</h1>
        <TermSearch onSearch={setSearchQuery} />
      </header>
      
      <GlossaryList 
        searchQuery={searchQuery}
        onTermSelect={setSelectedTerm}
      />
      
      {selectedTerm && (
        <Sheet open={!!selectedTerm} onOpenChange={() => setSelectedTerm(null)}>
          <TermDetail 
            term={selectedTerm}
            onRelatedTermClick={handleRelatedTermClick}
          />
        </Sheet>
      )}
    </div>
  );
}
```

## Acceptance Criteria

### ✅ Exercise Management
- Can create, edit, and delete exercises
- Media upload and management works smoothly
- Search finds exercises by name, aliases, and movement patterns
- Filters work correctly (equipment, muscle groups, movement patterns)
- Safety notes display prominently for relevant exercises

### ✅ Glossary Functionality
- Search finds terms quickly and accurately
- Term details show all information clearly
- Related terms link correctly
- Media displays properly in term details
- Beginner-friendly language throughout

### ✅ Media Handling
- Images upload and display correctly
- File validation prevents invalid uploads
- Media optimization reduces file sizes appropriately
- Alt text management supports accessibility
- Lazy loading improves performance

### ✅ Content Quality
- 15+ starter exercises with complete information
- Safety notes for back and quadriceps sensitivity
- Clear, jargon-free descriptions
- Proper movement pattern categorization
- Equipment lists are accurate

### ✅ User Experience
- Mobile-first responsive design
- Touch targets meet 44px minimum
- Loading states show during operations
- Error messages are helpful and clear
- Search is fast and intuitive

## Testing Checklist

- [ ] Exercise CRUD operations work correctly
- [ ] Media upload handles various file types and sizes
- [ ] Search finds exercises across all fields
- [ ] Filters combine correctly (multiple equipment, etc.)
- [ ] Glossary search works with partial matches
- [ ] Related terms navigation functions properly
- [ ] Safety notes display prominently for hinge movements
- [ ] Mobile interface is fully functional
- [ ] Performance is acceptable with full content library
- [ ] Accessibility standards are met (alt text, keyboard navigation)

## Notes

- Prioritize safety note visibility for exercises affecting back/quadriceps
- Keep descriptions beginner-friendly without jargon
- Test thoroughly with starter content before moving to next stage
- Ensure media files don't cause storage issues
- Document content creation guidelines for future exercises
