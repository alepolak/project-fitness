"use client";

import React from 'react';
import { Clock, Target, Dumbbell, TrendingUp } from 'lucide-react';
import type { SessionProgress as SessionProgressType } from '@/types';
import styles from './SessionProgress.module.css';

interface SessionProgressProps {
  progress: SessionProgressType;
}

export const SessionProgress: React.FC<SessionProgressProps> = ({ progress }) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exerciseProgressPercentage = progress.totalExercises > 0 
    ? (progress.exercisesCompleted / progress.totalExercises) * 100 
    : 0;

  const setProgressPercentage = progress.totalSets > 0 
    ? (progress.setsCompleted / progress.totalSets) * 100 
    : 0;

  return (
    <div className={styles.sessionProgress}>
      {/* Progress Bars */}
      <div className={styles.progressBars}>
        {/* Exercise Progress */}
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <div className={styles.progressLabel}>
              <Dumbbell className={styles.progressIcon} />
              <span>Exercises</span>
            </div>
            <span className={styles.progressText}>
              {progress.exercisesCompleted}/{progress.totalExercises}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${exerciseProgressPercentage}%` }}
            />
          </div>
        </div>

        {/* Set Progress */}
        {progress.totalSets > 0 && (
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <div className={styles.progressLabel}>
                <Target className={styles.progressIcon} />
                <span>Sets</span>
              </div>
              <span className={styles.progressText}>
                {progress.setsCompleted}/{progress.totalSets}
              </span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${setProgressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Time Information */}
      <div className={styles.timeInfo}>
        <div className={styles.timeSection}>
          <div className={styles.timeItem}>
            <Clock className={styles.timeIcon} />
            <div className={styles.timeDetails}>
              <span className={styles.timeLabel}>Elapsed</span>
              <span className={styles.timeValue}>
                {formatTime(progress.elapsedTime)}
              </span>
            </div>
          </div>
        </div>

        {progress.estimatedTimeRemaining > 0 && (
          <div className={styles.timeSection}>
            <div className={styles.timeItem}>
              <TrendingUp className={styles.timeIcon} />
              <div className={styles.timeDetails}>
                <span className={styles.timeLabel}>Est. Remaining</span>
                <span className={styles.timeValue}>
                  {formatTime(progress.estimatedTimeRemaining)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overall Progress */}
      <div className={styles.overallProgress}>
        <div className={styles.overallProgressBar}>
          <div 
            className={styles.overallProgressFill}
            style={{ width: `${exerciseProgressPercentage}%` }}
          />
        </div>
        <span className={styles.overallProgressText}>
          {Math.round(exerciseProgressPercentage)}% Complete
        </span>
      </div>
    </div>
  );
};
