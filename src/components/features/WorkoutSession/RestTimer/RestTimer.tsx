"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Plus, 
  Minus, 
  Clock,
  Zap
} from 'lucide-react';
import { useRestTimer } from '@/hooks/useRestTimer';
import styles from './RestTimer.module.css';

interface RestTimerProps {
  onComplete: () => void;
  onSkip: () => void;
  className?: string;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  onComplete,
  onSkip,
  className = ''
}) => {
  const {
    isActive,
    timeRemaining,
    initialTime,
    progress,
    isCompleted,
    pauseTimer,
    resumeTimer,
    extendTimer,
    skipTimer
  } = useRestTimer();

  const [showExtendOptions, setShowExtendOptions] = useState(false);

  // Handle timer completion
  useEffect(() => {
    if (isCompleted) {
      onComplete();
    }
  }, [isCompleted, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return progress * 100;
  };

  const getTimerStatus = (): 'active' | 'paused' | 'completed' => {
    if (isCompleted) return 'completed';
    if (!isActive) return 'paused';
    return 'active';
  };

  const handlePauseResume = () => {
    if (isActive) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  };

  const handleExtend = (seconds: number) => {
    extendTimer(seconds);
    setShowExtendOptions(false);
  };

  const handleSkip = () => {
    skipTimer();
    onSkip();
  };

  if (!isActive && timeRemaining === 0 && !isCompleted) {
    return null; // Timer not running
  }

  const status = getTimerStatus();
  const progressPercentage = getProgressPercentage();

  return (
    <div className={`${styles.restTimerOverlay} ${className}`}>
      <Card className={`${styles.restTimer} ${styles[status]}`}>
        <CardContent className={styles.timerContent}>
          {/* Timer Header */}
          <div className={styles.timerHeader}>
            <div className={styles.timerTitle}>
              <Clock className={styles.timerIcon} />
              <span>Rest Timer</span>
            </div>
                          {/* Context info removed since useRestTimer doesn't provide exercise/set context */}
          </div>

          {/* Main Timer Display */}
          <div className={styles.timerDisplay}>
            <div className={styles.timeRemaining}>
              {formatTime(timeRemaining)}
            </div>
            <div className={styles.initialTime}>
              / {formatTime(initialTime)}
            </div>
          </div>

          {/* Progress Ring */}
          <div className={styles.progressRing}>
            <svg className={styles.progressSvg} viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className={styles.progressBackground}
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className={styles.progressForeground}
                style={{
                  strokeDasharray: `${progressPercentage * 2.827} 282.7`,
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%'
                }}
              />
            </svg>
            
            {/* Timer Status Icon */}
            <div className={styles.statusIcon}>
              {status === 'completed' && <Zap className={styles.completedIcon} />}
              {status === 'paused' && <Pause className={styles.pausedIcon} />}
              {status === 'active' && (
                <div className={styles.activeIndicator}>
                  <div className={styles.pulse} />
                </div>
              )}
            </div>
          </div>

          {/* Timer Controls */}
          <div className={styles.timerControls}>
            {status !== 'completed' && (
              <>
                <Button
                  variant="outline"
                  onClick={handlePauseResume}
                  className={styles.controlButton}
                >
                  {isActive ? (
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

                <Button
                  variant="outline"
                  onClick={() => setShowExtendOptions(!showExtendOptions)}
                  className={styles.controlButton}
                >
                  <Clock className={styles.controlIcon} />
                  Extend
                </Button>

                <Button
                  variant="default"
                  onClick={handleSkip}
                  className={styles.skipButton}
                >
                  <SkipForward className={styles.controlIcon} />
                  Skip
                </Button>
              </>
            )}

            {status === 'completed' && (
              <Button
                variant="default"
                onClick={onComplete}
                className={styles.doneButton}
              >
                <Zap className={styles.controlIcon} />
                Continue Workout
              </Button>
            )}
          </div>

          {/* Extend Options */}
          {showExtendOptions && (
            <div className={styles.extendOptions}>
              <div className={styles.extendTitle}>Extend rest time:</div>
              <div className={styles.extendButtons}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtend(15)}
                  className={styles.extendButton}
                >
                  <Plus className={styles.extendIcon} />
                  15s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtend(30)}
                  className={styles.extendButton}
                >
                  <Plus className={styles.extendIcon} />
                  30s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtend(60)}
                  className={styles.extendButton}
                >
                  <Plus className={styles.extendIcon} />
                  1m
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtend(-30)}
                  disabled={timeRemaining <= 30}
                  className={styles.extendButton}
                >
                  <Minus className={styles.extendIcon} />
                  30s
                </Button>
              </div>
            </div>
          )}

          {/* Timer Tips */}
          {status === 'active' && (
            <div className={styles.timerTips}>
              <p>Take deep breaths and stay hydrated</p>
            </div>
          )}

          {status === 'completed' && (
            <div className={styles.completedMessage}>
              <Zap className={styles.completedMessageIcon} />
              <p>Rest complete! Ready for your next set?</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
