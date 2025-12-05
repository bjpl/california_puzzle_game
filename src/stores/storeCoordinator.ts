/**
 * Enhanced StoreCoordinator - Event-Driven Study Domain Coordination
 *
 * Coordinates communication between decomposed study domain stores via
 * type-safe event subscriptions with debouncing, error handling, and monitoring.
 *
 * Architecture:
 * - Event bus for publish/subscribe pattern
 * - Rate limiting for high-frequency events
 * - Error boundary for failed propagations
 * - Monitoring hooks for debugging
 * - Subscription cleanup management
 */

import { useCountyPlacementStore } from './countyPlacementStore';
import { useAchievementStore } from './achievementStore';
import { logger } from '../utils/logger';
import {
  StudyEvent,
  StudyEventType,
  StudyEventPayload,
  EventSubscriber,
  UnsubscribeFn,
  SessionStartedPayload,
  SessionPausedPayload,
  SessionResumedPayload,
  SessionCompletedPayload,
  CountyStudiedPayload,
  CountyMasteryChangedPayload,
  ReviewCompletedPayload,
  ReviewDuePayload,
  ProgressUpdatedPayload,
  StreakUpdatedPayload,
  MilestoneReachedPayload,
  GoalCreatedPayload,
  GoalProgressPayload,
  GoalCompletedPayload,
  GoalFailedPayload,
  StatisticsCalculatedPayload,
} from '../types/study-domain.types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Debounce configuration for event types
 */
interface DebounceConfig {
  delayMs: number;
  maxWaitMs?: number;
}

/**
 * Subscription metadata
 */
interface SubscriptionMeta {
  id: string;
  eventType: StudyEventType;
  subscriber: EventSubscriber;
  sourceStore: string;
  createdAt: Date;
  callCount: number;
  lastCalledAt?: Date;
  errorCount: number;
}

/**
 * Monitoring event for debugging
 */
interface MonitorEvent {
  type: 'publish' | 'subscribe' | 'unsubscribe' | 'error';
  eventType?: StudyEventType;
  subscriptionId?: string;
  error?: Error;
  timestamp: Date;
}

// ============================================================================
// STORE COORDINATOR
// ============================================================================

class StoreCoordinator {
  private subscriptions = new Map<StudyEventType, Set<SubscriptionMeta>>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private pendingEvents = new Map<string, StudyEvent>();
  private monitorListeners: Array<(event: MonitorEvent) => void> = [];
  private errorHandlers: Array<(error: Error, event: StudyEvent) => void> = [];

  /**
   * Debounce configuration per event type
   */
  private debounceConfig: Partial<Record<StudyEventType, DebounceConfig>> = {
    [StudyEventType.COUNTY_STUDIED]: { delayMs: 100, maxWaitMs: 500 },
    [StudyEventType.PROGRESS_UPDATED]: { delayMs: 300, maxWaitMs: 1000 },
    [StudyEventType.GOAL_PROGRESS]: { delayMs: 200, maxWaitMs: 800 },
    [StudyEventType.STATISTICS_CALCULATED]: { delayMs: 500, maxWaitMs: 2000 },
  };

  // ==========================================================================
  // CORE EVENT BUS
  // ==========================================================================

  /**
   * Publish an event to all subscribers
   */
  publish<T extends StudyEventPayload>(
    type: StudyEventType,
    payload: T,
    sourceStore: string
  ): void {
    const event: StudyEvent<T> = {
      type,
      payload,
      timestamp: new Date(),
      sourceStore,
    };

    this.emitMonitorEvent({
      type: 'publish',
      eventType: type,
      timestamp: new Date(),
    });

    // Check if event should be debounced
    const debounce = this.debounceConfig[type];
    if (debounce) {
      this.publishDebounced(event, debounce);
    } else {
      this.publishImmediate(event);
    }
  }

