/**
 * Hook for managing plan calendar functionality
 * Following cursor rules for state management and type safety
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { PlanService } from "@/services/planService";
import type { ProgramPlan, Session, SessionPath } from "@/types";

interface CalendarDay {
  date: Date;
  sessions: Array<{
    session: Session;
    path: SessionPath;
    isCompleted: boolean;
  }>;
  isToday: boolean;
  isCurrentMonth: boolean;
}

interface CalendarWeek {
  weekStart: Date;
  days: CalendarDay[];
}

export const usePlanCalendar = (plan: ProgramPlan | null, completedSessions: Set<string> = new Set()) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Calculate current month/week view
  const calendarData = useMemo(() => {
    if (!plan) {
      return { weeks: [], monthName: '', year: 0 };
    }

    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and calculate start of calendar view
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Start calendar on Sunday of the week containing the first day
    const calendarStart = new Date(firstDayOfMonth);
    calendarStart.setDate(calendarStart.getDate() - firstDayOfMonth.getDay());
    
    // End calendar on Saturday of the week containing the last day
    const calendarEnd = new Date(lastDayOfMonth);
    calendarEnd.setDate(calendarEnd.getDate() + (6 - lastDayOfMonth.getDay()));
    
    const weeks: CalendarWeek[] = [];
    const allSessionsWithPaths = PlanService.getAllSessionsWithPaths(plan);
    
    // Create a map of dates to sessions for quick lookup
    const sessionsByDate = new Map<string, Array<{ session: Session; path: SessionPath }>>();
    
    allSessionsWithPaths.forEach(({ session, path, date }) => {
      if (date) {
        const dateKey = date.toDateString();
        if (!sessionsByDate.has(dateKey)) {
          sessionsByDate.set(dateKey, []);
        }
        sessionsByDate.get(dateKey)!.push({ session, path });
      }
    });
    
    // Generate weeks
    const currentWeekStart = new Date(calendarStart);
    
    while (currentWeekStart <= calendarEnd) {
      const weekDays: CalendarDay[] = [];
      
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + dayOffset);
        
        const dateKey = date.toDateString();
        const daySessions = sessionsByDate.get(dateKey) || [];
        
        const calendarDay: CalendarDay = {
          date: new Date(date),
          sessions: daySessions.map(({ session, path }) => ({
            session,
            path,
            isCompleted: completedSessions.has(session.id),
          })),
          isToday: date.toDateString() === today.toDateString(),
          isCurrentMonth: date.getMonth() === month,
        };
        
        weekDays.push(calendarDay);
      }
      
      weeks.push({
        weekStart: new Date(currentWeekStart),
        days: weekDays,
      });
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    return {
      weeks,
      monthName: firstDayOfMonth.toLocaleDateString('en-US', { month: 'long' }),
      year,
    };
  }, [plan, currentDate, completedSessions]);

  // Get sessions for a specific date
  const getSessionsForDate = useCallback((date: Date) => {
    if (!plan) {
      return [];
    }
    
    const targetDay = calendarData.weeks
      .flatMap(week => week.days)
      .find(day => day.date.toDateString() === date.toDateString());
    
    return targetDay?.sessions || [];
  }, [plan, calendarData]);

  // Navigation functions
  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCurrentDate(prev => {
      const prev_month = new Date(prev);
      prev_month.setMonth(prev_month.getMonth() - 1);
      return prev_month;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }, []);

  const goToPrevWeek = useCallback(() => {
    setCurrentDate(prev => {
      const prev_week = new Date(prev);
      prev_week.setDate(prev_week.getDate() - 7);
      return prev_week;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }, []);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(new Date(date));
    setSelectedDate(new Date(date));
  }, []);

  // Get current week for week view
  const currentWeek = useMemo(() => {
    if (viewMode !== 'week') {
      return null;
    }
    
    return calendarData.weeks.find(week => {
      const weekEnd = new Date(week.weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return currentDate >= week.weekStart && currentDate <= weekEnd;
    }) || null;
  }, [calendarData, currentDate, viewMode]);

  // Get today's sessions
  const todaysSessions = useMemo(() => {
    return getSessionsForDate(new Date());
  }, [getSessionsForDate]);

  // Get next scheduled session
  const nextSession = useMemo(() => {
    if (!plan) {
      return null;
    }
    
    const today = new Date();
    const allSessions = calendarData.weeks
      .flatMap(week => week.days)
      .flatMap(day => day.sessions.map(s => ({ ...s, date: day.date })))
      .filter(s => !s.isCompleted && s.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return allSessions[0] || null;
  }, [plan, calendarData]);

  // Statistics for current view
  const calendarStats = useMemo(() => {
    const allSessions = calendarData.weeks
      .flatMap(week => week.days)
      .flatMap(day => day.sessions);
    
    const totalSessions = allSessions.length;
    const completedSessions = allSessions.filter(s => s.isCompleted).length;
    const upcomingSessions = allSessions.filter(s => !s.isCompleted).length;
    
    const sessionsByType = allSessions.reduce((acc, { session }) => {
      acc[session.session_type] = (acc[session.session_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalSessions,
      completedSessions,
      upcomingSessions,
      completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      sessionsByType,
    };
  }, [calendarData]);

  return {
    // Calendar data
    calendarData,
    currentWeek,
    todaysSessions,
    nextSession,
    calendarStats,
    
    // State
    currentDate,
    selectedDate,
    viewMode,
    
    // Actions
    setSelectedDate,
    setViewMode,
    getSessionsForDate,
    
    // Navigation
    goToNextMonth,
    goToPrevMonth,
    goToNextWeek,
    goToPrevWeek,
    goToToday,
    goToDate,
  };
};
