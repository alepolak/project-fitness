# Stage 1: Foundation Setup

## Goal
Establish the complete technical foundation for the fitness tracking app with Next.js, TypeScript, shadcn/ui, and core infrastructure components.

## Duration
2-3 days

## Deliverables

### 1. Project Structure & Configuration
- ✅ Next.js 14+ App Router setup with TypeScript strict mode
- ✅ shadcn/ui installation and configuration
- ✅ Tailwind CSS configuration with design tokens
- ✅ CSS Modules setup for custom components
- ✅ ESLint and Prettier configuration matching cursor rules

### 2. Core Infrastructure
- ✅ IndexedDB wrapper service (`services/storage.ts`)
- ✅ Local Storage utilities with type safety
- ✅ Ajv validation setup with base schemas
- ✅ Error boundary components
- ✅ Loading skeleton components

### 3. Design System Foundation
- ✅ CSS custom properties for theming
- ✅ Mobile-first responsive breakpoints
- ✅ Base typography and spacing tokens
- ✅ Accessibility standards (44px touch targets, contrast ratios)

### 4. Core Layout & Navigation
- ✅ Bottom navigation component (Home, Plan, Log, Baseline, Glossary, Settings)
- ✅ App layout with proper mobile navigation
- ✅ Route structure with (dashboard) route group
- ✅ Basic page shells for all main sections

### 5. Settings & Preferences
- ✅ Unit system toggle (Imperial/Metric)
- ✅ Theme selection (system/light/dark)
- ✅ Local-only privacy notice component
- ✅ Data export/import infrastructure (basic structure)

## Technical Requirements

### File Structure
```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── home/page.tsx
│   │   ├── plan/page.tsx
│   │   ├── log/page.tsx
│   │   ├── baseline/page.tsx
│   │   └── glossary/page.tsx
│   ├── settings/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # shadcn components
│   ├── common/
│   │   ├── BottomNav/
│   │   ├── LoadingSkeleton/
│   │   └── ErrorBoundary/
│   └── features/
├── services/
│   └── storage.ts
├── lib/
│   ├── utils.ts
│   └── validations.ts
├── hooks/
│   └── useLocalStorage.ts
└── types/
    └── index.ts
```

### Key Components to Implement

#### 1. Storage Service
```typescript
// services/storage.ts
export class StorageService {
  private db: IDBDatabase | null = null;
  
  async initialize(): Promise<void>
  async save<T>(store: string, data: T): Promise<void>
  async get<T>(store: string, id: string): Promise<T | null>
  async query<T>(store: string, filter: object): Promise<T[]>
  async delete(store: string, id: string): Promise<void>
}
```

#### 2. Bottom Navigation
```typescript
// components/common/BottomNav/BottomNav.tsx
interface BottomNavProps {
  currentPath: string;
}
```

#### 3. Settings Management
```typescript
// hooks/useSettings.ts
interface AppSettings {
  unit_system: 'imperial' | 'metric';
  theme: 'system' | 'light' | 'dark';
  privacy_acknowledged: boolean;
  data_version: number;
}
```

## Acceptance Criteria

### ✅ Navigation Works
- Bottom navigation switches between all main sections
- All pages render without errors
- Mobile-first responsive design

### ✅ Storage Ready
- IndexedDB connection established
- Settings save/load from localStorage
- Error handling for storage failures

### ✅ Design System
- shadcn/ui components render correctly
- CSS modules work for custom components
- Theme switching works (light/dark)
- Mobile touch targets meet 44px minimum

### ✅ Type Safety
- All TypeScript strict mode rules enforced
- No `any` types in codebase
- Proper interface definitions for all data

### ✅ Development Ready
- Hot reload works correctly
- Linting passes with zero errors
- Build process completes successfully
- All components use "use client" directive

## Testing Checklist

- [ ] Bottom navigation works on mobile viewport
- [ ] Settings persist after page refresh
- [ ] Theme switching updates all components
- [ ] Unit system toggle updates display
- [ ] Error boundaries catch and display errors gracefully
- [ ] Loading skeletons show during async operations
- [ ] TypeScript compilation has zero errors
- [ ] All accessibility standards met (contrast, touch targets)

## Notes

- Focus on solid foundation rather than feature completeness
- Ensure all patterns established here can scale to full app
- Test thoroughly on mobile devices (primary target)
- Keep components simple but properly typed
- Document any deviations from masterplan requirements
