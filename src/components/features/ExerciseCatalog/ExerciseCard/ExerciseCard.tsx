/**
 * Exercise card component for displaying exercise information
 * Following cursor rules for type safety and accessibility
 */

"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, AlertTriangle, Target, Dumbbell } from "lucide-react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import type { ExerciseCatalogItem } from "@/types";
import styles from "./ExerciseCard.module.css";

export interface ExerciseCardProps {
  exercise: ExerciseCatalogItem;
  displayMode?: "compact" | "detailed" | "selection";
  onSelect?: () => void;
  onEdit?: () => void;
  showSafetyNotes?: boolean;
  selectable?: boolean;
  selected?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  displayMode = "compact",
  onSelect,
  onEdit,
  showSafetyNotes = true,
  selectable = false,
  selected = false,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  
  const { getMediaUrl, getThumbnailUrl } = useMediaUpload();

  // Load first media image
  const loadImage = useCallback(async () => {
    if (exercise.media.length > 0 && !imageUrl && !imageLoading) {
      setImageLoading(true);
      try {
        const url = await getThumbnailUrl(exercise.media[0].source).catch(() =>
          getMediaUrl(exercise.media[0].source)
        );
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to load exercise image:", error);
      } finally {
        setImageLoading(false);
      }
    }
  }, [exercise.media, imageUrl, imageLoading, getThumbnailUrl, getMediaUrl]);

  // Load image on mount
  useState(() => {
    loadImage();
  });

  const handleCardClick = useCallback(() => {
    if (selectable && onSelect) {
      onSelect();
    }
  }, [selectable, onSelect]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  }, [onEdit]);

  const difficultyColor = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800", 
    advanced: "bg-red-100 text-red-800",
  }[exercise.difficulty_level];

  const hasBackSafety = exercise.safety_notes.some(note => 
    note.toLowerCase().includes("back") && note.includes("2 out of 10")
  );

  const hasQuadSafety = exercise.safety_notes.some(note =>
    note.toLowerCase().includes("quadriceps") || note.toLowerCase().includes("knee")
  );

  return (
    <Card 
      className={`${styles.exerciseCard} ${
        displayMode === "detailed" ? styles.detailed : ""
      } ${
        selectable ? styles.selectable : ""
      } ${
        selected ? styles.selected : ""
      }`}
      onClick={handleCardClick}
    >
      {exercise.media.length > 0 && displayMode !== "compact" && (
        <div className={styles.imageContainer}>
          {imageLoading ? (
            <div className={styles.imagePlaceholder}>
              Loading...
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={exercise.media[0].alt_text || exercise.name}
              className={styles.exerciseImage}
              loading="lazy"
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <Dumbbell className={styles.placeholderIcon} />
            </div>
          )}
        </div>
      )}

      <CardHeader className={styles.cardHeader}>
        <div className={styles.headerContent}>
          <CardTitle className={styles.exerciseName}>
            {exercise.beginner_friendly_name}
          </CardTitle>
          
          <div className={styles.headerActions}>
            {(hasBackSafety || hasQuadSafety) && showSafetyNotes && (
              <span title="Has safety notes">
                <AlertTriangle className={styles.safetyIcon} />
              </span>
            )}
            
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className={styles.editButton}
              >
                <Edit className={styles.editIcon} />
              </Button>
            )}
          </div>
        </div>

        <div className={styles.badges}>
          <Badge variant="secondary" className={difficultyColor}>
            {exercise.difficulty_level}
          </Badge>
          
          <Badge variant="outline" className={styles.movementBadge}>
            <Target className={styles.badgeIcon} />
            {exercise.movement_pattern}
          </Badge>
          
          <Badge variant="outline" className={styles.typeBadge}>
            {exercise.exercise_type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className={styles.cardContent}>
        {displayMode === "detailed" && (
          <>
            <div className={styles.muscleGroups}>
              <h4 className={styles.sectionTitle}>Primary Muscles</h4>
              <div className={styles.muscleList}>
                {exercise.primary_muscles.map((muscle, index) => (
                  <Badge key={index} variant="outline" className={styles.muscleBadge}>
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>

            {exercise.equipment.length > 0 && (
              <div className={styles.equipment}>
                <h4 className={styles.sectionTitle}>Equipment</h4>
                <div className={styles.equipmentList}>
                  {exercise.equipment.map((item, index) => (
                    <Badge key={index} variant="outline" className={styles.equipmentBadge}>
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {showSafetyNotes && exercise.safety_notes.length > 0 && (
              <div className={styles.safetyNotes}>
                <h4 className={styles.sectionTitle}>
                  <AlertTriangle className={styles.sectionIcon} />
                  Safety Notes
                </h4>
                <ul className={styles.safetyList}>
                  {exercise.safety_notes.map((note, index) => (
                    <li 
                      key={index} 
                      className={`${styles.safetyNote} ${
                        note.includes("2 out of 10") ? styles.importantSafety : ""
                      }`}
                    >
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {displayMode === "detailed" && exercise.step_by_step_instructions.length > 0 && (
              <div className={styles.instructions}>
                <h4 className={styles.sectionTitle}>Instructions</h4>
                <ol className={styles.instructionList}>
                  {exercise.step_by_step_instructions.map((instruction, index) => (
                    <li key={index} className={styles.instruction}>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}

        {displayMode === "compact" && (
          <div className={styles.compactInfo}>
            <div className={styles.muscleGroups}>
              <span className={styles.compactLabel}>Targets:</span>
              <span className={styles.compactValue}>
                {exercise.primary_muscles.join(", ")}
              </span>
            </div>
            
            {exercise.equipment.length > 0 && (
              <div className={styles.equipmentCompact}>
                <span className={styles.compactLabel}>Equipment:</span>
                <span className={styles.compactValue}>
                  {exercise.equipment.join(", ")}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
