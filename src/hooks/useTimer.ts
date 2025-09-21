import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  autoStart?: boolean;
  interval?: number; // Update interval in milliseconds
  onTick?: (elapsed: number) => void;
  onComplete?: (elapsed: number) => void;
  maxDuration?: number; // Maximum duration in milliseconds
}

interface TimerState {
  elapsed: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
}

interface TimerControls {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  addTime: (milliseconds: number) => void;
}

export const useTimer = (options: UseTimerOptions = {}): [TimerState, TimerControls] => {
  const {
    autoStart = false,
    interval = 100,
    onTick,
    onComplete,
    maxDuration
  } = options;

  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Start timer
  const start = useCallback(() => {
    if (isCompleted) return;

    startTimeRef.current = Date.now() - elapsed;
    setIsRunning(true);
    setIsPaused(false);
  }, [elapsed, isCompleted]);

  // Stop timer
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);

    if (onComplete && elapsed > 0) {
      onComplete(elapsed);
    }
  }, [elapsed, onComplete]);

  // Pause timer
  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;

    pausedTimeRef.current = Date.now();
    setIsPaused(true);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isRunning, isPaused]);

  // Resume timer
  const resume = useCallback(() => {
    if (!isPaused) return;

    const pausedDuration = Date.now() - pausedTimeRef.current;
    startTimeRef.current += pausedDuration;

    setIsPaused(false);
  }, [isPaused]);

  // Reset timer
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setElapsed(0);
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
  }, []);

  // Add time to timer
  const addTime = useCallback((milliseconds: number) => {
    setElapsed(prev => {
      const newElapsed = Math.max(0, prev + milliseconds);
      startTimeRef.current = Date.now() - newElapsed;
      return newElapsed;
    });
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused && !isCompleted) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const newElapsed = now - startTimeRef.current;

        setElapsed(newElapsed);

        // Check if max duration is reached
        if (maxDuration && newElapsed >= maxDuration) {
          setIsCompleted(true);
          setIsRunning(false);

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          if (onComplete) {
            onComplete(newElapsed);
          }
          return;
        }

        // Call onTick callback
        if (onTick) {
          onTick(newElapsed);
        }
      }, interval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, isCompleted, interval, onTick, onComplete, maxDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const timerState: TimerState = {
    elapsed,
    isRunning,
    isPaused,
    isCompleted
  };

  const timerControls: TimerControls = {
    start,
    stop,
    pause,
    resume,
    reset,
    addTime
  };

  return [timerState, timerControls];
};