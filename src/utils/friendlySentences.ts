/**
 * Friendly sentence generator for exercise prescriptions
 * Following cursor rules for clear, beginner-friendly descriptions
 */

import type { ExercisePrescription, SetPrescription, ExerciseCatalogItem } from "@/types";

interface UnitConverter {
  convertWeight(value: number, fromUnit: string, toUnit: string): number;
}

// Simple unit converter for weight
const UnitConverter: UnitConverter = {
  convertWeight(value: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return value;
    
    // Convert to kg first, then to target unit
    let kgValue = value;
    if (fromUnit === 'lb') {
      kgValue = value * 0.453592;
    }
    
    if (toUnit === 'lb') {
      return Math.round(kgValue * 2.20462 * 10) / 10;
    }
    
    return Math.round(kgValue * 10) / 10;
  }
};

export class FriendlySentenceGenerator {
  /**
   * Generate a complete exercise description from prescription
   */
  static generateExerciseDescription(
    prescription: ExercisePrescription,
    exercise: ExerciseCatalogItem,
    unitSystem: 'imperial' | 'metric'
  ): string {
    // Use custom description if provided
    if (prescription.clear_description.trim() !== '') {
      return prescription.clear_description;
    }

    // Generate automatic description based on prescription type
    if (prescription.sets && prescription.sets.length > 0) {
      return this.generateStrengthDescription(prescription, exercise, unitSystem);
    } else if (prescription.cardio_block) {
      return this.generateCardioDescription(prescription);
    }
    
    // Fallback to exercise name
    return exercise.beginner_friendly_name || exercise.name;
  }

  /**
   * Generate strength exercise description
   */
  private static generateStrengthDescription(
    prescription: ExercisePrescription,
    exercise: ExerciseCatalogItem,
    unitSystem: 'imperial' | 'metric'
  ): string {
    const sets = prescription.sets!;
    const setCount = sets.length;
    const firstSet = sets[0];
    
    let description = exercise.beginner_friendly_name || exercise.name;
    
    // Add set count
    if (setCount === 1) {
      description += ": 1 series";
    } else {
      description += `: ${setCount} series`;
    }
    
    // Add repetitions
    const repText = this.formatRepetitions(firstSet);
    description += ` of ${repText}`;
    
    // Add weight if specified
    const weightText = this.formatWeight(firstSet, exercise, unitSystem);
    if (weightText) {
      description += weightText;
    }
    
    // Add tempo if specified
    const tempoText = this.formatTempo(firstSet);
    if (tempoText) {
      description += `. ${tempoText}`;
    } else {
      description += ".";
    }
    
    // Add rest time if specified
    const restText = this.formatRest(firstSet);
    if (restText) {
      description += ` ${restText}`;
    }
    
    // Add RPE if specified
    const rpeText = this.formatRPE(firstSet);
    if (rpeText) {
      description += ` ${rpeText}`;
    }
    
    return description;
  }

  /**
   * Generate cardio exercise description
   */
  private static generateCardioDescription(
    prescription: ExercisePrescription
  ): string {
    const cardio = prescription.cardio_block!;
    
    let description = `Warm up for ${cardio.warm_up_minutes} minutes with an easy walk.`;
    
    if (cardio.work_intervals.length > 0) {
      const interval = cardio.work_intervals[0];
      const rounds = cardio.work_intervals.length;
      
      if (rounds === 1) {
        description += ` Do 1 round: ${interval.hard_seconds} seconds of fast pace followed by ${interval.easy_seconds} seconds of easy pace.`;
      } else {
        description += ` Do ${rounds} rounds: ${interval.hard_seconds} seconds of fast pace followed by ${interval.easy_seconds} seconds of easy pace.`;
      }
      
      // Add target heart rate if specified
      if (interval.target_heart_rate_range_bpm) {
        const [min, max] = interval.target_heart_rate_range_bpm;
        description += ` Target heart rate: ${min}-${max} beats per minute.`;
      }
    }
    
    description += ` Cool down for ${cardio.cool_down_minutes} minutes, then walk until your heart rate is at or below one hundred ten beats per minute.`;
    
    // Add safety notes if present
    if (cardio.safety_notes) {
      description += ` ${cardio.safety_notes}`;
    }
    
    return description;
  }

  /**
   * Format repetitions text
   */
  private static formatRepetitions(set: SetPrescription): string {
    if (typeof set.target_repetitions === 'number') {
      const reps = set.target_repetitions;
      if (reps === 1) {
        return "1 repetition";
      } else {
        return `${reps} repetitions`;
      }
    } else {
      const range = set.target_repetitions;
      return `${range.min} to ${range.max} repetitions`;
    }
  }

