"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Clock, Dumbbell, Target } from 'lucide-react';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { useRestTimer } from '@/hooks/useRestTimer';
import type { Session, ExerciseCatalogItem, PerformedSet } from '@/types';
import { ActiveExerciseCard } from '../ActiveExerciseCard';
import { RestTimer } from '../RestTimer';
import { SessionProgress } from '../SessionProgress';
import styles from './ActiveSession.module.css';

interface ActiveSessionProps {
  sessionPlan: Session;
  exercises: ExerciseCatalogItem[];
  onComplete: () => void;
  onAbandon: () => void;
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({
  sessionPlan,
  exercises,
  onComplete,
  onAbandon
}) => {
  const {
    activeSession,
    isLoading,
    error,
    startSession,
    completeSet,
    completeExercise,
    completeSession,
    pauseSession,
    resumeSession,
    abandonSession,
    getSessionProgress
  } = useWorkoutSession();

  const {
    isActive: timerIsActive,
    timeRemaining,
    startTimer,
    pauseTimer,
    resumeTimer,
    skipTimer
  } = useRestTimer();

  const [showRestTimer, setShowRestTimer] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRating, setSessionRating] = useState<1 | 2 | 3 | 4 | 5 | undefined>();

  // Get current exercise
  const currentExercise = activeSession 
    ? sessionPlan.exercises[activeSession.currentExerciseIndex]
    : null;

  const currentExerciseData = currentExercise
    ? exercises.find(ex => ex.id === currentExercise.exercise_id)
    : null;

  // Initialize session if not started
  useEffect(() => {
    if (!activeSession && !isLoading) {
      startSession(sessionPlan);
    }
  }, [activeSession, isLoading, startSession, sessionPlan, exercises]);

  // Handle session status changes
  const handlePauseResume = async () => {
    if (!activeSession) return;

    if (activeSession.sessionStatus === 'active') {
      await pauseSession();
      if (timerIsActive) {
        pauseTimer();
      }
    } else if (activeSession.sessionStatus === 'paused') {
      await resumeSession();
      if (timeRemaining > 0) {
        resumeTimer();
      }
    }
  };

  const handleSetComplete = async (setData: PerformedSet) => {
    if (!activeSession || !currentExercise) return;

    await completeSet(activeSession.currentExerciseIndex, setData);

    // Start rest timer if this isn't the last set
    if (currentExercise.sets && currentExercise.sets.length > 0) {
      const strengthEntry = activeSession.workoutLog.entries
        .find(entry => entry.type === 'strength' && entry.exercise_id === currentExercise.exercise_id);
      const currentSetCount = strengthEntry?.type === 'strength' ? strengthEntry.performed_sets.length : 0;

      if (currentSetCount < (currentExercise.sets?.length || 0)) {
        const restTime = currentExercise.sets[currentSetCount - 1]?.rest_seconds || 60;
        startTimer(restTime);
        setShowRestTimer(true);
      }
    }
  };

  const handleExerciseComplete = async (_notes?: string) => {
    if (!activeSession) return;

    await completeExercise(activeSession.currentExerciseIndex);
    setShowRestTimer(false);
    
    // Check if workout is complete
    if (activeSession.currentExerciseIndex + 1 >= sessionPlan.exercises.length) {
      // Show completion dialog or automatically complete
      handleWorkoutComplete();
    }
  };

  const handleWorkoutComplete = async () => {
    if (!activeSession) return;

    await completeSession(sessionNotes, sessionRating);
    onComplete();
  };

