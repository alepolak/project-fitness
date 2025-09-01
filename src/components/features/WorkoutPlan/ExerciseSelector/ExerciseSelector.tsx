"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, X, Filter } from "lucide-react";
import { useExerciseSelection } from "@/hooks/useExerciseSelection";
import type { ExerciseCatalogItem } from "@/types";
import styles from "./ExerciseSelector.module.css";

interface ExerciseSelectorProps {
  selectedExerciseIds: string[];
  onExerciseSelect: (exerciseId: string, exercise: ExerciseCatalogItem) => void;
  onExerciseRemove: (exerciseId: string) => void;
  sessionType?: string;
  maxSelections?: number;
}

export function ExerciseSelector({
  selectedExerciseIds,
  onExerciseSelect,
  onExerciseRemove,
  sessionType = "strength",
  maxSelections,
}: ExerciseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const {
    availableExercises,
    isLoading,
    error,
    filters,
    updateFilters,
    clearFilters,
    searchExercises,
    getFilterOptions,
    getRecommendations,
    isSelected,
  } = useExerciseSelection(selectedExerciseIds);

  const filterOptions = getFilterOptions();
  const recommendations = getRecommendations(sessionType, selectedExerciseIds, 5);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    searchExercises(query);
  }, [searchExercises]);

  const handleExerciseAdd = useCallback((exercise: ExerciseCatalogItem) => {
    if (!isSelected(exercise.id) && (!maxSelections || selectedExerciseIds.length < maxSelections)) {
      onExerciseSelect(exercise.id, exercise);
    }
  }, [isSelected, maxSelections, selectedExerciseIds.length, onExerciseSelect]);

  const handleExerciseRemove = useCallback((exerciseId: string) => {
    onExerciseRemove(exerciseId);
  }, [onExerciseRemove]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Loading exercises...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.exerciseSelector}>
      {/* Search and Filters */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <div className={styles.searchInput}>
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.input}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filterButton}
          >
            <Filter className={styles.filterIcon} />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card className={styles.filtersCard}>
            <CardContent className={styles.filtersContent}>
              <div className={styles.filterGrid}>
                {/* Movement Pattern Filter */}
                <div className={styles.filterGroup}>
                  <Label>Movement Pattern</Label>
                  <Select
                    value={filters.movement_patterns?.[0] || ""}
                    onValueChange={(value) => 
                      updateFilters({ movement_patterns: value ? [value] : undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any pattern</SelectItem>
                      {filterOptions.movementPatterns.map(pattern => (
                        <SelectItem key={pattern} value={pattern}>
                          {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty Filter */}
                <div className={styles.filterGroup}>
                  <Label>Difficulty</Label>
                  <Select
                    value={filters.difficulty_level || ""}
                    onValueChange={(value) => 
                      updateFilters({ difficulty_level: (value || undefined) as "beginner" | "intermediate" | "advanced" | undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any level</SelectItem>
                      {filterOptions.difficultyLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Exercise Type Filter */}
                <div className={styles.filterGroup}>
                  <Label>Exercise Type</Label>
                  <Select
                    value={filters.exercise_type || ""}
                    onValueChange={(value) => 
                      updateFilters({ exercise_type: (value || undefined) as "strength" | "cardio" | "flexibility" | "balance" | undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any type</SelectItem>
                      {filterOptions.exerciseTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={styles.filterActions}>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className={styles.recommendationsCard}>
          <CardHeader>
            <CardTitle className={styles.recommendationsTitle}>
              Recommended for {sessionType} sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.recommendationsList}>
              {recommendations.map((exercise) => (
                <div key={exercise.id} className={styles.recommendationItem}>
                  <div className={styles.exerciseInfo}>
                    <h4 className={styles.exerciseName}>{exercise.beginner_friendly_name}</h4>
                    <div className={styles.exerciseTags}>
                      <Badge variant="outline">{exercise.movement_pattern}</Badge>
                      <Badge variant="secondary">{exercise.difficulty_level}</Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleExerciseAdd(exercise)}
                    disabled={isSelected(exercise.id) || (maxSelections ? selectedExerciseIds.length >= maxSelections : false)}
                  >
                    <Plus className={styles.buttonIcon} />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise List */}
      <div className={styles.exerciseList}>
        {availableExercises.length === 0 ? (
          <Card className={styles.emptyState}>
            <CardContent className={styles.emptyContent}>
              <Search className={styles.emptyIcon} />
              <h3>No exercises found</h3>
              <p>Try adjusting your search or filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className={styles.exerciseGrid}>
            {availableExercises.map((exercise) => (
              <Card 
                key={exercise.id} 
                className={`${styles.exerciseCard} ${isSelected(exercise.id) ? styles.selected : ''}`}
              >
                <CardContent className={styles.exerciseCardContent}>
                  <div className={styles.exerciseHeader}>
                    <h4 className={styles.exerciseName}>{exercise.beginner_friendly_name}</h4>
                    {isSelected(exercise.id) ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExerciseRemove(exercise.id)}
                        className={styles.removeButton}
                      >
                        <X className={styles.buttonIcon} />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExerciseAdd(exercise)}
                        disabled={maxSelections ? selectedExerciseIds.length >= maxSelections : false}
                        className={styles.addButton}
                      >
                        <Plus className={styles.buttonIcon} />
                      </Button>
                    )}
                  </div>

                  <div className={styles.exerciseDetails}>
                    <div className={styles.exerciseTags}>
                      <Badge variant="outline">{exercise.movement_pattern}</Badge>
                      <Badge variant="secondary">{exercise.difficulty_level}</Badge>
                      <Badge variant="outline">{exercise.exercise_type}</Badge>
                    </div>

                    <div className={styles.exerciseMuscles}>
                      <span className={styles.muscleLabel}>Targets:</span>
                      <span className={styles.muscleList}>
                        {exercise.primary_muscles.join(", ")}
                      </span>
                    </div>

                    {exercise.equipment.length > 0 && (
                      <div className={styles.exerciseEquipment}>
                        <span className={styles.equipmentLabel}>Equipment:</span>
                        <span className={styles.equipmentList}>
                          {exercise.equipment.join(", ")}
                        </span>
                      </div>
                    )}

                    {exercise.safety_notes.length > 0 && (
                      <div className={styles.safetyNotes}>
                        <span className={styles.safetyLabel}>Safety:</span>
                        <span className={styles.safetyText}>
                          {exercise.safety_notes[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedExerciseIds.length > 0 && (
        <div className={styles.selectionSummary}>
          <span className={styles.selectionCount}>
            {selectedExerciseIds.length} exercise{selectedExerciseIds.length !== 1 ? 's' : ''} selected
            {maxSelections && ` (${maxSelections - selectedExerciseIds.length} remaining)`}
          </span>
        </div>
      )}
    </div>
  );
}