  /**
   * Format weight text
   */
  private static formatWeight(
    set: SetPrescription, 
    exercise: ExerciseCatalogItem, 
    unitSystem: 'imperial' | 'metric'
  ): string {
    if (!set.target_weight_value || !set.target_weight_unit) {
      return '';
    }

    const targetUnit = unitSystem === 'imperial' ? 'lb' : 'kg';
    const weightValue = UnitConverter.convertWeight(
      set.target_weight_value,
      set.target_weight_unit,
      targetUnit
    );
    
    const unit = unitSystem === 'imperial' ? 'pounds' : 'kilograms';
    
    // Handle dumbbell exercises specifically
    const isDumbbell = exercise.equipment.includes('dumbbells') || 
                      exercise.equipment.includes('dumbbell');
    
    if (isDumbbell) {
      return ` with ${weightValue} ${unit} per dumbbell`;
    } else {
      return ` with ${weightValue} ${unit}`;
    }
  }

  /**
   * Format tempo text
   */
  private static formatTempo(set: SetPrescription): string {
    if (!set.tempo_text) {
      return '';
    }
    
    // Try to make tempo more friendly
    const tempo = set.tempo_text.toLowerCase();
    
    if (tempo.includes('slow') || tempo.includes('controlled')) {
      return "Move slowly and with control";
    } else if (tempo.includes('explosive') || tempo.includes('fast')) {
      return "Move with explosive power";
    } else if (tempo.includes('pause') || tempo.includes('hold')) {
      return "Pause briefly at the bottom of each repetition";
    } else {
      return `Tempo: ${set.tempo_text}`;
    }
  }

  /**
   * Format rest time text
   */
  private static formatRest(set: SetPrescription): string {
    if (!set.rest_seconds) {
      return '';
    }
    
    const minutes = Math.floor(set.rest_seconds / 60);
    const seconds = set.rest_seconds % 60;
    
    if (minutes === 0) {
      return `Rest ${seconds} seconds between series.`;
    } else if (seconds === 0) {
      const minuteText = minutes === 1 ? 'minute' : 'minutes';
      return `Rest ${minutes} ${minuteText} between series.`;
    } else {
      const minuteText = minutes === 1 ? 'minute' : 'minutes';
      return `Rest ${minutes} ${minuteText} and ${seconds} seconds between series.`;
    }
  }

  /**
   * Format RPE (Rate of Perceived Exertion) text
   */
  private static formatRPE(set: SetPrescription): string {
    if (!set.rpe_target) {
      return '';
    }
    
    const rpe = set.rpe_target;
    
    if (rpe <= 3) {
      return "This should feel very easy.";
    } else if (rpe <= 5) {
      return "This should feel easy to moderate.";
    } else if (rpe <= 7) {
      return "This should feel moderately hard.";
    } else if (rpe <= 8) {
      return "This should feel hard but manageable.";
    } else if (rpe <= 9) {
      return "This should feel very hard.";
    } else {
      return "This should feel like maximum effort.";
    }
  }

  /**
   * Generate session summary description
   */
  static generateSessionSummary(
    exercises: ExercisePrescription[],
    sessionType: string,
    estimatedDuration: number
  ): string {
    const exerciseCount = exercises.length;
    const durationText = estimatedDuration < 60 
      ? `${estimatedDuration} minutes`
      : `${Math.round(estimatedDuration / 60 * 10) / 10} hours`;
    
    let summary = '';
    
    switch (sessionType) {
      case 'strength':
        summary = `Strength training session with ${exerciseCount} exercises`;
        break;
      case 'intervals':
        summary = `Interval training session with ${exerciseCount} exercises`;
        break;
      case 'steady_cardio':
        summary = `Steady cardio session`;
        break;
      case 'flexibility':
        summary = `Flexibility and stretching session with ${exerciseCount} exercises`;
        break;
      case 'sport':
        summary = `Sport-specific training session`;
        break;
      default:
        summary = `Workout session with ${exerciseCount} exercises`;
    }
    
    summary += `. Estimated duration: ${durationText}.`;
    
    return summary;
  }

  /**
   * Generate safety reminder text for exercises
   */
  static generateSafetyReminder(exercises: ExerciseCatalogItem[]): string {
    const hasBackExercises = exercises.some(ex => 
      ex.safety_notes.some(note => 
        note.toLowerCase().includes('back') || 
        note.toLowerCase().includes('spine')
      )
    );
    
    const hasQuadExercises = exercises.some(ex => 
      ex.safety_notes.some(note => 
        note.toLowerCase().includes('quad') || 
        note.toLowerCase().includes('knee')
      )
    );
    
    if (hasBackExercises && hasQuadExercises) {
      return "Remember: If you experience any back or knee discomfort above 2 out of 10, stop immediately and rest.";
    } else if (hasBackExercises) {
      return "Remember: If you experience any back discomfort above 2 out of 10, stop immediately and rest.";
    } else if (hasQuadExercises) {
      return "Remember: If you experience any knee discomfort above 2 out of 10, stop immediately and rest.";
    }
    
    return "Remember: Listen to your body and stop if you feel any pain or discomfort.";
  }
}