  const handleAbandon = async () => {
    if (!activeSession) return;

    await abandonSession();
    onAbandon();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Setting up your workout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={styles.errorCard}>
        <CardContent>
          <p className={styles.errorMessage}>Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!activeSession) {
    return (
      <Card className={styles.noSessionCard}>
        <CardContent>
          <p>No active session found</p>
          <Button onClick={() => startSession(sessionPlan)}>
            Start Workout
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Session completed
  if (activeSession.sessionStatus === 'completed') {
    return (
      <Card className={styles.completedCard}>
        <CardHeader>
          <CardTitle className={styles.completedTitle}>
            🎉 Workout Completed!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.completedStats}>
            <div className={styles.statItem}>
              <Clock className={styles.statIcon} />
              <span>Duration: {formatTime(activeSession ? getSessionProgress().elapsedTime : 0)}</span>
            </div>
            <div className={styles.statItem}>
              <Dumbbell className={styles.statIcon} />
              <span>Exercises: {activeSession ? getSessionProgress().exercisesCompleted : 0}</span>
            </div>
            <div className={styles.statItem}>
              <Target className={styles.statIcon} />
              <span>Sets: {activeSession ? getSessionProgress().setsCompleted : 0}</span>
            </div>
          </div>
          <Button 
            onClick={onComplete}
            className={styles.completeButton}
          >
            View Summary
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={styles.activeSession}>
      {/* Session Header */}
      <Card className={styles.sessionHeader}>
        <CardHeader>
          <div className={styles.headerContent}>
            <CardTitle>{sessionPlan.title}</CardTitle>
            <Badge 
              variant={activeSession.sessionStatus === 'active' ? 'default' : 'secondary'}
              className={styles.statusBadge}
            >
              {activeSession.sessionStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {activeSession && (
            <SessionProgress progress={getSessionProgress()} />
          )}
        </CardContent>
      </Card>

      {/* Session Controls */}
      <Card className={styles.sessionControls}>
        <CardContent>
          <div className={styles.controlsGrid}>
            <Button
              onClick={handlePauseResume}
              variant={activeSession.sessionStatus === 'active' ? 'secondary' : 'default'}
              className={styles.controlButton}
            >
              {activeSession.sessionStatus === 'active' ? (
                <>
                  <Pause className={styles.controlIcon} />
                  Pause
                </>
              ) : (
                <>
                  <Play className={styles.controlIcon} />
                  Resume
                </>
              )}
            </Button>

            <div className={styles.timeDisplay}>
              <Clock className={styles.timeIcon} />
              <span className={styles.timeText}>
                {formatTime(activeSession ? getSessionProgress().elapsedTime : 0)}
              </span>
            </div>

            <Button
              onClick={handleAbandon}
              variant="destructive"
              className={styles.controlButton}
            >
              <Square className={styles.controlIcon} />
              End
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rest Timer Overlay */}
      {showRestTimer && timerIsActive && (
        <RestTimer
          onComplete={() => setShowRestTimer(false)}
          onSkip={() => {
            skipTimer();
            setShowRestTimer(false);
          }}
        />
      )}

      {/* Current Exercise */}
      {currentExercise && currentExerciseData && (
        <div className={styles.currentExercise}>
          <ActiveExerciseCard
            exercise={currentExerciseData}
            prescription={currentExercise}
            onSetComplete={handleSetComplete}
            onExerciseComplete={handleExerciseComplete}
            isActive={activeSession.sessionStatus === 'active'}
            completedSets={
              (() => {
                const entry = activeSession.workoutLog.entries
                  .find(entry => entry.type === 'strength' && entry.exercise_id === currentExercise.exercise_id);
                return entry?.type === 'strength' ? entry.performed_sets : [];
              })()
            }
          />
        </div>
      )}

      {/* Session completed - final notes */}
      {activeSession.currentExerciseIndex >= sessionPlan.exercises.length && (
        <Card className={styles.sessionSummary}>
          <CardHeader>
            <CardTitle>Workout Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.summaryContent}>
              <textarea
                placeholder="Add session notes (optional)"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className={styles.notesInput}
              />
              
              <div className={styles.ratingSection}>
                <label>Rate this workout:</label>
                <div className={styles.ratingButtons}>
                  {([1, 2, 3, 4, 5] as const).map((rating) => (
                    <Button
                      key={rating}
                      variant={sessionRating === rating ? 'default' : 'outline'}
                      onClick={() => setSessionRating(rating)}
                      className={styles.ratingButton}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleWorkoutComplete}
                className={styles.completeButton}
              >
                Complete Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
