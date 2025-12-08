import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  StudySession,
  StudyMode,
  SessionState,
  StudyEventType,
} from '../../types/study-domain.types';
import { storeCoordinator } from '../storeCoordinator';

interface SessionStoreState {
  currentSession: StudySession | null;
  isActive: boolean;
  isPaused: boolean;
  pausedDuration: number;
  sessionStartTime: number | null;
}

interface SessionActions {
  startSession: (mode: StudyMode) => string;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => SessionStatistics | null;
  recordCountyStudied: (countyCode: string, correct: boolean, timeMs: number) => void;
}

interface SessionStatistics {
  sessionId: string;
  mode: StudyMode;
  duration: number;
  countiesStudied: number;
  correctCount: number;
  accuracy: number;
  timestamp: Date;
}

const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useSessionStore = create<SessionStoreState & SessionActions>()(
  devtools(
    (set, get) => ({
      currentSession: null,
      isActive: false,
      isPaused: false,
      pausedDuration: 0,
      sessionStartTime: null,

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
