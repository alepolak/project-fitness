"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LoadingSkeletonProps } from "@/types";

/**
 * Loading skeleton component with customizable lines and animation
 */
export function LoadingSkeleton({
  lines = 3,
  className,
  animate = true,
}: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-4 rounded",
            animate && "animate-pulse",
            // Vary the width for more realistic loading
            index === 0 && "w-3/4",
            index === 1 && "w-full",
            index === 2 && "w-1/2",
            index > 2 && "w-4/5"
          )}
        />
      ))}
    </div>
  );
}

/**
 * Card loading skeleton for workout entries
 */
export function WorkoutCardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <LoadingSkeleton lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

/**
 * List loading skeleton for exercises or workouts
 */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <WorkoutCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Page loading skeleton with header and content
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <ListSkeleton items={3} />
      </div>
    </div>
  );
}
