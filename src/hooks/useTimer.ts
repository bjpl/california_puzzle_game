import { useState, useEffect, useRef, useCallback } from 'react';

export interface SplitTime {
  name: string;
  timestamp: number;
  elapsed: number;
}

export interface TimerStats {
  bestTime: number | null;
  averageTime: number;
  totalSessions: number;
  completedSessions: number;
}

interface UseTimerOptions {
  autoStart?: boolean;
  interval?: number; // Update interval in milliseconds
  onTick?: (elapsed: number, remaining?: number) => void;
  onComplete?: (elapsed: number) => void;
  onSplitTime?: (splitTime: SplitTime) => void;
  maxDuration?: number; // Maximum duration in milliseconds
  isCountdown?: boolean; // Whether to count down instead of up
  precision?: number; // Precision in milliseconds (default: 10)
}

interface TimerState {
  elapsed: number;
  remaining: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  splitTimes: SplitTime[];
  stats: TimerStats;
  formattedTime: string;
  formattedRemaining: string;
  progressPercentage: number;
}

interface TimerControls {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  addTime: (milliseconds: number) => void;
  recordSplit: (name: string) => void;
  updateBestTime: (time: number) => void;
  formatTime: (milliseconds: number) => string;
}

export const useTimer = (options: UseTimerOptions = {}): [TimerState, TimerControls] => {
  const {
    autoStart = false,
    interval = 10,
    onTick,
    onComplete,
    onSplitTime,
    maxDuration,
    isCountdown = false,
    precision = 10
  } = options;

  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [splitTimes, setSplitTimes] = useState<SplitTime[]>([]);
  const [stats, setStats] = useState<TimerStats>({
    bestTime: null,
    averageTime: 0,
    totalSessions: 0,
    completedSessions: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(0);

  // Calculate derived values
  const remaining = maxDuration ? Math.max(0, maxDuration - elapsed) : 0;
  const progressPercentage = maxDuration ? (elapsed / maxDuration) * 100 : 0;

  // Format time helper
  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10); // Two decimal places

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    return `${seconds}.${ms.toString().padStart(2, '0')}`;
  }, []);

  const formattedTime = formatTime(elapsed);
  const formattedRemaining = formatTime(remaining);

  // Start timer
  const start = useCallback(() => {
    if (isCompleted) return;

    startTimeRef.current = Date.now() - elapsed;
    sessionStartRef.current = Date.now();
    setIsRunning(true);
    setIsPaused(false);

    setStats(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1
    }));
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
    setSplitTimes([]);
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
    sessionStartRef.current = 0;
  }, []);

  // Add time to timer
  const addTime = useCallback((milliseconds: number) => {
    setElapsed(prev => {
      const newElapsed = Math.max(0, prev + milliseconds);
      startTimeRef.current = Date.now() - newElapsed;
      return newElapsed;
    });
  }, []);

  // Record split time
  const recordSplit = useCallback((name: string) => {
    const splitTime: SplitTime = {
      name,
      timestamp: Date.now(),
      elapsed
    };

    setSplitTimes(prev => [...prev, splitTime]);

    if (onSplitTime) {
      onSplitTime(splitTime);
    }
  }, [elapsed, onSplitTime]);

  // Update best time
  const updateBestTime = useCallback((time: number) => {
    setStats(prev => ({
      ...prev,
      bestTime: prev.bestTime === null ? time : Math.min(prev.bestTime, time),
      completedSessions: prev.completedSessions + 1,
      averageTime: ((prev.averageTime * prev.completedSessions) + time) / (prev.completedSessions + 1)
    }));
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused && !isCompleted) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const newElapsed = now - startTimeRef.current;
        const newRemaining = maxDuration ? Math.max(0, maxDuration - newElapsed) : 0;

        setElapsed(newElapsed);

        // Check if max duration is reached
        if (maxDuration && newElapsed >= maxDuration) {
          setIsCompleted(true);
          setIsRunning(false);

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          // Update stats for completed session
          updateBestTime(newElapsed);

          if (onComplete) {
            onComplete(newElapsed);
          }
          return;
        }

        // Call onTick callback with elapsed and remaining time
        if (onTick) {
          onTick(newElapsed, newRemaining);
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
    remaining,
    isRunning,
    isPaused,
    isCompleted,
    splitTimes,
    stats,
    formattedTime,
    formattedRemaining,
    progressPercentage
  };

  const timerControls: TimerControls = {
    start,
    stop,
    pause,
    resume,
    reset,
    addTime,
    recordSplit,
    updateBestTime,
    formatTime
  };

  return [timerState, timerControls];
};