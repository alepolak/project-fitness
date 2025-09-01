"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale, Calendar, Clock, Info } from "lucide-react";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { BodyMetricEntry, CreateData } from '@/types';
import styles from './WeightEntry.module.css';

interface WeightEntryProps {
  onSave: (entry: CreateData<BodyMetricEntry>) => void;
  currentEntry?: BodyMetricEntry;
  unitSystem: 'imperial' | 'metric';
  onCancel?: () => void;
  isLoading?: boolean;
}

/**
 * Weight entry form component
 * Following cursor rules for client components and form handling
 */
export const WeightEntry: React.FC<WeightEntryProps> = ({
  onSave,
  currentEntry,
  unitSystem,
  onCancel,
  isLoading = false
}) => {
  // Form state
  const [formData, setFormData] = useState({
    date: currentEntry?.date || new Date().toISOString().split('T')[0],
    body_weight: currentEntry?.body_weight?.toString() || '',
    weight_unit: currentEntry?.weight_unit || (unitSystem === 'imperial' ? 'lb' : 'kg'),
    body_fat_percent: currentEntry?.body_fat_percent?.toString() || '',
    body_muscle_percent: currentEntry?.body_muscle_percent?.toString() || '',
    hydration_percent: currentEntry?.hydration_percent?.toString() || '',
    bone_mass: currentEntry?.bone_mass?.toString() || '',
    visceral_fat_rating: currentEntry?.visceral_fat_rating?.toString() || '',
    metabolic_age: currentEntry?.metabolic_age?.toString() || '',
    measurement_device: currentEntry?.measurement_device || '',
    measurement_time: currentEntry?.measurement_time || '',
    notes: currentEntry?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get user's preferred measurement device
  const [savedDevice] = useLocalStorage('preferred_scale_device', '');
  const [savedTime] = useLocalStorage('preferred_measurement_time', '');

  // Handle input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.body_weight) {
      newErrors.body_weight = 'Weight is required';
    } else if (isNaN(Number(formData.body_weight)) || Number(formData.body_weight) <= 0) {
      newErrors.body_weight = 'Weight must be a positive number';
    } else if (Number(formData.body_weight) > 1000) {
      newErrors.body_weight = 'Weight seems unrealistic';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (new Date(formData.date) > new Date()) {
      newErrors.date = 'Date cannot be in the future';
    }

    // Optional field validations
    if (formData.body_fat_percent) {
      const bodyFat = Number(formData.body_fat_percent);
      if (isNaN(bodyFat) || bodyFat < 0 || bodyFat > 100) {
        newErrors.body_fat_percent = 'Body fat must be between 0-100%';
      }
    }

    if (formData.body_muscle_percent) {
      const muscle = Number(formData.body_muscle_percent);
      if (isNaN(muscle) || muscle < 0 || muscle > 100) {
        newErrors.body_muscle_percent = 'Muscle mass must be between 0-100%';
      }
    }

    if (formData.hydration_percent) {
      const hydration = Number(formData.hydration_percent);
      if (isNaN(hydration) || hydration < 0 || hydration > 100) {
        newErrors.hydration_percent = 'Hydration must be between 0-100%';
      }
    }

    if (formData.visceral_fat_rating) {
      const visceral = Number(formData.visceral_fat_rating);
      if (isNaN(visceral) || visceral < 1 || visceral > 59) {
        newErrors.visceral_fat_rating = 'Visceral fat rating must be between 1-59';
      }
    }

    if (formData.metabolic_age) {
      const age = Number(formData.metabolic_age);
      if (isNaN(age) || age < 10 || age > 120) {
        newErrors.metabolic_age = 'Metabolic age must be between 10-120';
      }
    }

    if (formData.measurement_time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.measurement_time)) {
      newErrors.measurement_time = 'Time must be in HH:MM format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const entry: CreateData<BodyMetricEntry> = {
        date: formData.date,
        body_weight: Number(formData.body_weight),
        weight_unit: formData.weight_unit as 'lb' | 'kg',
        ...(formData.body_fat_percent && { body_fat_percent: Number(formData.body_fat_percent) }),
        ...(formData.body_muscle_percent && { body_muscle_percent: Number(formData.body_muscle_percent) }),
        ...(formData.hydration_percent && { hydration_percent: Number(formData.hydration_percent) }),
        ...(formData.bone_mass && { bone_mass: Number(formData.bone_mass) }),
        ...(formData.visceral_fat_rating && { visceral_fat_rating: Number(formData.visceral_fat_rating) }),
        ...(formData.metabolic_age && { metabolic_age: Number(formData.metabolic_age) }),
        ...(formData.measurement_device && { measurement_device: formData.measurement_device }),
        ...(formData.measurement_time && { measurement_time: formData.measurement_time }),
        ...(formData.notes && { notes: formData.notes })
      };

      await onSave(entry);
    } catch (error) {
      console.error('Failed to save weight entry:', error);
    }
  }, [formData, validateForm, onSave]);

  // Quick fill options
  const quickFillDevice = useCallback(() => {
    if (savedDevice) {
      handleInputChange('measurement_device', savedDevice);
    }
  }, [savedDevice, handleInputChange]);

  const quickFillTime = useCallback(() => {
    if (savedTime) {
      handleInputChange('measurement_time', savedTime);
    } else {
      // Default to current time
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      handleInputChange('measurement_time', timeString);
    }
  }, [savedTime, handleInputChange]);

  return (
    <Card className={styles.weightEntryCard}>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>
          <Scale className={styles.titleIcon} />
          {currentEntry ? 'Edit Weight Entry' : 'Log Weight'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Basic Information */}
          <div className={styles.basicSection}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Label htmlFor="date" className={styles.label}>
                  <Calendar className={styles.labelIcon} />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={errors.date ? styles.inputError : ''}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.date && <span className={styles.errorText}>{errors.date}</span>}
              </div>

              <div className={styles.formGroup}>
                <Label htmlFor="measurement_time" className={styles.label}>
                  <Clock className={styles.labelIcon} />
                  Time (optional)
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={quickFillTime}
                    className={styles.quickFillButton}
                  >
                    Now
                  </Button>
                </Label>
                <Input
                  id="measurement_time"
                  type="time"
                  value={formData.measurement_time}
                  onChange={(e) => handleInputChange('measurement_time', e.target.value)}
                  className={errors.measurement_time ? styles.inputError : ''}
                />
                {errors.measurement_time && <span className={styles.errorText}>{errors.measurement_time}</span>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Label htmlFor="body_weight" className={styles.label}>
                  Weight *
                </Label>
                <div className={styles.weightInputGroup}>
                  <Input
                    id="body_weight"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.body_weight}
                    onChange={(e) => handleInputChange('body_weight', e.target.value)}
                    className={errors.body_weight ? styles.inputError : ''}
                  />
                  <Select
                    value={formData.weight_unit}
                    onValueChange={(value) => handleInputChange('weight_unit', value)}
                  >
                    <SelectTrigger className={styles.unitSelector}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lb">lbs</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.body_weight && <span className={styles.errorText}>{errors.body_weight}</span>}
              </div>

              <div className={styles.formGroup}>
                <Label htmlFor="measurement_device" className={styles.label}>
                  Scale/Device (optional)
                  {savedDevice && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={quickFillDevice}
                      className={styles.quickFillButton}
                    >
                      Use Saved
                    </Button>
                  )}
                </Label>
                <Input
                  id="measurement_device"
                  placeholder="e.g., Withings Body+"
                  value={formData.measurement_device}
                  onChange={(e) => handleInputChange('measurement_device', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Advanced Metrics Toggle */}
          <div className={styles.advancedToggle}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={styles.toggleButton}
            >
              <Info className={styles.toggleIcon} />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Metrics
            </Button>
          </div>

          {/* Advanced Metrics */}
          {showAdvanced && (
            <div className={styles.advancedSection}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <Label htmlFor="body_fat_percent" className={styles.label}>
                    Body Fat %
                  </Label>
                  <Input
                    id="body_fat_percent"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="0.0"
                    value={formData.body_fat_percent}
                    onChange={(e) => handleInputChange('body_fat_percent', e.target.value)}
                    className={errors.body_fat_percent ? styles.inputError : ''}
                  />
                  {errors.body_fat_percent && <span className={styles.errorText}>{errors.body_fat_percent}</span>}
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="body_muscle_percent" className={styles.label}>
                    Muscle Mass %
                  </Label>
                  <Input
                    id="body_muscle_percent"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="0.0"
                    value={formData.body_muscle_percent}
                    onChange={(e) => handleInputChange('body_muscle_percent', e.target.value)}
                    className={errors.body_muscle_percent ? styles.inputError : ''}
                  />
                  {errors.body_muscle_percent && <span className={styles.errorText}>{errors.body_muscle_percent}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <Label htmlFor="hydration_percent" className={styles.label}>
                    Hydration %
                  </Label>
                  <Input
                    id="hydration_percent"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="0.0"
                    value={formData.hydration_percent}
                    onChange={(e) => handleInputChange('hydration_percent', e.target.value)}
                    className={errors.hydration_percent ? styles.inputError : ''}
                  />
                  {errors.hydration_percent && <span className={styles.errorText}>{errors.hydration_percent}</span>}
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="visceral_fat_rating" className={styles.label}>
                    Visceral Fat Rating
                  </Label>
                  <Input
                    id="visceral_fat_rating"
                    type="number"
                    min="1"
                    max="59"
                    placeholder="1-59"
                    value={formData.visceral_fat_rating}
                    onChange={(e) => handleInputChange('visceral_fat_rating', e.target.value)}
                    className={errors.visceral_fat_rating ? styles.inputError : ''}
                  />
                  {errors.visceral_fat_rating && <span className={styles.errorText}>{errors.visceral_fat_rating}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <Label htmlFor="bone_mass" className={styles.label}>
                    Bone Mass ({formData.weight_unit})
                  </Label>
                  <Input
                    id="bone_mass"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={formData.bone_mass}
                    onChange={(e) => handleInputChange('bone_mass', e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <Label htmlFor="metabolic_age" className={styles.label}>
                    Metabolic Age
                  </Label>
                  <Input
                    id="metabolic_age"
                    type="number"
                    min="10"
                    max="120"
                    placeholder="Age"
                    value={formData.metabolic_age}
                    onChange={(e) => handleInputChange('metabolic_age', e.target.value)}
                    className={errors.metabolic_age ? styles.inputError : ''}
                  />
                  {errors.metabolic_age && <span className={styles.errorText}>{errors.metabolic_age}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className={styles.notesSection}>
            <Label htmlFor="notes" className={styles.label}>
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this measurement..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className={styles.notesTextarea}
              maxLength={500}
            />
            <div className={styles.characterCount}>
              {formData.notes.length}/500 characters
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
                className={styles.cancelButton}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading}
              className={styles.saveButton}
            >
              {isLoading ? 'Saving...' : (currentEntry ? 'Update Entry' : 'Save Entry')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
