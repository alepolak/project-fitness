/**
 * Unit conversion utilities for Imperial/Metric systems
 * Following cursor rules for type safety and accuracy
 */

export class UnitConverter {
  // Weight conversions
  static poundsToKg(pounds: number): number {
    return Math.round((pounds / 2.205) * 100) / 100;
  }

  static kgToPounds(kg: number): number {
    return Math.round(kg * 2.205 * 100) / 100;
  }

  // Distance conversions
  static milesToKm(miles: number): number {
    return Math.round(miles * 1.609344 * 100) / 100;
  }

  static kmToMiles(km: number): number {
    return Math.round((km / 1.609344) * 100) / 100;
  }

  static inchesToCm(inches: number): number {
    return Math.round(inches * 2.54 * 100) / 100;
  }

  static cmToInches(cm: number): number {
    return Math.round((cm / 2.54) * 100) / 100;
  }

  // Height conversions (feet/inches to cm and vice versa)
  static feetInchesToCm(feet: number, inches: number): number {
    const totalInches = feet * 12 + inches;
    return this.inchesToCm(totalInches);
  }

  static cmToFeetInches(cm: number): { feet: number; inches: number } {
    const totalInches = this.cmToInches(cm);
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round((totalInches % 12) * 100) / 100;
    return { feet, inches };
  }

  // Smart weight formatting with appropriate precision
  static formatWeight(
    value: number,
    fromUnit: "lb" | "kg",
    toUnit: "lb" | "kg",
    precision: "dumbbell" | "plate" | "exact" = "exact"
  ): string {
    if (fromUnit === toUnit) {
      return this.roundWeight(value, toUnit, precision).toString();
    }

    const converted =
      fromUnit === "lb" ? this.poundsToKg(value) : this.kgToPounds(value);

    return this.roundWeight(converted, toUnit, precision).toString();
  }

  // Smart distance formatting
  static formatDistance(
    value: number,
    fromUnit: "miles" | "kilometers",
    toUnit: "miles" | "kilometers"
  ): string {
    if (fromUnit === toUnit) {
      return value.toString();
    }

    const converted =
      fromUnit === "miles" ? this.milesToKm(value) : this.kmToMiles(value);

    return Math.round(converted * 100) / 100 + "";
  }

  // Round weights to nearest dumbbell/plate increments
  static roundToNearestDumbbell(weight: number, unit: "lb" | "kg"): number {
    if (unit === "lb") {
      // Round to nearest 2.5 lb for dumbbells, 5 lb for barbells
      if (weight <= 50) {
        return Math.round(weight / 2.5) * 2.5;
      } else {
        return Math.round(weight / 5) * 5;
      }
    } else {
      // Round to nearest 1.25 kg for dumbbells, 2.5 kg for barbells
      if (weight <= 25) {
        return Math.round(weight / 1.25) * 1.25;
      } else {
        return Math.round(weight / 2.5) * 2.5;
      }
    }
  }

  private static roundWeight(
    weight: number,
    unit: "lb" | "kg",
    precision: "dumbbell" | "plate" | "exact"
  ): number {
    switch (precision) {
      case "dumbbell":
        return this.roundToNearestDumbbell(weight, unit);
      case "plate":
        return unit === "lb"
          ? Math.round(weight / 5) * 5
          : Math.round(weight / 2.5) * 2.5;
      case "exact":
      default:
        return Math.round(weight * 100) / 100;
    }
  }

  // Convert weight with smart rounding
  static convertWeight(
    value: number,
    fromUnit: "lb" | "kg",
    toUnit: "lb" | "kg",
    precision: "dumbbell" | "plate" | "exact" = "exact"
  ): number {
    if (fromUnit === toUnit) {
      return this.roundWeight(value, toUnit, precision);
    }

    const converted =
      fromUnit === "lb" ? this.poundsToKg(value) : this.kgToPounds(value);

    return this.roundWeight(converted, toUnit, precision);
  }

  // Temperature conversion (for tracking workout conditions)
  static celsiusToFahrenheit(celsius: number): number {
    return Math.round((celsius * 9) / 5 + 32);
  }

  static fahrenheitToCelsius(fahrenheit: number): number {
    return Math.round(((fahrenheit - 32) * 5) / 9);
  }

  // Get user-friendly unit display
  static getUnitDisplay(unit: string): string {
    const unitMap: Record<string, string> = {
      lb: "lbs",
      kg: "kg",
      in: "in",
      cm: "cm",
      miles: "mi",
      kilometers: "km",
      meters: "m",
      feet: "ft",
      seconds: "sec",
      minutes: "min",
      hours: "hr",
    };

    return unitMap[unit] || unit;
  }
}
