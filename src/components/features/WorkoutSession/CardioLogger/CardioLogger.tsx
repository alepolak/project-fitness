"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  Heart, 
  Zap, 
  Clock, 
  Activity,
  Plus,
  Check,
  Target
} from 'lucide-react';
import type { ExercisePrescription, CardioSegment } from '@/types';
import styles from './CardioLogger.module.css';

interface CardioLoggerProps {
  prescription: ExercisePrescription;
  onSegmentComplete: (segment: CardioSegment) => void;
  onExerciseComplete: () => void;
  disabled?: boolean;
}

type TimerState = 'not-started' | 'running' | 'paused' | 'completed';

export const CardioLogger: React.FC<CardioLoggerProps> = ({
  prescription,
  onSegmentComplete,
  onExerciseComplete,
  disabled = false
}) => {
  // Timer state
  const [timerState, setTimerState] = useState<TimerState>('not-started');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState(0);
  
  // Cardio data
  const [heartRate, setHeartRate] = useState<number | undefined>();
  const [distance, setDistance] = useState<number | undefined>();
  const [speed, setSpeed] = useState<number | undefined>();
  const [incline, setIncline] = useState<number | undefined>();
  const [resistance, setResistance] = useState<number | undefined>();
  const [calories, setCalories] = useState<number | undefined>();
  const [notes, setNotes] = useState('');

  // Completed segments
  const [segments, setSegments] = useState<CardioSegment[]>([]);
  // const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  // Interval tracking
  const [isIntervalMode, setIsIntervalMode] = useState(false);
  const [intervalWork, setIntervalWork] = useState(30); // seconds
  const [intervalRest, setIntervalRest] = useState(30); // seconds
  const [currentInterval, setCurrentInterval] = useState<'work' | 'rest' | null>(null);
  const [intervalTimeRemaining, setIntervalTimeRemaining] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (timerState === 'running') {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        if (startTime) {
          setElapsedTime(Math.floor((now - startTime - pausedTime) / 1000));
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerState, startTime, pausedTime]);

  // Interval timer logic
  useEffect(() => {
    if (isIntervalMode && timerState === 'running' && currentInterval) {
      intervalRef.current = setInterval(() => {
        setIntervalTimeRemaining(prev => {
          if (prev <= 1) {
            // Switch intervals
            if (currentInterval === 'work') {
              setCurrentInterval('rest');
              return intervalRest;
            } else {
              setCurrentInterval('work');
              return intervalWork;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isIntervalMode, timerState, currentInterval, intervalWork, intervalRest]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    const now = Date.now();
    setStartTime(now);
    setTimerState('running');
    
    if (isIntervalMode) {
      setCurrentInterval('work');
      setIntervalTimeRemaining(intervalWork);
    }
  };

  const handlePause = () => {
    if (timerState === 'running') {
      setTimerState('paused');
      setPausedTime(prev => prev + (Date.now() - (startTime || 0)));
    }
  };

  const handleResume = () => {
    if (timerState === 'paused') {
      setStartTime(Date.now());
      setPausedTime(0);
      setTimerState('running');
    }
  };

  const handleStop = () => {
    setTimerState('completed');
    
    // Create final segment
    if (elapsedTime > 0) {
      const segment: CardioSegment = {
        segment_number: segments.length + 1,
        label: `Segment ${segments.length + 1}`,
        duration_seconds: elapsedTime,
        distance_value: distance || undefined,
        distance_unit: 'kilometers',
        speed_mph_or_kph: speed || undefined,
        incline_percent: incline || undefined,
        resistance_level: resistance || undefined,
        average_heart_rate_bpm: heartRate || undefined,
        notes: notes || undefined
      };
      
      onSegmentComplete(segment);
      setSegments(prev => [...prev, segment]);
    }
  };

  const handleAddSegment = () => {
    if (elapsedTime === 0) return;
    
    const segment: CardioSegment = {
      segment_number: segments.length + 1,
      label: `Segment ${segments.length + 1}`,
      duration_seconds: elapsedTime,
      distance_value: distance || undefined,
      distance_unit: 'kilometers',
      speed_mph_or_kph: speed || undefined,
      incline_percent: incline || undefined,
      resistance_level: resistance || undefined,
      average_heart_rate_bpm: heartRate || undefined,
      notes: notes || undefined
    };
    
    onSegmentComplete(segment);
    setSegments(prev => [...prev, segment]);
    // setCurrentSegmentIndex(prev => prev + 1);
    
    // Reset timer for next segment
    setElapsedTime(0);
    setStartTime(Date.now());
    setPausedTime(0);
    
    // Clear segment-specific data
    setDistance(undefined);
    setHeartRate(undefined);
    setSpeed(undefined);
    setIncline(undefined);
    setResistance(undefined);
    setCalories(undefined);
    setNotes('');
  };

  const handleComplete = () => {
    handleStop();
    onExerciseComplete();
  };

  const getTargetDuration = (): number | undefined => {
    if (!prescription.cardio_block) return undefined;
    const totalTime = prescription.cardio_block.warm_up_minutes * 60 + 
                     prescription.cardio_block.cool_down_minutes * 60 +
                     prescription.cardio_block.work_intervals.reduce((total, interval) => 
                       total + interval.hard_seconds + interval.easy_seconds, 0);
    return totalTime;
  };

  const getTotalDuration = (): number => {
    return segments.reduce((total, seg) => total + seg.duration_seconds, 0) + elapsedTime;
  };

  const getProgressPercentage = (): number => {
    const target = getTargetDuration();
    if (!target) return 0;
    return Math.min((getTotalDuration() / target) * 100, 100);
  };

  const isTargetReached = (): boolean => {
    const target = getTargetDuration();
    if (!target) return false;
    return getTotalDuration() >= target;
  };

  return (
    <div className={`${styles.cardioLogger} ${disabled ? styles.disabled : ''}`}>
      {/* Exercise Header */}
      <Card className={styles.exerciseHeader}>
        <CardHeader>
          <CardTitle className={styles.exerciseTitle}>
            <Activity className={styles.exerciseIcon} />
            Cardio Session
          </CardTitle>
          <div className={styles.exerciseTargets}>
            {prescription.cardio_block && (
              <>
                <Badge variant="outline">
                  <Clock className={styles.targetIcon} />
                  Warm-up: {prescription.cardio_block.warm_up_minutes}min
                </Badge>
                <Badge variant="outline">
                  <Zap className={styles.targetIcon} />
                  {prescription.cardio_block.work_intervals.length} intervals
                </Badge>
                <Badge variant="outline">
                  <Clock className={styles.targetIcon} />
                  Cool-down: {prescription.cardio_block.cool_down_minutes}min
                </Badge>
              </>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Progress Indicator */}
      {getTargetDuration() && (
        <Card className={styles.progressCard}>
          <CardContent>
            <div className={styles.progressHeader}>
              <span>Progress</span>
              <span>{formatTime(getTotalDuration())} / {formatTime(getTargetDuration()!)}</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            {isTargetReached() && (
              <div className={styles.targetReached}>
                <Target className={styles.targetReachedIcon} />
                <span>Target reached!</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Timer */}
      <Card className={`${styles.timerCard} ${styles[timerState]}`}>
        <CardContent>
          <div className={styles.timerDisplay}>
            <div className={styles.currentTime}>
              {formatTime(elapsedTime)}
            </div>
            <div className={styles.timerStatus}>
              <Badge variant={timerState === 'running' ? 'default' : 'secondary'}>
                {timerState === 'not-started' && 'Ready to start'}
                {timerState === 'running' && 'Recording'}
                {timerState === 'paused' && 'Paused'}
                {timerState === 'completed' && 'Completed'}
              </Badge>
            </div>
          </div>

          {/* Interval Display */}
          {isIntervalMode && currentInterval && timerState === 'running' && (
            <div className={styles.intervalDisplay}>
              <div className={`${styles.intervalIndicator} ${styles[currentInterval]}`}>
                <span className={styles.intervalLabel}>
                  {currentInterval === 'work' ? 'WORK' : 'REST'}
                </span>
                <span className={styles.intervalTime}>
                  {formatTime(intervalTimeRemaining)}
                </span>
              </div>
            </div>
          )}

          {/* Timer Controls */}
          <div className={styles.timerControls}>
            {timerState === 'not-started' && (
              <Button
                onClick={handleStart}
                disabled={disabled}
                className={styles.startButton}
              >
                <Play className={styles.controlIcon} />
                Start Cardio
              </Button>
            )}

            {timerState === 'running' && (
              <>
                <Button
                  variant="outline"
                  onClick={handlePause}
                  disabled={disabled}
                  className={styles.controlButton}
                >
                  <Pause className={styles.controlIcon} />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddSegment}
                  disabled={disabled || elapsedTime === 0}
                  className={styles.controlButton}
                >
                  <Plus className={styles.controlIcon} />
                  Add Segment
                </Button>
                <Button
                  variant="default"
                  onClick={handleStop}
                  disabled={disabled}
                  className={styles.stopButton}
                >
                  <Square className={styles.controlIcon} />
                  Stop
                </Button>
              </>
            )}

            {timerState === 'paused' && (
              <>
                <Button
                  onClick={handleResume}
                  disabled={disabled}
                  className={styles.controlButton}
                >
                  <Play className={styles.controlIcon} />
                  Resume
                </Button>
                <Button
                  variant="default"
                  onClick={handleStop}
                  disabled={disabled}
                  className={styles.stopButton}
                >
                  <Square className={styles.controlIcon} />
                  Stop
                </Button>
              </>
            )}

            {timerState === 'completed' && (
              <Button
                onClick={handleComplete}
                disabled={disabled}
                className={styles.completeButton}
              >
                <Check className={styles.controlIcon} />
                Complete Exercise
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interval Settings */}
      <Card className={styles.settingsCard}>
        <CardContent>
          <div className={styles.intervalSettings}>
            <div className={styles.settingToggle}>
              <input
                type="checkbox"
                id="interval-mode"
                checked={isIntervalMode}
                onChange={(e) => setIsIntervalMode(e.target.checked)}
                disabled={disabled || timerState !== 'not-started'}
                className={styles.toggleInput}
              />
              <label htmlFor="interval-mode" className={styles.toggleLabel}>
                Interval Training
              </label>
            </div>

            {isIntervalMode && (
              <div className={styles.intervalInputs}>
                <div className={styles.intervalInput}>
                  <Label htmlFor="work-time">Work (seconds)</Label>
                  <Input
                    id="work-time"
                    type="number"
                    value={intervalWork}
                    onChange={(e) => setIntervalWork(parseInt(e.target.value) || 30)}
                    disabled={disabled || timerState !== 'not-started'}
                    min="1"
                  />
                </div>
                <div className={styles.intervalInput}>
                  <Label htmlFor="rest-time">Rest (seconds)</Label>
                  <Input
                    id="rest-time"
                    type="number"
                    value={intervalRest}
                    onChange={(e) => setIntervalRest(parseInt(e.target.value) || 30)}
                    disabled={disabled || timerState !== 'not-started'}
                    min="1"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Input */}
      <Card className={styles.metricsCard}>
        <CardHeader>
          <CardTitle>Current Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.metricsGrid}>
            <div className={styles.metricInput}>
              <Label htmlFor="heart-rate">
                <Heart className={styles.metricIcon} />
                Heart Rate (bpm)
              </Label>
              <Input
                id="heart-rate"
                type="number"
                value={heartRate || ''}
                onChange={(e) => setHeartRate(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={disabled}
                min="40"
                max="220"
              />
            </div>

            <div className={styles.metricInput}>
              <Label htmlFor="distance">
                <Zap className={styles.metricIcon} />
                Distance (km)
              </Label>
              <Input
                id="distance"
                type="number"
                value={distance || ''}
                onChange={(e) => setDistance(e.target.value ? parseFloat(e.target.value) : undefined)}
                disabled={disabled}
                min="0"
                step="0.1"
              />
            </div>

            <div className={styles.metricInput}>
              <Label htmlFor="speed">Speed</Label>
              <Input
                id="speed"
                type="number"
                value={speed || ''}
                onChange={(e) => setSpeed(e.target.value ? parseFloat(e.target.value) : undefined)}
                disabled={disabled}
                min="0"
                step="0.1"
              />
            </div>

            <div className={styles.metricInput}>
              <Label htmlFor="incline">Incline (%)</Label>
              <Input
                id="incline"
                type="number"
                value={incline || ''}
                onChange={(e) => setIncline(e.target.value ? parseFloat(e.target.value) : undefined)}
                disabled={disabled}
                min="0"
                step="0.5"
              />
            </div>

            <div className={styles.metricInput}>
              <Label htmlFor="resistance">Resistance</Label>
              <Input
                id="resistance"
                type="number"
                value={resistance || ''}
                onChange={(e) => setResistance(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={disabled}
                min="1"
              />
            </div>

            <div className={styles.metricInput}>
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                value={calories || ''}
                onChange={(e) => setCalories(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={disabled}
                min="0"
              />
            </div>
          </div>

          {/* Segment Notes */}
          <div className={styles.notesInput}>
            <Label htmlFor="segment-notes">Segment Notes</Label>
            <Input
              id="segment-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={disabled}
              placeholder="Notes for this segment..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Completed Segments */}
      {segments.length > 0 && (
        <Card className={styles.segmentsCard}>
          <CardHeader>
            <CardTitle>Completed Segments ({segments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.segmentsList}>
              {segments.map((segment, index) => (
                <div key={index} className={styles.segmentItem}>
                  <div className={styles.segmentHeader}>
                    <span className={styles.segmentNumber}>Segment {index + 1}</span>
                    <span className={styles.segmentDuration}>{formatTime(segment.duration_seconds)}</span>
                  </div>
                  <div className={styles.segmentMetrics}>
                    {segment.distance_value && (
                      <span>{segment.distance_value} {segment.distance_unit || 'km'}</span>
                    )}
                    {segment.average_heart_rate_bpm && (
                      <span>{segment.average_heart_rate_bpm} bpm</span>
                    )}
                    {segment.speed_mph_or_kph && (
                      <span>{segment.speed_mph_or_kph} km/h</span>
                    )}
                  </div>
                  {segment.notes && (
                    <div className={styles.segmentNotes}>{segment.notes}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
