/**
 * useStudyProgress Hook
 *
 * Manages study progress state including:
 * - Counties that have been studied
 * - Quizzes that have been completed
 * - Counties that have been mastered
 *
 * Progress is automatically persisted to localStorage and restored on mount.
 *
 * @returns {StudyProgressHookReturn} Progress state and mutation functions
 */

import { useState, useEffect } from 'react';
import type { StudyProgress, StudyProgressHookReturn } from '../types';

const STORAGE_KEY = 'californiaStudyProgress';

/**
 * Custom hook for managing study progress with localStorage persistence
 */
export function useStudyProgress(): StudyProgressHookReturn {
  const [progress, setProgress] = useState<StudyProgress>({
    studiedCounties: new Set(),
    completedQuizzes: new Set(),
    masteredCounties: new Set(),
  });

  /**
   * Load progress from localStorage on mount (client-side only)
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-restricted-globals
      const savedProgress = localStorage.getItem(STORAGE_KEY);
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          setProgress({
            studiedCounties: new Set(parsed.studiedCounties || []),
            completedQuizzes: new Set(parsed.completedQuizzes || []),
            masteredCounties: new Set(parsed.masteredCounties || []),
          });
        } catch (error) {
          console.error('Failed to parse study progress from localStorage:', error);
        }
      }
    }
  }, []);

  /**
   * Save progress to localStorage whenever it changes (client-side only)
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const toSave = {
        studiedCounties: Array.from(progress.studiedCounties),
        completedQuizzes: Array.from(progress.completedQuizzes),
        masteredCounties: Array.from(progress.masteredCounties),
      };
      // eslint-disable-next-line no-restricted-globals
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }
  }, [progress]);

  /**
   * Mark a county as studied
   * @param countyId - The ID of the county to mark as studied
   */
  const markCountyStudied = (countyId: string): void => {
    setProgress((prev) => ({
      ...prev,
      studiedCounties: new Set([...prev.studiedCounties, countyId]),
    }));
  };

  /**
   * Mark a quiz as completed
   * @param quizId - The ID of the quiz to mark as completed
   */
  const markQuizCompleted = (quizId: string): void => {
    setProgress((prev) => ({
      ...prev,
      completedQuizzes: new Set([...prev.completedQuizzes, quizId]),
    }));
  };

  /**
   * Mark a county as mastered
   * @param countyId - The ID of the county to mark as mastered
   */
  const markCountyMastered = (countyId: string): void => {
    setProgress((prev) => ({
      ...prev,
      masteredCounties: new Set([...prev.masteredCounties, countyId]),
    }));
  };

  return {
    progress,
    markCountyStudied,
    markQuizCompleted,
    markCountyMastered,
  };
}