  /**
   * Subscribe to specific event type
   */
  subscribe<T extends StudyEventPayload>(
    eventType: StudyEventType,
    subscriber: EventSubscriber<T>,
    sourceStore: string
  ): UnsubscribeFn {
    const meta: SubscriptionMeta = {
      id: this.generateSubscriptionId(),
      eventType,
      subscriber: subscriber as EventSubscriber,
      sourceStore,
      createdAt: new Date(),
      callCount: 0,
      errorCount: 0,
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    this.subscriptions.get(eventType)!.add(meta);

    this.emitMonitorEvent({
      type: 'subscribe',
      eventType,
      subscriptionId: meta.id,
      timestamp: new Date(),
    });

    // Return unsubscribe function
    return () => {
      this.subscriptions.get(eventType)?.delete(meta);
      this.emitMonitorEvent({
        type: 'unsubscribe',
        eventType,
        subscriptionId: meta.id,
        timestamp: new Date(),
      });
    };
  }

  /**
   * Subscribe to multiple event types with single handler
   */
  subscribeMultiple(
    eventTypes: StudyEventType[],
    subscriber: EventSubscriber,
    sourceStore: string
  ): UnsubscribeFn {
    const unsubscribers = eventTypes.map((type) => this.subscribe(type, subscriber, sourceStore));

    return () => unsubscribers.forEach((unsub) => unsub());
  }

  // ==========================================================================
  // DEBOUNCING & RATE LIMITING
  // ==========================================================================

  private publishDebounced(event: StudyEvent, config: DebounceConfig): void {
    const key = `${event.type}_${event.sourceStore}`;

    // Clear existing timer
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Store event (overwrite previous)
    this.pendingEvents.set(key, event);

    // Set new timer
    const timer = setTimeout(() => {
      const pendingEvent = this.pendingEvents.get(key);
      if (pendingEvent) {
        this.publishImmediate(pendingEvent);
        this.pendingEvents.delete(key);
      }
      this.debounceTimers.delete(key);
    }, config.delayMs);

    this.debounceTimers.set(key, timer);

    // Max wait enforcement
    if (config.maxWaitMs) {
      const firstEventTime = event.timestamp.getTime();
      setTimeout(() => {
        const pendingEvent = this.pendingEvents.get(key);
        if (pendingEvent && pendingEvent.timestamp.getTime() === firstEventTime) {
          clearTimeout(this.debounceTimers.get(key));
          this.publishImmediate(pendingEvent);
          this.pendingEvents.delete(key);
          this.debounceTimers.delete(key);
        }
      }, config.maxWaitMs);
    }
  }

  private publishImmediate(event: StudyEvent): void {
    const subscribers = this.subscriptions.get(event.type);
    if (!subscribers || subscribers.size === 0) {
      return;
    }

    subscribers.forEach((meta) => {
      this.callSubscriber(meta, event);
    });
  }

  private async callSubscriber(meta: SubscriptionMeta, event: StudyEvent): Promise<void> {
    try {
      meta.callCount++;
      meta.lastCalledAt = new Date();

      const result = meta.subscriber(event);
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      meta.errorCount++;
      const err = error instanceof Error ? error : new Error(String(error));

      this.emitMonitorEvent({
        type: 'error',
        eventType: event.type,
        subscriptionId: meta.id,
        error: err,
        timestamp: new Date(),
      });

      this.handleSubscriberError(err, event);
    }
  }

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  private handleSubscriberError(error: Error, event: StudyEvent): void {
    logger.error(
      `[StoreCoordinator] Subscriber error for ${event.type} from ${event.sourceStore}:`,
      error
    );

    this.errorHandlers.forEach((handler) => {
      try {
        handler(error, event);
      } catch (handlerError) {
        logger.error('[StoreCoordinator] Error handler failed:', handlerError);
      }
    });
  }

  /**
   * Register global error handler
   */
  onError(handler: (error: Error, event: StudyEvent) => void): UnsubscribeFn {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index >= 0) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  // ==========================================================================
  // MONITORING & DEBUGGING
  // ==========================================================================

  /**
   * Register monitor listener for debugging
   */
  onMonitorEvent(listener: (event: MonitorEvent) => void): UnsubscribeFn {
    this.monitorListeners.push(listener);
    return () => {
      const index = this.monitorListeners.indexOf(listener);
      if (index >= 0) {
        this.monitorListeners.splice(index, 1);
      }
    };
  }

  private emitMonitorEvent(event: MonitorEvent): void {
    this.monitorListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        logger.error('[StoreCoordinator] Monitor listener failed:', error);
      }
    });
  }

  /**
   * Get subscription statistics for debugging
   */
  getSubscriptionStats(): Array<{
    eventType: StudyEventType;
    subscriberCount: number;
    subscribers: Array<{
      id: string;
      sourceStore: string;
      callCount: number;
      errorCount: number;
      lastCalledAt?: Date;
    }>;
  }> {
    const stats: ReturnType<typeof this.getSubscriptionStats> = [];

    this.subscriptions.forEach((subscribers, eventType) => {
      stats.push({
        eventType,
        subscriberCount: subscribers.size,
        subscribers: Array.from(subscribers).map((meta) => ({
          id: meta.id,
          sourceStore: meta.sourceStore,
          callCount: meta.callCount,
          errorCount: meta.errorCount,
          lastCalledAt: meta.lastCalledAt,
        })),
      });
    });

    return stats;
  }

  /**
   * Flush all pending debounced events immediately
   */
  flush(): void {
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();

    this.pendingEvents.forEach((event) => {
      this.publishImmediate(event);
    });
    this.pendingEvents.clear();
  }

  /**
   * Clear all subscriptions (for testing/cleanup)
   */
  clearAll(): void {
    this.flush();
    this.subscriptions.clear();
    this.monitorListeners = [];
    this.errorHandlers = [];
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Configure debouncing for specific event type
   */
  setDebounceConfig(eventType: StudyEventType, config: DebounceConfig): void {
    this.debounceConfig[eventType] = config;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const storeCoordinator = new StoreCoordinator();

// ============================================================================
// LEGACY COORDINATION (EXISTING SUBSCRIPTIONS)
// ============================================================================

// Track if coordinator has been initialized
let isInitialized = false;
// Store cleanup function for proper teardown
let cleanupFunction: (() => void) | null = null;

/**
 * Initialize store coordination subscriptions.
 * Call this once at app startup (e.g., in main.tsx or App.tsx).
 */
export function initializeStoreCoordination(): () => void {
  if (isInitialized) {
    logger.warn('Store coordination already initialized');
    return () => {};
  }

  const unsubscribers: (() => void)[] = [];

  // SUBSCRIPTION 1: County Placement → Achievement Checking
  // When a county is placed, check for achievements
  // Using manual state comparison since subscribeWithSelector requires middleware
  let prevPlacementResult = useCountyPlacementStore.getState().lastPlacementResult;
  const unsubPlacement = useCountyPlacementStore.subscribe((state) => {
    const lastPlacementResult = state.lastPlacementResult;
    // Only trigger when there's a new placement (not null and different from previous)
    if (lastPlacementResult && lastPlacementResult !== prevPlacementResult) {
      prevPlacementResult = lastPlacementResult;
      // Pass remainingCounties as parameter to avoid circular import in achievementStore
      useAchievementStore
        .getState()
        .checkAchievements(lastPlacementResult, state.remainingCounties);
    }
  });
  unsubscribers.push(unsubPlacement);

  isInitialized = true;
  logger.info('[StoreCoordinator] Subscriptions initialized');

  // Return cleanup function and store it for resetCoordination
  cleanupFunction = () => {
    unsubscribers.forEach((unsub) => unsub());
    isInitialized = false;
    cleanupFunction = null;
    logger.info('[StoreCoordinator] Subscriptions cleaned up');
  };

  return cleanupFunction;
}

/**
 * Check if coordination is initialized (for debugging)
 */
export function isCoordinationInitialized(): boolean {
  return isInitialized;
}

/**
 * Reset coordination state (for testing)
 * Calls cleanup if coordination is active
 */
export function resetCoordination(): void {
  if (cleanupFunction) {
    cleanupFunction();
  } else {
    isInitialized = false;
    cleanupFunction = null;
  }
}

// ============================================================================
// STUDY DOMAIN SUBSCRIPTIONS (24 TOTAL)
// ============================================================================

/**
 * Initialize all cross-store subscriptions for study domain
 * Called once during app initialization
 */
// Lazy import to avoid circular dependencies
let _stores: Awaited<ReturnType<typeof importStores>> | null = null;
const importStores = async () => {
  const [
    { useSessionStore },
    { useCountyProgressStore },
    { useSpacedRepetitionStore },
    { useProgressStore },
    { useGoalsStore },
    { useStatisticsStore },
    { useStudySettingsStore },
  ] = await Promise.all([
    import('./study/sessionStore'),
    import('./study/countyProgressStore'),
    import('./study/spacedRepetitionStore'),
    import('./study/progressStore'),
    import('./study/goalsStore'),
    import('./study/statisticsStore'),
    import('./study/studySettingsStore'),
  ]);
  return {
    sessionStore: useSessionStore,
    countyProgressStore: useCountyProgressStore,
    spacedRepetitionStore: useSpacedRepetitionStore,
    progressStore: useProgressStore,
    goalsStore: useGoalsStore,
    statisticsStore: useStatisticsStore,
    studySettingsStore: useStudySettingsStore,
  };
};

const getStores = () => {
  if (!_stores) {
    throw new Error('Stores not initialized. Call initializeStudyDomainSubscriptions first.');
  }
  return _stores;
};

export async function initializeStudyDomainSubscriptions(): Promise<UnsubscribeFn> {
  const unsubscribers: UnsubscribeFn[] = [];

  // Initialize stores
  _stores = await importStores();

  // ==========================================================================
  // SESSION EVENTS → OTHER STORES (Subscriptions 1-4)
  // ==========================================================================

  // Subscription 1: Session started → Track session start for analytics
  unsubscribers.push(
    storeCoordinator.subscribe<SessionStartedPayload>(
      StudyEventType.SESSION_STARTED,
      (event) => {
        const { statisticsStore } = getStores();
        // Log session start for analytics
        logger.debug(
          `[Event] Session ${event.payload.sessionId} started in ${event.payload.mode} mode`
        );
        // Track session start time for duration calculations
        statisticsStore.getState().recalculateAggregates();
      },
      'storeCoordinator'
    )
  );

  // Subscription 2: Session paused → Track paused duration for accurate stats
  unsubscribers.push(
    storeCoordinator.subscribe<SessionPausedPayload>(
      StudyEventType.SESSION_PAUSED,
      (event) => {
        logger.debug(`[Event] Session ${event.payload.sessionId} paused`);
        // No cross-store action needed - paused duration tracked internally
      },
      'storeCoordinator'
    )
  );

  // Subscription 3: Session resumed → Log for tracking
  unsubscribers.push(
    storeCoordinator.subscribe<SessionResumedPayload>(
      StudyEventType.SESSION_RESUMED,
      (event) => {
        logger.debug(`[Event] Session ${event.payload.sessionId} resumed`);
      },
      'storeCoordinator'
    )
  );

  // Subscription 4: Session completed → Record in statistics, update streak
  unsubscribers.push(
    storeCoordinator.subscribe<SessionCompletedPayload>(
      StudyEventType.SESSION_COMPLETED,
      (event) => {
        const { statisticsStore, progressStore } = getStores();
        // Record session in statistics (convert StudyMode enum to StudyModeType string)
        const modeMap: Record<string, 'flashcard' | 'map-exploration' | 'grid-study'> = {
          flashcards: 'flashcard',
          'map-exploration': 'map-exploration',
          'grid-study': 'grid-study',
        };
        const modeString = modeMap[event.payload.mode] || 'flashcard';
        statisticsStore.getState().recordSession({
          sessionId: event.payload.sessionId,
          mode: modeString,
          duration: event.payload.duration,
          countiesStudied: event.payload.countiesStudied,
          correctCount: event.payload.correctCount,
          accuracy: event.payload.accuracy,
          timestamp: event.timestamp.getTime(),
        });
        // Update streak on session complete
        progressStore.getState().updateStreak();
      },
      'storeCoordinator'
    )
  );

  // ==========================================================================
  // COUNTY STUDIED EVENTS → OTHER STORES (Subscriptions 5-7)
  // ==========================================================================

  // Subscription 5: County studied → Update progress
  unsubscribers.push(
    storeCoordinator.subscribe<CountyStudiedPayload>(
      StudyEventType.COUNTY_STUDIED,
      (event) => {
        const { progressStore } = getStores();
        const { countyCode } = event.payload;
        // Update overall progress
        progressStore.getState().incrementStudied(countyCode);
      },
      'storeCoordinator'
    )
  );

  // Subscription 6: County studied → Update spaced repetition
  unsubscribers.push(
    storeCoordinator.subscribe<CountyStudiedPayload>(
      StudyEventType.COUNTY_STUDIED,
      (event) => {
        const { spacedRepetitionStore } = getStores();
        const { countyCode, correct } = event.payload;
        // Update spaced repetition with quality based on correctness
        const quality = correct ? 5 : 1;
        spacedRepetitionStore.getState().recordReview(countyCode, quality);
      },
      'storeCoordinator'
    )
  );

  // Subscription 7: County studied → Update weekly progress
  unsubscribers.push(
    storeCoordinator.subscribe<CountyStudiedPayload>(
      StudyEventType.COUNTY_STUDIED,
      (_event) => {
        const { statisticsStore } = getStores();
        // Update weekly progress counter
        statisticsStore.getState().updateWeeklyProgress(1);
      },
      'storeCoordinator'
    )
  );

  // Subscription 8: County mastery changed → Add achievements
  unsubscribers.push(
    storeCoordinator.subscribe<CountyMasteryChangedPayload>(
      StudyEventType.COUNTY_MASTERY_CHANGED,
      (event) => {
        const { statisticsStore } = getStores();
        const { countyCode, newLevel } = event.payload;
        // Add mastery achievement if fully mastered
        if (newLevel === 'mastered') {
          statisticsStore.getState().addAchievement(`mastery_${countyCode}`);
        }
      },
      'storeCoordinator'
    )
  );

  // ==========================================================================
  // REVIEW EVENTS → OTHER STORES (Subscriptions 9-11)
  // ==========================================================================

  // Subscription 9: Review completed → Update county progress mastery
  unsubscribers.push(
    storeCoordinator.subscribe<ReviewCompletedPayload>(
      StudyEventType.REVIEW_COMPLETED,
      (event) => {
        const { countyProgressStore, progressStore } = getStores();
        const { review, updatedCard } = event.payload;
        // Check for mastery (high ease factor and multiple repetitions)
        if (updatedCard.easeFactor >= 2.5 && updatedCard.repetitions >= 3) {
          progressStore.getState().markMastered(review.countyCode);
          countyProgressStore.getState().updateMasteryLevel(review.countyCode, 3);
        }
      },
      'storeCoordinator'
    )
  );

  // Subscription 10: Review completed → Log for tracking
  unsubscribers.push(
    storeCoordinator.subscribe<ReviewCompletedPayload>(
      StudyEventType.REVIEW_COMPLETED,
      (event) => {
        logger.debug(`[Event] Review completed for ${event.payload.review.countyCode}`);
      },
      'storeCoordinator'
    )
  );

  // Subscription 11: Review due → Notify for review reminders
  unsubscribers.push(
    storeCoordinator.subscribe<ReviewDuePayload>(
      StudyEventType.REVIEW_DUE,
      (event) => {
        const { count, dueCards } = event.payload;
        logger.info(
          `[Event] ${count} cards due for review: ${dueCards.map((c) => c.countyCode).join(', ')}`
        );
        // Could integrate with notification system in future
      },
      'storeCoordinator'
    )
  );

  // ==========================================================================
  // PROGRESS EVENTS → OTHER STORES (Subscriptions 12-15)
  // ==========================================================================

  // Subscription 12: Progress updated → Log for tracking
  unsubscribers.push(
    storeCoordinator.subscribe<ProgressUpdatedPayload>(
      StudyEventType.PROGRESS_UPDATED,
      (event) => {
        logger.debug(`[Event] Progress updated from ${event.sourceStore}`);
      },
      'storeCoordinator'
    )
  );

  // Subscription 13: Progress updated → Recalculate statistics
  unsubscribers.push(
    storeCoordinator.subscribe<ProgressUpdatedPayload>(
      StudyEventType.PROGRESS_UPDATED,
      (_event) => {
        const { statisticsStore } = getStores();
        statisticsStore.getState().recalculateAggregates();
      },
      'storeCoordinator'
    )
  );

  // Subscription 14: Streak updated → Track streak achievements
  unsubscribers.push(
    storeCoordinator.subscribe<StreakUpdatedPayload>(
      StudyEventType.STREAK_UPDATED,
      (event) => {
        const { statisticsStore } = getStores();
        const { currentStreak, longestStreak, streakBroken } = event.payload;
        // Update best streak in statistics
        if (currentStreak > statisticsStore.getState().bestStreak) {
          // Achievement for new best streak
          statisticsStore.getState().addAchievement(`streak_${currentStreak}`);
        }
        if (streakBroken) {
          logger.info(`[Event] Streak broken! Was at ${longestStreak}`);
        }
      },
      'storeCoordinator'
    )
  );

  // Subscription 15: Milestone reached → Add achievement
  unsubscribers.push(
    storeCoordinator.subscribe<MilestoneReachedPayload>(
      StudyEventType.MILESTONE_REACHED,
      (event) => {
        const { statisticsStore } = getStores();
        const { milestoneType, threshold, actualValue } = event.payload;
        statisticsStore.getState().addAchievement(`milestone_${milestoneType}_${threshold}`);
        logger.info(
          `[Event] Milestone reached: ${milestoneType} = ${actualValue} (threshold: ${threshold})`
        );
      },
      'storeCoordinator'
    )
  );

  // ==========================================================================
  // GOAL EVENTS → OTHER STORES (Subscriptions 16-20)
  // ==========================================================================

  // Subscription 16: Goal created → Track in statistics
  unsubscribers.push(
    storeCoordinator.subscribe<GoalCreatedPayload>(
      StudyEventType.GOAL_CREATED,
      (event) => {
        const { statisticsStore } = getStores();
        logger.debug(`[Event] Goal created: ${event.payload.goal.type}`);
        statisticsStore.getState().addAchievement(`goal_created_${event.payload.goal.type}`);
      },
      'storeCoordinator'
    )
  );

  // Subscription 17: Goal progress → Update statistics tracking
  unsubscribers.push(
    storeCoordinator.subscribe<GoalProgressPayload>(
      StudyEventType.GOAL_PROGRESS,
      (event) => {
        const { percentComplete, goalId } = event.payload;
        logger.debug(`[Event] Goal ${goalId} progress: ${percentComplete}%`);
        // Progress events handled internally, no cross-store action needed
      },
      'storeCoordinator'
    )
  );

  // Subscription 18: Goal completed → Add achievement
  unsubscribers.push(
    storeCoordinator.subscribe<GoalCompletedPayload>(
      StudyEventType.GOAL_COMPLETED,
      (event) => {
        const { statisticsStore } = getStores();
        const { goal } = event.payload;
        statisticsStore.getState().addAchievement(`goal_completed_${goal.id}`);
        statisticsStore.getState().addAchievement(`goal_type_${goal.type}_completed`);
        logger.info(`[Event] Goal completed: ${goal.type} (${goal.id})`);
      },
      'storeCoordinator'
    )
  );

  // Subscription 19: Goal failed → Track in statistics
  unsubscribers.push(
    storeCoordinator.subscribe<GoalFailedPayload>(
      StudyEventType.GOAL_FAILED,
      (event) => {
        const { statisticsStore } = getStores();
        const { goal, reason } = event.payload;
        logger.warn(`[Event] Goal failed: ${goal.type} - ${reason}`);
        // Track failure for analytics
        statisticsStore.getState().addAchievement(`goal_failed_${goal.id}`);
      },
      'storeCoordinator'
    )
  );

  // ==========================================================================
  // STATISTICS EVENTS → OTHER STORES (Subscriptions 20-21)
  // ==========================================================================

  // Subscription 20: Statistics calculated → Check achievement thresholds
  unsubscribers.push(
    storeCoordinator.subscribe<StatisticsCalculatedPayload>(
      StudyEventType.STATISTICS_CALCULATED,
      (event) => {
        const { aggregateStatistics } = event.payload;
        if (aggregateStatistics) {
          logger.debug(
            `[Event] Statistics recalculated: ${aggregateStatistics.totalSessions} total sessions`
          );
          // Could trigger achievement checks based on aggregate stats
        }
      },
      'storeCoordinator'
    )
  );

  // ==========================================================================
  // CROSS-CUTTING SUBSCRIPTIONS (Subscriptions 21-24)
  // ==========================================================================

  // Subscription 21: Multiple events → Update weekly progress
  unsubscribers.push(
    storeCoordinator.subscribeMultiple(
      [StudyEventType.SESSION_COMPLETED, StudyEventType.MILESTONE_REACHED],
      (_event) => {
        const { statisticsStore } = getStores();
        statisticsStore.getState().recalculateAggregates();
      },
      'storeCoordinator'
    )
  );

  // Subscription 22: All county events → Log for tracking
  unsubscribers.push(
    storeCoordinator.subscribeMultiple(
      [StudyEventType.COUNTY_STUDIED, StudyEventType.COUNTY_MASTERY_CHANGED],
      (event) => {
        logger.debug(`[County Event] ${event.type} from ${event.sourceStore}`);
      },
      'storeCoordinator'
    )
  );

  // Subscription 23: All session events → Log for debugging
  unsubscribers.push(
    storeCoordinator.subscribeMultiple(
      [
        StudyEventType.SESSION_STARTED,
        StudyEventType.SESSION_PAUSED,
        StudyEventType.SESSION_RESUMED,
        StudyEventType.SESSION_COMPLETED,
      ],
      (event) => {
        logger.debug(`[Session Event] ${event.type} from ${event.sourceStore}`);
      },
      'storeCoordinator'
    )
  );

  // Subscription 24: All goal events → Update statistics
  unsubscribers.push(
    storeCoordinator.subscribeMultiple(
      [StudyEventType.GOAL_CREATED, StudyEventType.GOAL_COMPLETED, StudyEventType.GOAL_FAILED],
      (_event) => {
        const { statisticsStore } = getStores();
        statisticsStore.getState().recalculateAggregates();
      },
      'storeCoordinator'
    )
  );

  logger.info('[StoreCoordinator] Study domain subscriptions initialized (24 active)');

  // Return cleanup function
  return () => {
    unsubscribers.forEach((unsub) => unsub());
    logger.info('[StoreCoordinator] Study domain subscriptions cleaned up');
  };
}

// ============================================================================
// DEBUGGING UTILITIES
// ============================================================================

/**
 * Enable verbose event logging (development only)
 */
export function enableEventLogging(): UnsubscribeFn {
  return storeCoordinator.onMonitorEvent((event) => {
    if (event.type === 'publish') {
      logger.debug(`[Event Published] ${event.eventType} @ ${event.timestamp.toISOString()}`);
    } else if (event.type === 'subscribe') {
      logger.debug(`[Subscribed] ${event.eventType} (ID: ${event.subscriptionId})`);
    } else if (event.type === 'unsubscribe') {
      logger.debug(`[Unsubscribed] ${event.eventType} (ID: ${event.subscriptionId})`);
    } else if (event.type === 'error') {
      logger.error(`[Event Error] ${event.eventType}:`, event.error);
    }
  });
}

/**
 * Get event flow visualization (for debugging)
 */
export function getEventFlowDiagram(): string {
  const stats = storeCoordinator.getSubscriptionStats();
  let diagram = 'Event Flow:\n\n';

  stats.forEach(({ eventType, subscribers }) => {
    diagram += `${eventType}\n`;
    subscribers.forEach((sub) => {
      diagram += `  → ${sub.sourceStore} (calls: ${sub.callCount}, errors: ${sub.errorCount})\n`;
    });
    diagram += '\n';
  });

  return diagram;
}
