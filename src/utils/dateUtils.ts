/**
 * Date utility functions for fitness tracking
 * Following cursor rules for type safety and consistency
 */

export class DateUtils {
  // Get current ISO date string (YYYY-MM-DD)
  static getCurrentDate(): string {
    return new Date().toISOString().split("T")[0];
  }

  // Get current ISO datetime string
  static getCurrentDateTime(): string {
    return new Date().toISOString();
  }

  // Format date for month grouping (YYYY-MM)
  static getMonthKey(date: string | Date): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toISOString().substring(0, 7);
  }

  // Get week start date (Monday)
  static getWeekStart(date: string | Date): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const day = dateObj.getDay();
    const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const weekStart = new Date(dateObj.setDate(diff));
    return weekStart.toISOString().split("T")[0];
  }

  // Get date range for queries
  static getDateRange(
    startDate: string,
    endDate: string
  ): { start: string; end: string } {
    return {
      start: startDate,
      end: endDate,
    };
  }

  // Get date N days ago
  static getDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  }

  // Get date N days from now
  static getDaysFromNow(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  }

  // Check if date is today
  static isToday(dateString: string): boolean {
    const date = new Date(dateString).toISOString().split("T")[0];
    const today = this.getCurrentDate();
    return date === today;
  }

  // Check if date is this week
  static isThisWeek(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    const weekStart = this.getWeekStart(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return date >= new Date(weekStart) && date <= weekEnd;
  }

  // Get day of week (0 = Sunday, 6 = Saturday)
  static getDayOfWeek(dateString: string): number {
    return new Date(dateString).getDay();
  }

  // Get readable day name
  static getDayName(dateString: string): string {
    const days = [
      "Sunday",
      "Monday", 
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[this.getDayOfWeek(dateString)];
  }

  // Get short day name
  static getShortDayName(dateString: string): string {
    const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return shortDays[this.getDayOfWeek(dateString)];
  }

  // Calculate age from birth date
  static calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // Validate ISO date string
  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Add days to date
  static addDays(dateString: string, days: number): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  }

  // Get days between two dates
  static getDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Format workout duration
  static formatDuration(startTime: string, endTime?: string): number {
    if (!endTime) {
      return 0;
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.floor((end.getTime() - start.getTime()) / 1000); // seconds
  }

  // Get workout time of day category
  static getTimeOfDay(dateTimeString: string): "morning" | "afternoon" | "evening" | "night" {
    const hour = new Date(dateTimeString).getHours();
    
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  // Generate date range array
  static generateDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }
}
