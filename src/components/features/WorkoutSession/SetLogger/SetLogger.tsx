"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dumbbell, 
  Plus, 
  Minus, 
  Check, 
  AlertTriangle,
  Heart,
  Clock
} from 'lucide-react';
import type { PerformedSet } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import styles from './SetLogger.module.css';

interface SetLoggerProps {
  setNumber: number;
  targetReps?: number;
  targetWeight?: number;
  weightUnit?: string;
  onSetComplete: (setData: PerformedSet) => void;
  disabled?: boolean;
}

export const SetLogger: React.FC<SetLoggerProps> = ({
  setNumber,
  targetReps,
  targetWeight,
  weightUnit = 'kg',
  onSetComplete,
  disabled = false
}) => {
  // Form state
  const [reps, setReps] = useState(targetReps || 0);
  const [weight, setWeight] = useState(targetWeight || 0);
  const [rpe, setRpe] = useState<number | undefined>();
  const [painLevel, setPainLevel] = useState<number | undefined>();
  const [restTime, setRestTime] = useState<number | undefined>();
  const [setNotes, setSetNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  // User preferences
  const [defaultWeightIncrement] = useLocalStorage('weight-increment', 2.5);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-populate from targets on mount
  useEffect(() => {
    if (targetReps && reps === 0) {
      setReps(targetReps);
    }
    if (targetWeight && weight === 0) {
      setWeight(targetWeight);
    }
  }, [targetReps, targetWeight, reps, weight]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!reps || reps < 1) {
      newErrors.reps = 'Reps must be at least 1';
    }

    if (weight < 0) {
      newErrors.weight = 'Weight cannot be negative';
    }

    if (rpe && (rpe < 1 || rpe > 10)) {
      newErrors.rpe = 'RPE must be between 1-10';
    }

    if (painLevel && (painLevel < 0 || painLevel > 10)) {
      newErrors.painLevel = 'Pain level must be between 0-10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRepsChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setReps(Math.max(0, numValue));
  };

  const handleWeightChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setWeight(Math.max(0, numValue));
  };

  const adjustWeight = (increment: number) => {
    setWeight(prev => Math.max(0, prev + increment));
  };

  const adjustReps = (increment: number) => {
    setReps(prev => Math.max(1, prev + increment));
  };

  const handleComplete = async () => {
    if (!validateForm() || isLogging) return;

    setIsLogging(true);

    try {
      const setData: PerformedSet = {
        set_number: setNumber,
        repetitions_done: reps,
        weight_value: weight || undefined,
        weight_unit: weightUnit as 'lb' | 'kg' | undefined,
        rpe_score: rpe || undefined,
        rest_seconds_observed: restTime || undefined,
        notes: setNotes || undefined,
        perceived_effort_text: rpe ? (rpe <= 2 ? 'very easy' : rpe <= 4 ? 'easy' : rpe <= 6 ? 'moderately hard' : rpe <= 8 ? 'hard' : 'very hard') : 'moderately hard',
        pain_back_0_to_10: painLevel || undefined
      };

      await onSetComplete(setData);

      // Reset form for next set (keep weight, reset others)
      setReps(targetReps || reps);
      setRpe(undefined);
      setPainLevel(undefined);
      setRestTime(undefined);
      setSetNotes('');
      setShowAdvancedFields(false);
    } catch (error) {
      console.error('Error logging set:', error);
    } finally {
      setIsLogging(false);
    }
  };

  const getRepsDifference = () => {
    if (!targetReps) return null;
    const diff = reps - targetReps;
    if (diff === 0) return null;
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const getWeightDifference = () => {
    if (!targetWeight) return null;
    const diff = weight - targetWeight;
    if (diff === 0) return null;
    return diff > 0 ? `+${diff}${weightUnit}` : `${diff}${weightUnit}`;
  };

  return (
    <div className={`${styles.setLogger} ${disabled ? styles.disabled : ''}`}>
      {/* Set Header */}
      <div className={styles.setHeader}>
        <div className={styles.setTitle}>
          <Dumbbell className={styles.setIcon} />
          <span>Set {setNumber}</span>
        </div>
        {(targetReps || targetWeight) && (
          <div className={styles.targets}>
            {targetReps && <Badge variant="outline">{targetReps} reps</Badge>}
            {targetWeight && <Badge variant="outline">{targetWeight}{weightUnit}</Badge>}
          </div>
        )}
      </div>

      {/* Main Inputs */}
      <div className={styles.mainInputs}>
        {/* Reps Input */}
        <div className={styles.inputGroup}>
          <Label htmlFor={`reps-${setNumber}`} className={styles.inputLabel}>
            Reps
            {getRepsDifference() && (
              <span className={styles.difference}>
                ({getRepsDifference()})
              </span>
            )}
          </Label>
          <div className={styles.numberInput}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustReps(-1)}
              disabled={disabled || reps <= 1}
              className={styles.adjustButton}
            >
              <Minus className={styles.adjustIcon} />
            </Button>
            <Input
              id={`reps-${setNumber}`}
              type="number"
              value={reps || ''}
              onChange={(e) => handleRepsChange(e.target.value)}
              disabled={disabled}
              className={styles.numberField}
              min="1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustReps(1)}
              disabled={disabled}
              className={styles.adjustButton}
            >
              <Plus className={styles.adjustIcon} />
            </Button>
          </div>
          {errors.reps && (
            <span className={styles.error}>{errors.reps}</span>
          )}
        </div>

        {/* Weight Input */}
        <div className={styles.inputGroup}>
          <Label htmlFor={`weight-${setNumber}`} className={styles.inputLabel}>
            Weight ({weightUnit})
            {getWeightDifference() && (
              <span className={styles.difference}>
                ({getWeightDifference()})
              </span>
            )}
          </Label>
          <div className={styles.numberInput}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustWeight(-defaultWeightIncrement)}
              disabled={disabled || weight <= 0}
              className={styles.adjustButton}
            >
              <Minus className={styles.adjustIcon} />
            </Button>
            <Input
              id={`weight-${setNumber}`}
              type="number"
              value={weight || ''}
              onChange={(e) => handleWeightChange(e.target.value)}
              disabled={disabled}
              className={styles.numberField}
              min="0"
              step={defaultWeightIncrement}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adjustWeight(defaultWeightIncrement)}
              disabled={disabled}
              className={styles.adjustButton}
            >
              <Plus className={styles.adjustIcon} />
            </Button>
          </div>
          {errors.weight && (
            <span className={styles.error}>{errors.weight}</span>
          )}
        </div>
      </div>

      {/* Advanced Fields Toggle */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => setShowAdvancedFields(!showAdvancedFields)}
        disabled={disabled}
        className={styles.advancedToggle}
      >
        {showAdvancedFields ? 'Hide' : 'Show'} Advanced Tracking
      </Button>

      {/* Advanced Fields */}
      {showAdvancedFields && (
        <div className={styles.advancedFields}>
          {/* RPE (Rate of Perceived Exertion) */}
          <div className={styles.inputGroup}>
            <Label htmlFor={`rpe-${setNumber}`} className={styles.inputLabel}>
              <Heart className={styles.fieldIcon} />
              RPE (1-10)
            </Label>
            <Select
              value={rpe?.toString() || ''}
              onValueChange={(value) => setRpe(value ? parseInt(value) : undefined)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select RPE" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value} - {getRPEDescription(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rpe && (
              <span className={styles.error}>{errors.rpe}</span>
            )}
          </div>

          {/* Pain Level */}
          <div className={styles.inputGroup}>
            <Label htmlFor={`pain-${setNumber}`} className={styles.inputLabel}>
              <AlertTriangle className={styles.fieldIcon} />
              Pain Level (0-10)
            </Label>
            <Select
              value={painLevel?.toString() || ''}
              onValueChange={(value) => setPainLevel(value ? parseInt(value) : undefined)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="No pain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No pain</SelectItem>
                {Array.from({ length: 11 }, (_, i) => i).map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value} - {getPainDescription(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.painLevel && (
              <span className={styles.error}>{errors.painLevel}</span>
            )}
          </div>

          {/* Rest Time */}
          <div className={styles.inputGroup}>
            <Label htmlFor={`rest-${setNumber}`} className={styles.inputLabel}>
              <Clock className={styles.fieldIcon} />
              Rest Time (seconds)
            </Label>
            <Input
              id={`rest-${setNumber}`}
              type="number"
              value={restTime || ''}
              onChange={(e) => setRestTime(e.target.value ? parseInt(e.target.value) : undefined)}
              disabled={disabled}
              placeholder="Auto-tracked"
              min="0"
            />
          </div>

          {/* Set Notes */}
          <div className={styles.inputGroup}>
            <Label htmlFor={`notes-${setNumber}`} className={styles.inputLabel}>
              Notes
            </Label>
            <Input
              id={`notes-${setNumber}`}
              type="text"
              value={setNotes}
              onChange={(e) => setSetNotes(e.target.value)}
              disabled={disabled}
              placeholder="Set-specific notes..."
            />
          </div>
        </div>
      )}

      {/* Complete Set Button */}
      <Button
        onClick={handleComplete}
        disabled={disabled || isLogging || !reps}
        className={styles.completeButton}
      >
        {isLogging ? (
          <>
            <div className={styles.loadingSpinner} />
            Logging...
          </>
        ) : (
          <>
            <Check className={styles.completeIcon} />
            Complete Set {setNumber}
          </>
        )}
      </Button>
    </div>
  );
};

// Helper functions
const getRPEDescription = (rpe: number): string => {
  const descriptions = {
    1: 'Very Easy',
    2: 'Easy',
    3: 'Moderate',
    4: 'Somewhat Hard',
    5: 'Hard',
    6: 'Hard+',
    7: 'Very Hard',
    8: 'Very Hard+',
    9: 'Extremely Hard',
    10: 'Maximum'
  };
  return descriptions[rpe as keyof typeof descriptions] || '';
};

const getPainDescription = (pain: number): string => {
  if (pain === 0) return 'No pain';
  if (pain <= 2) return 'Mild';
  if (pain <= 4) return 'Moderate';
  if (pain <= 6) return 'Severe';
  if (pain <= 8) return 'Very severe';
  return 'Worst possible';
};
