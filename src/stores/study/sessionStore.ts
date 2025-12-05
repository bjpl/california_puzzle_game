import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { StudySession, StudyModeType } from '../../types/study';
import { StudyEventType } from '../../types/study-domain.types';
import { storeCoordinator } from '../storeCoordinator';

interface SessionState {
  currentSession: StudySession | null;
  isActive: boolean;
  isPaused: boolean;
  pausedDuration: number;
  sessionStartTime: number | null;
}

interface SessionActions {
  startSession: (mode: StudyModeType) => string;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => SessionStatistics | null;
  recordCountyStudied: (countyCode: string, correct: boolean, timeMs: number) => void;
}

interface SessionStatistics {
  sessionId: string;
  mode: StudyModeType;
  duration: number;
  countiesStudied: number;
  correctCount: number;
  accuracy: number;
}

const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useSessionStore = create<SessionState & SessionActions>()(
  devtools(
    (set, get) => ({
      currentSession: null,
      isActive: false,
      isPaused: false,
      pausedDuration: 0,
      sessionStartTime: null,

      startSession: (mode: StudyModeType): string => {
        const sessionId = generateSessionId();
        const session: StudySession = {
          id: sessionId,
          mode,
          startTime: new Date(),
          endTime: null,
          countiesStudied: [],
          correctCount: 0,
          incorrectCount: 0,
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
          { sessionId, mode },
          'sessionStore'
        );

        return sessionId;
      },

      pauseSession: () => {
        if (!get().isActive || get().isPaused) return;

        set({ isPaused: true });

        storeCoordinator.publish(
          StudyEventType.SESSION_PAUSED,
          { sessionId: get().currentSession?.id },
          'sessionStore'
        );
      },

      resumeSession: () => {
        if (!get().isPaused) return;

        set({ isPaused: false });

        storeCoordinator.publish(
          StudyEventType.SESSION_RESUMED,
          { sessionId: get().currentSession?.id },
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
          correctCount: currentSession.correctCount,
          accuracy:
            currentSession.countiesStudied.length > 0
              ? currentSession.correctCount / currentSession.countiesStudied.length
              : 0,
        };

        set({
          currentSession: null,
          isActive: false,
          isPaused: false,
          pausedDuration: 0,
          sessionStartTime: null,
        });

        storeCoordinator.publish(StudyEventType.SESSION_COMPLETED, stats, 'sessionStore');

        return stats;
      },

      recordCountyStudied: (countyCode: string, correct: boolean, _timeMs: number) => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              countiesStudied: [...state.currentSession.countiesStudied, countyCode],
              correctCount: state.currentSession.correctCount + (correct ? 1 : 0),
              incorrectCount: state.currentSession.incorrectCount + (correct ? 0 : 1),
            },
          };
        });
      },
    }),
    { name: 'SessionStore' }
  )
);
