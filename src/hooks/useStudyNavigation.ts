import { useCallback, useEffect } from 'react';
import { useSessionStore } from '../stores/study/sessionStore';
import { useProgressStore } from '../stores/study/progressStore';
import { StudyModeType } from '../types/study';
import { StudyMode } from '../types/study-domain.types';

// Type conversion from domain StudyMode to legacy StudyModeType
const modeEnumToType: Record<StudyMode, StudyModeType> = {
  [StudyMode.FLASHCARDS]: 'flashcard',
  [StudyMode.MAP_EXPLORATION]: 'map-exploration',
  [StudyMode.GRID_STUDY]: 'grid-study',
  [StudyMode.TIMED_CHALLENGE]: 'flashcard', // fallback
};

interface UseStudyNavigationProps {
  onNavigateToGame?: () => void;
  onNavigateToMenu?: () => void;
  onModeChange?: (mode: StudyModeType) => void;
}

export const useStudyNavigation = ({
  onNavigateToGame,
  onNavigateToMenu,
  onModeChange,
}: UseStudyNavigationProps = {}) => {
  // Domain stores
  const { isActive: isStudySessionActive, currentSession, endSession } = useSessionStore();

  const { totalStudied } = useProgressStore();

  // Handle navigation to game with study progress check
  const navigateToGame = useCallback(() => {
    if (isStudySessionActive) {
      endSession();
    }
    onNavigateToGame?.();
  }, [isStudySessionActive, endSession, onNavigateToGame]);

  // Handle navigation to menu
  const navigateToMenu = useCallback(() => {
    if (isStudySessionActive) {
      endSession();
    }
    onNavigateToMenu?.();
  }, [isStudySessionActive, endSession, onNavigateToMenu]);

  // Handle mode changes
  const handleModeChange = useCallback(
    (mode: StudyModeType) => {
      const currentModeType = currentSession ? modeEnumToType[currentSession.mode] : null;
      if (isStudySessionActive && currentModeType !== mode) {
        endSession();
      }
      onModeChange?.(mode);
    },
    [isStudySessionActive, currentSession, endSession, onModeChange]
  );

  // Keyboard navigation
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Only handle if not in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (event.key) {
        case 'Escape':
          if (isStudySessionActive) {
            endSession();
          }
          break;
        case 'g':
        case 'G':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            navigateToGame();
          }
          break;
        case 'm':
        case 'M':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            navigateToMenu();
          }
          break;
      }
    },
    [isStudySessionActive, endSession, navigateToGame, navigateToMenu]
  );

  // Set up keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Auto-save session on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isStudySessionActive) {
        endSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStudySessionActive, endSession]);

  // Study readiness check
  const getStudyReadiness = useCallback(() => {
    const totalCounties = 58; // Total California counties
    const studiedPercentage = (totalStudied / totalCounties) * 100;

    if (studiedPercentage >= 80) {
      return {
        level: 'expert' as const,
        message: "You're well-prepared! Ready for the expert challenge.",
        confidence: 95,
      };
    } else if (studiedPercentage >= 50) {
      return {
        level: 'advanced' as const,
        message: "Good progress! You're ready for most challenges.",
        confidence: 75,
      };
    } else if (studiedPercentage >= 25) {
      return {
        level: 'intermediate' as const,
        message: 'Nice start! Keep studying to improve your game performance.',
        confidence: 50,
      };
    } else {
      return {
        level: 'beginner' as const,
        message: 'Just getting started! Study mode will help you learn the counties.',
        confidence: 25,
      };
    }
  }, [totalStudied]);

  // Game mode recommendations based on study progress
  const getRecommendedGameMode = useCallback(() => {
    const readiness = getStudyReadiness();

    switch (readiness.level) {
      case 'expert':
        return {
          difficulty: 'expert' as const,
          region: 'all' as const,
          showHints: false,
          timeLimit: true,
        };
      case 'advanced':
        return {
          difficulty: 'hard' as const,
          region: 'all' as const,
          showHints: true,
          timeLimit: false,
        };
      case 'intermediate':
        return {
          difficulty: 'medium' as const,
          region: 'region' as const,
          showHints: true,
          timeLimit: false,
        };
      default:
        return {
          difficulty: 'easy' as const,
          region: 'bay_area' as const,
          showHints: true,
          timeLimit: false,
        };
    }
  }, [getStudyReadiness]);

  return {
    // Navigation functions
    navigateToGame,
    navigateToMenu,
    handleModeChange,

    // Study progress information
    studyProgress: { totalStudied },
    studyReadiness: getStudyReadiness(),
    recommendedGameMode: getRecommendedGameMode(),

    // Session status
    isStudySessionActive,
    currentSession,

    // Utility functions
    endCurrentSession: endSession,
  };
};
