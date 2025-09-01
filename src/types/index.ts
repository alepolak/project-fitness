// Core App Settings
export interface AppSettings {
  unit_system: "imperial" | "metric";
  theme: "system" | "light" | "dark";
  privacy_acknowledged: boolean;
  data_version: number;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

// Storage Types
export interface StorageData {
  id: string;
  timestamp: number;
  version: number;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Exercise and Fitness Types (basic structure for future use)
export interface Exercise {
  id: string;
  name: string;
  category: string;
  instructions?: string;
  equipment?: string[];
}

export interface WorkoutEntry extends StorageData {
  exercise_id: string;
  sets: Set[];
  notes?: string;
  date: string;
}

export interface Set {
  weight?: number;
  reps?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
  rest?: number; // in seconds
}

// Component Props Types
export interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
  animate?: boolean;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}
