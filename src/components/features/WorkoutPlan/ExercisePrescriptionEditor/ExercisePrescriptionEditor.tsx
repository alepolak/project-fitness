"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { FriendlySentenceGenerator } from "@/utils/friendlySentences";
import type { 
  ExercisePrescription, 
  SetPrescription, 
  CardioBlock, 
  CardioInterval,
  ExerciseCatalogItem 
} from "@/types";
import styles from "./ExercisePrescriptionEditor.module.css";

interface ExercisePrescriptionEditorProps {
  prescription: ExercisePrescription;
  exercise: ExerciseCatalogItem;
  onUpdate: (prescription: ExercisePrescription) => void;
  unitSystem: 'imperial' | 'metric';
}

export function ExercisePrescriptionEditor({
  prescription,
  exercise,
  onUpdate,
  unitSystem,
}: ExercisePrescriptionEditorProps) {
  const [localPrescription, setLocalPrescription] = useState<ExercisePrescription>(prescription);
  const [autoDescription, setAutoDescription] = useState("");

  // Generate auto description when prescription changes
  useEffect(() => {
    const generated = FriendlySentenceGenerator.generateExerciseDescription(
      localPrescription,
      exercise,
      unitSystem
    );
    setAutoDescription(generated);
  }, [localPrescription, exercise, unitSystem]);

  const handleUpdate = useCallback((updates: Partial<ExercisePrescription>) => {
    const updatedPrescription = { ...localPrescription, ...updates };
    setLocalPrescription(updatedPrescription);
    onUpdate(updatedPrescription);
  }, [localPrescription, onUpdate]);

  const isStrengthExercise = exercise.exercise_type === 'strength';
  const isCardioExercise = exercise.exercise_type === 'cardio';

  return (
    <div className={styles.prescriptionEditor}>
      {/* Header */}
      <Card className={styles.headerCard}>
        <CardHeader>
          <CardTitle className={styles.exerciseTitle}>
            {exercise.beginner_friendly_name}
          </CardTitle>
          <div className={styles.exerciseMeta}>
            <Badge variant="outline">{exercise.movement_pattern}</Badge>
            <Badge variant="secondary">{exercise.difficulty_level}</Badge>
            <Badge variant="outline">{exercise.exercise_type}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Custom Description */}
      <Card className={styles.descriptionCard}>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent className={styles.descriptionContent}>
          <div className={styles.descriptionField}>
            <Label htmlFor="custom-description">Custom Description (optional)</Label>
            <Textarea
              id="custom-description"
              placeholder="Leave blank to use auto-generated description"
              value={localPrescription.clear_description}
              onChange={(e) => handleUpdate({ clear_description: e.target.value })}
              className={styles.textarea}
            />
          </div>
          
          <div className={styles.autoDescription}>
            <div className={styles.autoDescriptionHeader}>
              <Label>Auto-generated Description:</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdate({ clear_description: autoDescription })}
                className={styles.useAutoButton}
              >
                <RotateCcw className={styles.buttonIcon} />
                Use Auto
              </Button>
            </div>
            <p className={styles.autoDescriptionText}>{autoDescription}</p>
          </div>
        </CardContent>
      </Card>

      {/* Strength Prescription */}
      {isStrengthExercise && (
        <StrengthPrescriptionEditor
          prescription={localPrescription}
          onUpdate={handleUpdate}
          unitSystem={unitSystem}
        />
      )}

      {/* Cardio Prescription */}
      {isCardioExercise && (
        <CardioPrescriptionEditor
          prescription={localPrescription}
          onUpdate={handleUpdate}
        />
      )}

      {/* Form Cues */}
      <Card className={styles.cuesCard}>
        <CardHeader>
          <CardTitle>Form Cues & Notes</CardTitle>
        </CardHeader>
        <CardContent className={styles.cuesContent}>
          <div className={styles.cuesField}>
            <Label htmlFor="rest-notes">Rest & Recovery Notes</Label>
            <Textarea
              id="rest-notes"
              placeholder="Any specific rest or recovery instructions..."
              value={localPrescription.rest_notes || ""}
              onChange={(e) => handleUpdate({ rest_notes: e.target.value })}
              className={styles.textarea}
            />
          </div>

          <div className={styles.cuesField}>
            <Label htmlFor="form-cues">Form Cues (one per line)</Label>
            <Textarea
              id="form-cues"
              placeholder="Keep your back straight&#10;Engage your core&#10;Breathe steadily"
              value={localPrescription.form_cues?.join('\n') || ""}
              onChange={(e) => handleUpdate({ 
                form_cues: e.target.value.split('\n').filter(cue => cue.trim() !== '') 
              })}
              className={styles.textarea}
            />
          </div>
        </CardContent>
      </Card>

      {/* Safety Notes Display */}
      {exercise.safety_notes.length > 0 && (
        <Card className={styles.safetyCard}>
          <CardHeader>
            <CardTitle className={styles.safetyTitle}>Safety Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={styles.safetyList}>
              {exercise.safety_notes.map((note, index) => (
                <li key={index} className={styles.safetyNote}>
                  {note}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Strength Prescription Sub-Component
interface StrengthPrescriptionEditorProps {
  prescription: ExercisePrescription;
  onUpdate: (updates: Partial<ExercisePrescription>) => void;
  unitSystem: 'imperial' | 'metric';
}

function StrengthPrescriptionEditor({
  prescription,
  onUpdate,
  unitSystem,
}: StrengthPrescriptionEditorProps) {
  const sets = prescription.sets || [];

  const addSet = useCallback(() => {
    const newSet: SetPrescription = {
      set_number: sets.length + 1,
      target_repetitions: { min: 8, max: 12 },
      rest_seconds: 60,
    };
    onUpdate({ sets: [...sets, newSet] });
  }, [sets, onUpdate]);

  const removeSet = useCallback((index: number) => {
    const updatedSets = sets.filter((_, i) => i !== index);
    // Renumber the sets
    updatedSets.forEach((set, i) => {
      set.set_number = i + 1;
    });
    onUpdate({ sets: updatedSets });
  }, [sets, onUpdate]);

  const updateSet = useCallback((index: number, updates: Partial<SetPrescription>) => {
    const updatedSets = [...sets];
    updatedSets[index] = { ...updatedSets[index], ...updates };
    onUpdate({ sets: updatedSets });
  }, [sets, onUpdate]);

  return (
    <Card className={styles.strengthCard}>
      <CardHeader>
        <div className={styles.strengthHeader}>
          <CardTitle>Sets & Repetitions</CardTitle>
          <Button size="sm" onClick={addSet} className={styles.addButton}>
            <Plus className={styles.buttonIcon} />
            Add Set
          </Button>
        </div>
      </CardHeader>
      <CardContent className={styles.strengthContent}>
        {sets.map((set, index) => (
          <SetEditor
            key={index}
            set={set}
            onUpdate={(updates) => updateSet(index, updates)}
            onRemove={() => removeSet(index)}
            unitSystem={unitSystem}
            canRemove={sets.length > 1}
          />
        ))}
        
        {sets.length === 0 && (
          <div className={styles.emptyState}>
            <p>No sets defined. Click &quot;Add Set&quot; to start building your exercise.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Set Editor Sub-Component
interface SetEditorProps {
  set: SetPrescription;
  onUpdate: (updates: Partial<SetPrescription>) => void;
  onRemove: () => void;
  unitSystem: 'imperial' | 'metric';
  canRemove: boolean;
}

function SetEditor({ set, onUpdate, onRemove, unitSystem, canRemove }: SetEditorProps) {
  const [repType, setRepType] = useState<'exact' | 'range'>(
    typeof set.target_repetitions === 'number' ? 'exact' : 'range'
  );

  const weightUnit = unitSystem === 'imperial' ? 'lb' : 'kg';

  return (
    <div className={styles.setEditor}>
      <div className={styles.setHeader}>
        <h4 className={styles.setTitle}>Set {set.set_number}</h4>
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className={styles.removeButton}>
            <Minus className={styles.buttonIcon} />
          </Button>
        )}
      </div>

      <div className={styles.setFields}>
        {/* Repetitions */}
        <div className={styles.fieldGroup}>
          <Label>Repetitions</Label>
          <div className={styles.repFields}>
            <Select value={repType} onValueChange={(value) => setRepType(value as 'exact' | 'range')}>
              <SelectTrigger className={styles.repTypeSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exact">Exact</SelectItem>
                <SelectItem value="range">Range</SelectItem>
              </SelectContent>
            </Select>

            {repType === 'exact' ? (
              <Input
                type="number"
                min="1"
                max="100"
                value={typeof set.target_repetitions === 'number' ? set.target_repetitions : 10}
                onChange={(e) => onUpdate({ target_repetitions: parseInt(e.target.value) || 1 })}
                className={styles.repInput}
              />
            ) : (
              <div className={styles.rangeInputs}>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Min"
                  value={typeof set.target_repetitions === 'object' ? set.target_repetitions.min : 8}
                  onChange={(e) => {
                    const current = typeof set.target_repetitions === 'object' ? set.target_repetitions : { min: 8, max: 12 };
                    onUpdate({ target_repetitions: { ...current, min: parseInt(e.target.value) || 1 } });
                  }}
                  className={styles.rangeInput}
                />
                <span>to</span>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Max"
                  value={typeof set.target_repetitions === 'object' ? set.target_repetitions.max : 12}
                  onChange={(e) => {
                    const current = typeof set.target_repetitions === 'object' ? set.target_repetitions : { min: 8, max: 12 };
                    onUpdate({ target_repetitions: { ...current, max: parseInt(e.target.value) || 1 } });
                  }}
                  className={styles.rangeInput}
                />
              </div>
            )}
          </div>
        </div>

        {/* Weight */}
        <div className={styles.fieldGroup}>
          <Label>Weight ({weightUnit})</Label>
          <Input
            type="number"
            min="0"
            step="0.5"
            placeholder="Optional"
            value={set.target_weight_value || ""}
            onChange={(e) => onUpdate({ 
              target_weight_value: e.target.value ? parseFloat(e.target.value) : undefined,
              target_weight_unit: weightUnit
            })}
            className={styles.weightInput}
          />
        </div>

        {/* Rest */}
        <div className={styles.fieldGroup}>
          <Label>Rest (seconds)</Label>
          <Input
            type="number"
            min="0"
            step="15"
            placeholder="60"
            value={set.rest_seconds || ""}
            onChange={(e) => onUpdate({ rest_seconds: e.target.value ? parseInt(e.target.value) : undefined })}
            className={styles.restInput}
          />
        </div>

        {/* RPE */}
        <div className={styles.fieldGroup}>
          <Label>RPE (1-10)</Label>
          <Input
            type="number"
            min="1"
            max="10"
            placeholder="Optional"
            value={set.rpe_target || ""}
            onChange={(e) => onUpdate({ rpe_target: e.target.value ? parseInt(e.target.value) : undefined })}
            className={styles.rpeInput}
          />
        </div>

        {/* Tempo */}
        <div className={styles.fieldGroup}>
          <Label>Tempo</Label>
          <Input
            placeholder="e.g., 3-1-2-0"
            value={set.tempo_text || ""}
            onChange={(e) => onUpdate({ tempo_text: e.target.value })}
            className={styles.tempoInput}
          />
        </div>
      </div>
    </div>
  );
}

// Cardio Prescription Sub-Component
interface CardioPrescriptionEditorProps {
  prescription: ExercisePrescription;
  onUpdate: (updates: Partial<ExercisePrescription>) => void;
}

function CardioPrescriptionEditor({ prescription, onUpdate }: CardioPrescriptionEditorProps) {
  const cardio = prescription.cardio_block || {
    warm_up_minutes: 5,
    work_intervals: [],
    cool_down_minutes: 5,
    safety_notes: "Stop immediately if you feel dizzy or short of breath",
  };

  const updateCardio = useCallback((updates: Partial<CardioBlock>) => {
    const updatedCardio = { ...cardio, ...updates };
    onUpdate({ cardio_block: updatedCardio });
  }, [cardio, onUpdate]);

  const addInterval = useCallback(() => {
    const newInterval: CardioInterval = {
      interval_number: cardio.work_intervals.length + 1,
      hard_seconds: 30,
      easy_seconds: 90,
    };
    updateCardio({ work_intervals: [...cardio.work_intervals, newInterval] });
  }, [cardio.work_intervals, updateCardio]);

  const removeInterval = useCallback((index: number) => {
    const updatedIntervals = cardio.work_intervals.filter((_, i) => i !== index);
    updatedIntervals.forEach((interval, i) => {
      interval.interval_number = i + 1;
    });
    updateCardio({ work_intervals: updatedIntervals });
  }, [cardio.work_intervals, updateCardio]);

  return (
    <Card className={styles.cardioCard}>
      <CardHeader>
        <CardTitle>Cardio Prescription</CardTitle>
      </CardHeader>
      <CardContent className={styles.cardioContent}>
        {/* Warm-up and Cool-down */}
        <div className={styles.cardioTimings}>
          <div className={styles.fieldGroup}>
            <Label>Warm-up (minutes)</Label>
            <Input
              type="number"
              min="0"
              max="30"
              value={cardio.warm_up_minutes}
              onChange={(e) => updateCardio({ warm_up_minutes: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className={styles.fieldGroup}>
            <Label>Cool-down (minutes)</Label>
            <Input
              type="number"
              min="0"
              max="30"
              value={cardio.cool_down_minutes}
              onChange={(e) => updateCardio({ cool_down_minutes: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Intervals */}
        <div className={styles.intervalsSection}>
          <div className={styles.intervalsHeader}>
            <h4 className={styles.intervalsTitle}>Work Intervals</h4>
            <Button size="sm" onClick={addInterval} className={styles.addButton}>
              <Plus className={styles.buttonIcon} />
              Add Interval
            </Button>
          </div>

          {cardio.work_intervals.map((interval, index) => (
            <div key={index} className={styles.intervalEditor}>
              <div className={styles.intervalHeader}>
                <h5 className={styles.intervalTitle}>Interval {interval.interval_number}</h5>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeInterval(index)}
                  className={styles.removeButton}
                >
                  <Minus className={styles.buttonIcon} />
                </Button>
              </div>
              <div className={styles.intervalFields}>
                <div className={styles.fieldGroup}>
                  <Label>Hard (seconds)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="600"
                    value={interval.hard_seconds}
                    onChange={(e) => {
                      const updatedIntervals = [...cardio.work_intervals];
                      updatedIntervals[index] = { 
                        ...interval, 
                        hard_seconds: parseInt(e.target.value) || 30 
                      };
                      updateCardio({ work_intervals: updatedIntervals });
                    }}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <Label>Easy (seconds)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="600"
                    value={interval.easy_seconds}
                    onChange={(e) => {
                      const updatedIntervals = [...cardio.work_intervals];
                      updatedIntervals[index] = { 
                        ...interval, 
                        easy_seconds: parseInt(e.target.value) || 90 
                      };
                      updateCardio({ work_intervals: updatedIntervals });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {cardio.work_intervals.length === 0 && (
            <div className={styles.emptyState}>
              <p>No intervals defined. Click &quot;Add Interval&quot; to create interval training.</p>
            </div>
          )}
        </div>

        {/* Safety Notes */}
        <div className={styles.fieldGroup}>
          <Label>Safety Notes</Label>
          <Textarea
            placeholder="Safety instructions for this cardio exercise..."
            value={cardio.safety_notes}
            onChange={(e) => updateCardio({ safety_notes: e.target.value })}
            className={styles.textarea}
          />
        </div>
      </CardContent>
    </Card>
  );
}
