/**
 * @fileoverview Spaced Repetition System Store
 * @module stores/study/spacedRepetitionStore
 * @description Implements the SM-2 spaced repetition algorithm for optimizing review schedules.
 * Manages flashcard intervals, ease factors, and review queues for long-term retention.
 * Persists card data across sessions.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SpacedRepetitionItem } from '../../types/study';
import { StudyEventType } from '../../types/study-domain.types';
import { storeCoordinator } from '../storeCoordinator';

/**
 * Spaced repetition state shape
 */
interface SpacedRepetitionState {
  /** Map of county codes to their spaced repetition cards */
  cards: Map<string, SpacedRepetitionItem>;
  /** Queue of county codes pending review */
  reviewQueue: string[];
}

/**
 * Spaced repetition actions
 */
interface SpacedRepetitionActions {
  /** Record a review and update SM-2 algorithm parameters */
  recordReview: (countyCode: string, quality: number) => SpacedRepetitionItem;
  /** Get all cards that are due for review */
  getDueCards: () => SpacedRepetitionItem[];
  /** Get the next scheduled review date for a county */
  getNextReviewDate: (countyCode: string) => Date | null;
  /** Get the spaced repetition card for a county */
  getCard: (countyCode: string) => SpacedRepetitionItem | undefined;
  /** Initialize a new card for a county */
  initializeCard: (countyCode: string) => SpacedRepetitionItem;
}

/**
 * Calculate next review interval using the SM-2 algorithm
 * @param {number} interval - Current interval in days
 * @param {number} repetitions - Number of successful repetitions
 * @param {number} easeFactor - Current ease factor (minimum 1.3)
 * @param {number} quality - User's quality rating (0-5)
 * @returns {{ newInterval: number; newRepetitions: number; newEaseFactor: number }}
 * @see https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */
const calculateNextReview = (
  interval: number,
  repetitions: number,
  easeFactor: number,
  quality: number
): { newInterval: number; newRepetitions: number; newEaseFactor: number } => {
  let newEaseFactor = easeFactor;
  let newRepetitions = repetitions;
  let newInterval = interval;

  if (quality >= 3) {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }

  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  return { newInterval, newRepetitions, newEaseFactor };
};

export const useSpacedRepetitionStore = create<SpacedRepetitionState & SpacedRepetitionActions>()(
  devtools(
    persist(
      (set, get) => ({
        cards: new Map(),
        reviewQueue: [],

        /**
         * Initialize a new spaced repetition card for a county
         * Sets default SM-2 parameters: interval=0, repetitions=0, easeFactor=2.5
         * @param {string} countyCode - County identifier
         * @returns {SpacedRepetitionItem} The newly created card
         */
        initializeCard: (countyCode: string): SpacedRepetitionItem => {
          const newCard: SpacedRepetitionItem = {
            countyId: countyCode,
            interval: 0,
            repetitions: 0,
            easeFactor: 2.5,
            nextReview: new Date(),
            lastReview: null,
            quality: 0,
          };
          set((state) => {
            const newCards = new Map(state.cards);
            newCards.set(countyCode, newCard);
            return { cards: newCards };
          });
          return newCard;
        },

        /**
         * Record a review and update the card using SM-2 algorithm
         * Automatically initializes card if it doesn't exist
         * @param {string} countyCode - County identifier
         * @param {number} quality - User's quality rating (0-5, where 3+ is passing)
         * @returns {SpacedRepetitionItem} The updated card with new review schedule
         * @example
         * const card = recordReview('CA-001', 4); // Good recall
         * // Next review in ${card.interval} days`);
         */
        recordReview: (countyCode: string, quality: number): SpacedRepetitionItem => {
          const state = get();
          let card = state.cards.get(countyCode);

          if (!card) {
            card = get().initializeCard(countyCode);
          }

          const { newInterval, newRepetitions, newEaseFactor } = calculateNextReview(
            card.interval,
            card.repetitions,
            card.easeFactor,
            quality
          );

          const nextReview = new Date();
          nextReview.setDate(nextReview.getDate() + newInterval);

          const updatedCard: SpacedRepetitionItem = {
            ...card,
            interval: newInterval,
            repetitions: newRepetitions,
            easeFactor: newEaseFactor,
            nextReview,
            lastReview: new Date(),
            quality,
          };

          set((state) => {
            const newCards = new Map(state.cards);
            newCards.set(countyCode, updatedCard);
            return { cards: newCards };
          });

          // Publish event for cross-store coordination
          storeCoordinator.publish(
            StudyEventType.REVIEW_COMPLETED,
            {
              review: {
                countyCode,
                quality,
                responseTimeMs: 0, // Not tracked in this store
                timestamp: new Date(),
                sessionId: 'unknown', // Session context not available here
              },
              updatedCard: {
                countyCode,
                easeFactor: updatedCard.easeFactor,
                interval: updatedCard.interval,
                repetitions: updatedCard.repetitions,
                nextReviewDate: updatedCard.nextReview,
                lastReviewedAt: updatedCard.lastReview ?? undefined,
                createdAt: new Date(), // Not tracked, use current time
              },
            },
            'spacedRepetitionStore'
          );

          return updatedCard;
        },

        /**
         * Get all cards that are due for review (nextReview <= now)
         * @returns {SpacedRepetitionItem[]} Array of cards ready for review
         */
        getDueCards: (): SpacedRepetitionItem[] => {
          const { cards } = get();
          const now = new Date();
          return Array.from(cards.values()).filter((card) => card.nextReview <= now);
        },

        /**
         * Get the next scheduled review date for a county
         * @param {string} countyCode - County identifier
         * @returns {Date | null} Next review date or null if card doesn't exist
         */
        getNextReviewDate: (countyCode: string): Date | null => {
          const card = get().cards.get(countyCode);
          return card?.nextReview ?? null;
        },

        /**
         * Get the spaced repetition card for a county
         * @param {string} countyCode - County identifier
         * @returns {SpacedRepetitionItem | undefined} Card data or undefined if not found
         */
        getCard: (countyCode: string): SpacedRepetitionItem | undefined => {
          return get().cards.get(countyCode);
        },
      }),
      {
        name: 'spaced-repetition-storage',
        partialize: (state) => ({
          cards: Array.from(state.cards.entries()),
          reviewQueue: state.reviewQueue,
        }),
        merge: (persistedState: unknown, current) => {
          const persisted = persistedState as
            | { cards?: [string, SpacedRepetitionItem][]; reviewQueue?: string[] }
            | undefined;
          return {
            ...current,
            cards: new Map(persisted?.cards || []),
            reviewQueue: persisted?.reviewQueue || [],
          };
        },
      }
    ),
    { name: 'SpacedRepetitionStore' }
  )
);
