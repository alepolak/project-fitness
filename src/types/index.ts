// Re-export all domain-specific types
export * from "./settings";
export * from "./metrics";
export * from "./exercise";
export * from "./plan";
export * from "./log";
export * from "./baseline";
export * from "./glossary";

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
  timestamp?: number;
  created_at: string;
  updated_at: string;
  version: number;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
  timestamp: string;
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

// Data operation types
export type QueryFilter<T> = {
  [K in keyof T]?: T[K] | T[K][] | { min?: T[K]; max?: T[K] };
};

export interface SortOptions<T> {
  field: keyof T;
  direction: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

// Utility types for data operations
export type CreateData<T> = Omit<T, "id" | "created_at" | "updated_at" | "version">;
export type UpdateData<T> = Partial<Omit<T, "id" | "created_at" | "version">> & { id: string };
export type EntityWithMetadata<T> = T & StorageData;
