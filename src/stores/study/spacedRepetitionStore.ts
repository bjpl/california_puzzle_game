import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SpacedRepetitionItem } from '../../types/study';
import { StudyEventType } from '../../types/study-domain.types';
import { storeCoordinator } from '../storeCoordinator';

interface SpacedRepetitionState {
  cards: Map<string, SpacedRepetitionItem>;
  reviewQueue: string[];
}

interface SpacedRepetitionActions {
  recordReview: (countyCode: string, quality: number) => SpacedRepetitionItem;
  getDueCards: () => SpacedRepetitionItem[];
  getNextReviewDate: (countyCode: string) => Date | null;
  getCard: (countyCode: string) => SpacedRepetitionItem | undefined;
  initializeCard: (countyCode: string) => SpacedRepetitionItem;
}

// SM-2 Algorithm Implementation
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

        getDueCards: (): SpacedRepetitionItem[] => {
          const { cards } = get();
          const now = new Date();
          return Array.from(cards.values()).filter((card) => card.nextReview <= now);
        },

        getNextReviewDate: (countyCode: string): Date | null => {
          const card = get().cards.get(countyCode);
          return card?.nextReview ?? null;
        },

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
        merge: (
          persisted:
            | { cards?: [string, SpacedRepetitionItem][]; reviewQueue?: string[] }
            | undefined,
          current
        ) => ({
          ...current,
          cards: new Map(persisted?.cards || []),
          reviewQueue: persisted?.reviewQueue || [],
        }),
      }
    ),
    { name: 'SpacedRepetitionStore' }
  )
);
