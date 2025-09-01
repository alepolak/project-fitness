/**
 * Hook for managing rest timer between sets
 * Following cursor rules for state management and type safety
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface RestTimerHookReturn {
  isActive: boolean;
  timeRemaining: number;
  initialTime: number;
  progress: number;
  isCompleted: boolean;
  startTimer: (seconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  extendTimer: (additionalSeconds: number) => void;
  skipTimer: () => void;
  resetTimer: () => void;
}

export const useRestTimer = (): RestTimerHookReturn => {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback((seconds: number) => {
    setInitialTime(seconds);
    setTimeRemaining(seconds);
    setIsActive(true);
    setIsCompleted(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resumeTimer = useCallback(() => {
    if (timeRemaining > 0) {
      setIsActive(true);
    }
  }, [timeRemaining]);

  const extendTimer = useCallback((additionalSeconds: number) => {
    setTimeRemaining(prev => prev + additionalSeconds);
    setInitialTime(prev => prev + additionalSeconds);
  }, []);

  const skipTimer = useCallback(() => {
    setIsActive(false);
    setTimeRemaining(0);
    setIsCompleted(true);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeRemaining(0);
    setInitialTime(0);
    setIsCompleted(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            
            // Try to trigger notification/vibration
            try {
              // Web Notifications API
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Rest Complete!', {
                  body: 'Your rest period is over. Ready for the next set?',
                  icon: '/icon-192x192.png',
                });
              }
              
              // Vibration API (mobile)
              if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
              }
              
              // Audio notification
              const audio = new Audio('/sounds/rest-complete.mp3');
              audio.play().catch(() => {
                // Silently fail if audio can't play
              });
            } catch (error) {
              // Notifications not supported or permission denied
              console.log('Notification not available:', error);
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeRemaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Calculate progress percentage
  const progress = initialTime > 0 ? (initialTime - timeRemaining) / initialTime : 0;

  return {
    isActive,
    timeRemaining,
    initialTime,
    progress,
    isCompleted,
    startTimer,
    pauseTimer,
    resumeTimer,
    extendTimer,
    skipTimer,
    resetTimer,
  };
};
