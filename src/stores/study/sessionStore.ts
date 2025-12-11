/**
 * @fileoverview Study Session Management Store
 * @module stores/study/sessionStore
 * @description Manages active study session lifecycle including start, pause, resume, and completion.
 * Tracks real-time session metrics and coordinates with other stores via event publishing.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  StudySession,
  StudyMode,
  SessionState,
  StudyEventType,
} from '../../types/study-domain.types';
import { storeCoordinator } from '../storeCoordinator';

/**
 * Session store state shape
 */
interface SessionStoreState {
  /** Currently active study session, null if no session */
  currentSession: StudySession | null;
  /** Whether a session is currently running */
  isActive: boolean;
  /** Whether the current session is paused */
  isPaused: boolean;
  /** Total accumulated pause duration in milliseconds */
  pausedDuration: number;
  /** Timestamp when session started (milliseconds since epoch) */
  sessionStartTime: number | null;
}

/**
 * Session management actions
 */
interface SessionActions {
  /** Start a new study session with the specified mode */
  startSession: (mode: StudyMode) => string;
  /** Pause the current active session */
  pauseSession: () => void;
  /** Resume a paused session */
  resumeSession: () => void;
  /** End the current session and return statistics */
  endSession: () => SessionStatistics | null;
  /** Record a county answer during the session */
  recordCountyStudied: (countyCode: string, correct: boolean, timeMs: number) => void;
}

/**
 * Summary statistics returned when ending a session
 */
interface SessionStatistics {
  /** Unique session identifier */
  sessionId: string;
  /** Study mode used during session */
  mode: StudyMode;
  /** Total duration in milliseconds (excluding pauses) */
  duration: number;
  /** Number of counties studied */
  countiesStudied: number;
  /** Number of correct answers */
  correctCount: number;
  /** Accuracy percentage (0-1) */
  accuracy: number;
  /** Session completion timestamp */
  timestamp: Date;
}

/**
 * Generates a unique session identifier
 * @returns {string} Session ID in format: session-{timestamp}-{random}
 */
const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const useSessionStore = create<SessionStoreState & SessionActions>()(
  devtools(
    (set, get) => ({
      currentSession: null,
      isActive: false,
      isPaused: false,
      pausedDuration: 0,
      sessionStartTime: null,

      /**
       * Start a new study session
       * @param {StudyMode} mode - The study mode to use
       * @returns {string} The unique session ID
       * @example
       * const sessionId = startSession(StudyMode.FLASHCARD);
       */
      startSession: (mode: StudyMode): string => {
        const sessionId = generateSessionId();
        const session: StudySession = {
          id: sessionId,
          mode,
          state: SessionState.ACTIVE,
          startTime: new Date(),
          totalPausedDuration: 0,
          settings: {
            mode,
            timerEnabled: false,
            autoAdvance: true,
            shuffleOrder: false,
          },
          countiesStudied: [],
          correctAnswers: 0,
          incorrectAnswers: 0,
          totalResponseTimeMs: 0,
        };

        set({
          currentSession: session,
          isActive: true,
          isPaused: false,
          pausedDuration: 0,
          sessionStartTime: Date.now(),
        });

        storeCoordinator.publish(
          StudyEventType.SESSION_STARTED,
          { sessionId, mode, settings: session.settings, timestamp: new Date() },
          'sessionStore'
        );

        return sessionId;
      },

      /**
       * Pause the currently active session
       * No-op if session is not active or already paused
       */
      pauseSession: () => {
        if (!get().isActive || get().isPaused) return;

        const sessionId = get().currentSession?.id;
        if (!sessionId) return;

        set({ isPaused: true });

        storeCoordinator.publish(
          StudyEventType.SESSION_PAUSED,
          { sessionId, timestamp: new Date() },
          'sessionStore'
        );
      },

      /**
       * Resume a paused session
       * No-op if session is not paused
       */
      resumeSession: () => {
        if (!get().isPaused) return;

        const sessionId = get().currentSession?.id;
        if (!sessionId) return;

        set({ isPaused: false });

        storeCoordinator.publish(
          StudyEventType.SESSION_RESUMED,
          { sessionId, timestamp: new Date() },
          'sessionStore'
        );
      },

      /**
       * End the current session and calculate statistics
       * @returns {SessionStatistics | null} Session statistics or null if no active session
       * @example
       * const stats = endSession();
       * // stats.accuracy contains accuracy ${stats.accuracy * 100}%`);
       */
      endSession: (): SessionStatistics | null => {
        const { currentSession, sessionStartTime, pausedDuration } = get();
        if (!currentSession) return null;

        const duration = Date.now() - (sessionStartTime || 0) - pausedDuration;
        const stats: SessionStatistics = {
          sessionId: currentSession.id,
          mode: currentSession.mode,
          duration,
          countiesStudied: currentSession.countiesStudied.length,
          correctCount: currentSession.correctAnswers,
          accuracy:
            currentSession.countiesStudied.length > 0
              ? currentSession.correctAnswers / currentSession.countiesStudied.length
              : 0,
          timestamp: new Date(),
        };

        set({
          currentSession: null,
          isActive: false,
          isPaused: false,
          pausedDuration: 0,
          sessionStartTime: null,
        });

        storeCoordinator.publish(
          StudyEventType.SESSION_COMPLETED,
          {
            sessionId: stats.sessionId,
            mode: stats.mode,
            duration: stats.duration,
            countiesStudied: stats.countiesStudied,
            correctCount: stats.correctCount,
            accuracy: stats.accuracy,
            timestamp: stats.timestamp,
          },
          'sessionStore'
        );

        return stats;
      },

      /**
       * Record a county answer during the current session
       * @param {string} countyCode - County identifier
       * @param {boolean} correct - Whether the answer was correct
       * @param {number} timeMs - Response time in milliseconds
       */
      recordCountyStudied: (countyCode: string, correct: boolean, timeMs: number) => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              countiesStudied: [...state.currentSession.countiesStudied, countyCode],
              correctAnswers: state.currentSession.correctAnswers + (correct ? 1 : 0),
              incorrectAnswers: state.currentSession.incorrectAnswers + (correct ? 0 : 1),
              totalResponseTimeMs: state.currentSession.totalResponseTimeMs + timeMs,
            },
          };
        });
      },
    }),
    { name: 'SessionStore' }
  )
);
