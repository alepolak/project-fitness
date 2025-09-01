"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dumbbell, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Zap,
  MessageSquare
} from 'lucide-react';
import type { ExerciseCatalogItem, ExercisePrescription, PerformedSet } from '@/types';
import { SetLogger } from '../SetLogger';
import { CardioLogger } from '../CardioLogger';
import styles from './ActiveExerciseCard.module.css';

interface ActiveExerciseCardProps {
  exercise: ExerciseCatalogItem;
  prescription: ExercisePrescription;
  onSetComplete: (setData: PerformedSet) => void;
  onExerciseComplete: (notes?: string) => void;
  isActive: boolean;
  completedSets: PerformedSet[];
}

export const ActiveExerciseCard: React.FC<ActiveExerciseCardProps> = ({
  exercise,
  prescription,
  onSetComplete,
  onExerciseComplete,
  isActive,
  completedSets
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [exerciseNotes, setExerciseNotes] = useState('');
  const [currentSetIndex, setCurrentSetIndex] = useState(completedSets.length);

  // Calculate exercise progress
  const isStrengthExercise = !!prescription.sets;
  const isCardioExercise = !!prescription.cardio_block;
  const totalSets = isStrengthExercise ? (prescription.sets?.length || 1) : 1;
  const completedSetsCount = completedSets.length;
  const isExerciseComplete = completedSetsCount >= totalSets;
  const progressPercentage = (completedSetsCount / totalSets) * 100;

  // Get current set target (for strength exercises)
  // const getCurrentSetTarget = () => {
  //   if (prescription.type !== 'strength') return null;
  //   
  //   return {
  //     reps: prescription.reps,
  //     weight: prescription.weight,
  //     weight_unit: prescription.weight_unit
  //   };
  // };

  const handleSetComplete = (setData: PerformedSet) => {
    onSetComplete(setData);
    setCurrentSetIndex(prev => prev + 1);
  };

  const handleExerciseComplete = () => {
    onExerciseComplete(exerciseNotes || undefined);
  };

  const formatWeight = (weight?: number, unit?: string) => {
    if (!weight) return '';
    return `${weight}${unit || 'kg'}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Card className={`${styles.exerciseCard} ${isActive ? styles.active : styles.inactive}`}>
      <CardHeader>
        <div className={styles.headerContent}>
          <div className={styles.exerciseInfo}>
            <CardTitle className={styles.exerciseName}>
              {exercise.name}
            </CardTitle>
            <div className={styles.exerciseDetails}>
              <Badge variant="secondary" className={styles.categoryBadge}>
                {exercise.movement_pattern}
              </Badge>
              <Badge variant="outline" className={styles.typeBadge}>
                {exercise.exercise_type}
              </Badge>
            </div>
          </div>
          
          <div className={styles.progressIndicator}>
            <div 
              className={styles.progressBar}
              style={{ width: `${progressPercentage}%` }}
            />
            <span className={styles.progressText}>
              {completedSetsCount}/{totalSets}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Exercise Instructions/Description */}
        {exercise.step_by_step_instructions && exercise.step_by_step_instructions.length > 0 && (
          <div className={styles.instructions}>
            <ul>
              {exercise.step_by_step_instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety Notes */}
        {exercise.safety_notes && exercise.safety_notes.length > 0 && (
          <div className={styles.safetyNotes}>
            <AlertCircle className={styles.safetyIcon} />
            <div>
              {exercise.safety_notes.map((note, index) => (
                <p key={index}>{note}</p>
              ))}
            </div>
          </div>
        )}

        {/* Prescription Details */}
        <div className={styles.prescriptionDetails}>
          {isStrengthExercise && (
            <div className={styles.strengthDetails}>
              <div className={styles.targetInfo}>
                {prescription.sets && prescription.sets.length > 0 && (
                  <>
                    <div className={styles.targetItem}>
                      <Target className={styles.targetIcon} />
                      <span>Sets: {prescription.sets.length}</span>
                    </div>
                    {prescription.sets[currentSetIndex] && (
                      <>
                        <div className={styles.targetItem}>
                          <Target className={styles.targetIcon} />
                          <span>Reps: {typeof prescription.sets[currentSetIndex].target_repetitions === 'number' 
                            ? prescription.sets[currentSetIndex].target_repetitions 
                            : `${prescription.sets[currentSetIndex].target_repetitions.min}-${prescription.sets[currentSetIndex].target_repetitions.max}`}
                          </span>
                        </div>
                        {prescription.sets[currentSetIndex].target_weight_value && (
                          <div className={styles.targetItem}>
                            <Dumbbell className={styles.targetIcon} />
                            <span>Weight: {formatWeight(prescription.sets[currentSetIndex].target_weight_value, prescription.sets[currentSetIndex].target_weight_unit)}</span>
                          </div>
                        )}
                        {prescription.sets[currentSetIndex].rest_seconds && (
                          <div className={styles.targetItem}>
                            <Clock className={styles.targetIcon} />
                            <span>Rest: {formatTime(prescription.sets[currentSetIndex].rest_seconds)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {isCardioExercise && prescription.cardio_block && (
            <div className={styles.cardioDetails}>
              <div className={styles.targetInfo}>
                <div className={styles.targetItem}>
                  <Clock className={styles.targetIcon} />
                  <span>Warm-up: {formatTime(prescription.cardio_block.warm_up_minutes * 60)}</span>
                </div>
                <div className={styles.targetItem}>
                  <Zap className={styles.targetIcon} />
                  <span>Intervals: {prescription.cardio_block.work_intervals.length}</span>
                </div>
                <div className={styles.targetItem}>
                  <Clock className={styles.targetIcon} />
                  <span>Cool-down: {formatTime(prescription.cardio_block.cool_down_minutes * 60)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Completed Sets Summary */}
        {completedSets.length > 0 && (
          <div className={styles.completedSets}>
            <h4 className={styles.completedSetsTitle}>Completed Sets:</h4>
            <div className={styles.setsList}>
              {completedSets.map((set, index) => (
                <div key={index} className={styles.completedSet}>
                  <CheckCircle className={styles.completedIcon} />
                  <span className={styles.setInfo}>
                    Set {index + 1}: {set.repetitions_done} reps
                    {set.weight_value && ` @ ${formatWeight(set.weight_value, set.weight_unit)}`}
                    {set.rpe_score && ` (RPE: ${set.rpe_score})`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Set Logger or Cardio Logger */}
        {isActive && !isExerciseComplete && (
          <div className={styles.loggerSection}>
            {isStrengthExercise && prescription.sets && prescription.sets[currentSetIndex] ? (
              <SetLogger
                setNumber={currentSetIndex + 1}
                targetReps={typeof prescription.sets[currentSetIndex].target_repetitions === 'number' 
                  ? prescription.sets[currentSetIndex].target_repetitions 
                  : prescription.sets[currentSetIndex].target_repetitions.max}
                targetWeight={prescription.sets[currentSetIndex].target_weight_value}
                weightUnit={prescription.sets[currentSetIndex].target_weight_unit}
                onSetComplete={handleSetComplete}
                disabled={!isActive}
              />
            ) : isCardioExercise && prescription.cardio_block ? (
              <CardioLogger
                prescription={prescription}
                onSegmentComplete={(segment) => {
                  // Handle cardio segment completion
                  console.log('Cardio segment completed:', segment);
                }}
                onExerciseComplete={handleExerciseComplete}
                disabled={!isActive}
              />
            ) : null}
          </div>
        )}

        {/* Exercise Notes */}
        <div className={styles.notesSection}>
          <Button
            variant="ghost"
            onClick={() => setShowNotes(!showNotes)}
            className={styles.notesToggle}
          >
            <MessageSquare className={styles.notesIcon} />
            {showNotes ? 'Hide Notes' : 'Add Notes'}
          </Button>

          {showNotes && (
            <textarea
              placeholder="Add notes about this exercise..."
              value={exerciseNotes}
              onChange={(e) => setExerciseNotes(e.target.value)}
              className={styles.notesInput}
            />
          )}
        </div>

        {/* Exercise Complete Button */}
        {isActive && isExerciseComplete && (
          <div className={styles.completeSection}>
            <div className={styles.completeMessage}>
              <CheckCircle className={styles.completeIcon} />
              <span>All sets completed!</span>
            </div>
            <Button
              onClick={handleExerciseComplete}
              className={styles.completeButton}
            >
              Complete Exercise
            </Button>
          </div>
        )}

        {/* Exercise Completed State */}
        {!isActive && isExerciseComplete && (
          <div className={styles.exerciseCompleted}>
            <CheckCircle className={styles.completedIcon} />
            <span>Exercise Completed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
