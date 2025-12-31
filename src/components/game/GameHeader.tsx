import { useState } from 'react';
import { createPortal } from 'react-dom';
import { soundManager } from '../../utils/simpleSoundManager';
import { gameLogger } from '../../utils/logger';
import { Heading, Text, Badge, Progress } from '../ui';
import { SimpleThemeToggle } from '../ui/ThemeToggle';
import HintModal from '../game/modals/HintModal';
import EnhancedStudyMode from '../study/EnhancedStudyMode';
import { UserSettings } from '../shared/settings/UserSettings';
import { UserMenu, AuthStatus } from '../auth';
import { UI_CONFIG, GAME_CONFIG } from '@/constants';
import { useDeviceInfo } from '../../mobile/hooks/useDeviceInfo';
import { useScoringStore } from '@/stores/scoringStore';
import { useGameLifecycleStore } from '@/stores/gameLifecycleStore';
import { useHintStore } from '@/stores/hintSystemStore';
import { useCountyPlacementStore } from '@/stores/countyPlacementStore';
import { allCaliforniaCounties } from '@/data/californiaCountiesComplete';
import { HintType } from '@/types';

export default function GameHeader() {
  // Zustand stores
  const { score, mistakes } = useScoringStore();
  const { isPaused, pauseGame, resumeGame, resetGame, timeElapsed, isGameActive } =
    useGameLifecycleStore();
  const { hintSystem } = useHintStore();
  const { placedCounties, currentHint } = useCountyPlacementStore();

  // Derived values
  const counties = allCaliforniaCounties;
  const hints = hintSystem.availableHints;
  const currentCounty = currentHint;
  const timerStarted = isGameActive;
  const timerState = { elapsed: timeElapsed };
  const [soundEnabled, setSoundEnabled] = useState(!soundManager.isMuted());
  const [showHintModal, setShowHintModal] = useState(false);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [countyHintAttempts, setCountyHintAttempts] = useState<Record<string, number>>({});
  const progress = Math.round((placedCounties.length / counties.length) * 100);
  const deviceInfo = useDeviceInfo();
  const isMobile = deviceInfo.isMobile || deviceInfo.isTablet;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundManager.setMuted(!newState);
    if (newState) {
      soundManager.play('pickup', UI_CONFIG.SOUND_VOLUME_PICKUP);
    }
  };

  const handlePausePlay = () => {
    if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  };

  const handleUseHint = () => {
    if (hints > 0 && currentCounty) {
      // Track attempts per county for progressive hints
      const countyName = currentCounty.name;
      const currentAttempts = countyHintAttempts[countyName] || 0;
      const newAttempts = currentAttempts + 1;

      setCountyHintAttempts((prev) => ({
        ...prev,
        [countyName]: newAttempts,
      }));

      // Determine hint level based on attempts
      let level = 1;
      if (newAttempts >= GAME_CONFIG.HINT_LEVEL_2_ATTEMPTS) level = 2;
      if (newAttempts >= GAME_CONFIG.HINT_LEVEL_3_ATTEMPTS) level = 3;

      setHintLevel(level);

      // Use hint with appropriate type based on level
      const hintType =
        level === 1 ? HintType.LOCATION : level === 2 ? HintType.NEIGHBOR : HintType.EDUCATIONAL;
      useHintStore.getState().useHint(hintType, currentCounty.id, false);

      try {
        soundManager.play('hover', UI_CONFIG.SOUND_VOLUME_PICKUP);
      } catch (error) {
        gameLogger.warn('Sound play failed:', error);
      }
      setShowHintModal(true);
    }
  };

  return (
    <div
      className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 ${isMobile ? 'p-2.5' : 'p-4'}`}
    >
      {/* Top Section - Title and Current Selection */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white text-sm font-bold">CA</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <Heading
              level={1}
              size={isMobile ? 'label' : 'section'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent truncate"
            >
              {isMobile ? 'CA Counties' : 'California Counties Puzzle'}
            </Heading>
            {currentCounty && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Text size="xs" color="secondary" className="flex-shrink-0">
                  {isMobile ? '📍' : 'Now placing:'}
                </Text>
                <Badge variant="info" size="small" className="truncate max-w-[120px]">
                  {currentCounty.name}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Group - Responsive */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <SimpleThemeToggle size={isMobile ? 'small' : 'medium'} />

          <button
            onClick={() => {
              setShowStudyMode(true);
              pauseGame();
            }}
            className={`flex items-center gap-1.5 ${isMobile ? 'px-2 py-1.5' : 'px-4 py-2'} rounded-xl text-sm font-medium bg-indigo-600 text-white shadow-lg hover:shadow-xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all`}
            aria-label="Open study mode to learn county locations"
            title="Study Mode"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            {!isMobile && <span>Study Mode</span>}
          </button>

          <button
            onClick={handleUseHint}
            className={`flex items-center gap-1.5 ${isMobile ? 'px-2 py-1.5' : 'px-4 py-2'} rounded-xl text-sm font-medium transition-all ${
              hints === 0 || !currentCounty
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-amber-500 text-white shadow-lg hover:shadow-xl hover:bg-amber-600 hover:scale-105 active:scale-95'
            }`}
            disabled={hints === 0 || !currentCounty}
            aria-label={`Get hint for placing ${currentCounty?.name || 'county'}. ${hints} hints remaining`}
            title={`Hint (${hints} remaining)`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            {!isMobile && <span>Hint</span>}
            <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-xs">{hints}</span>
          </button>

          <button
            onClick={toggleSound}
            className={`${isMobile ? 'p-2.5' : 'p-2'} rounded-xl transition-all ${
              soundEnabled
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title={soundEnabled ? 'Mute' : 'Unmute'}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
          >
            <svg
              className={isMobile ? 'w-4 h-4' : 'w-5 h-5'}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {soundEnabled ? (
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </button>

          <button
            onClick={handlePausePlay}
            className={`${isMobile ? 'p-2.5' : 'p-2'} rounded-xl transition-all ${
              isPaused
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
            title={isPaused ? 'Resume' : 'Pause'}
            aria-label={isPaused ? 'Resume game' : 'Pause game'}
          >
            <svg
              className={isMobile ? 'w-4 h-4' : 'w-5 h-5'}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {isPaused ? (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </button>

          {!isMobile && (
            <button
              onClick={resetGame}
              className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all"
              title="Reset Game"
              aria-label="Reset game and start over"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className={`${isMobile ? 'p-2.5' : 'p-2'} rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all`}
            title="Settings"
            aria-label="Open user settings including account and data export options"
          >
            <svg
              className={isMobile ? 'w-4 h-4' : 'w-5 h-5'}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Auth Status and User Menu */}
          <div className="flex items-center gap-1.5 ml-1 pl-1.5 border-l border-gray-200 dark:border-gray-700">
            <AuthStatus />
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Stats Bar - Responsive */}
      <div className={`flex items-center ${isMobile ? 'gap-2 flex-wrap' : 'gap-6'} mb-3`}>
        {/* Score */}
        <div className="flex items-center gap-1.5">
          <div
            className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0`}
          >
            <span className={`text-green-600 ${isMobile ? 'text-xs' : 'text-xs'} font-bold`}>
              {score}
            </span>
          </div>
          <span className="text-xs text-gray-500">{isMobile ? '🏆' : 'Points'}</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5">
          <div
            className={`w-auto ${isMobile ? 'min-w-[3rem] px-1.5 h-7' : 'min-w-[3.5rem] px-2 h-8'} rounded-lg flex items-center justify-center transition-all ${
              !timerStarted ? 'bg-gray-100 border border-gray-300' : 'bg-purple-100'
            }`}
          >
            <span
              className={`${isMobile ? 'text-xs' : 'text-xs'} font-bold ${!timerStarted ? 'text-gray-400' : 'text-purple-600'}`}
            >
              {!timerStarted ? (isMobile ? '⏱️' : 'Ready') : formatTime(timerState.elapsed)}
            </span>
          </div>
          {!isMobile && (
            <span className="text-xs text-gray-500">
              {!timerStarted ? 'Timer starts on first move' : isPaused ? 'Paused' : 'Time'}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className={`flex items-center ${isMobile ? 'gap-1.5' : 'gap-2'} flex-1`}>
          {!isMobile && (
            <Text size="xs" color="secondary">
              Progress
            </Text>
          )}
          <div className="flex-1">
            <Progress
              value={placedCounties.length}
              max={counties.length}
              variant="gradient"
              size="small"
              animated
            />
          </div>
          <Text
            size="xs"
            weight="bold"
            className={`text-gray-700 dark:text-gray-300 ${isMobile ? 'text-xs' : ''}`}
          >
            {isMobile ? `${placedCounties.length}/${counties.length}` : `${progress}%`}
          </Text>
        </div>

        {/* Mistakes */}
        <div className="flex items-center gap-1.5">
          <div
            className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0`}
          >
            <span className="text-red-600 text-xs font-bold">{mistakes}</span>
          </div>
          <span className="text-xs text-gray-500">{isMobile ? '❌' : 'Mistakes'}</span>
        </div>
      </div>

      {/* Render HintModal via Portal to ensure it's on top */}
      {typeof document !== 'undefined' &&
        currentCounty &&
        createPortal(
          <HintModal
            isOpen={showHintModal}
            onClose={() => setShowHintModal(false)}
            county={currentCounty as never}
            hintLevel={hintLevel}
          />,
          document.body
        )}

      {/* Render Study Mode Modal with Portal to ensure it appears above game */}
      {showStudyMode &&
        createPortal(
          <EnhancedStudyMode
            onClose={() => {
              setShowStudyMode(false);
              resumeGame(); // Resume game when closing study mode
            }}
            onStartGame={() => {
              setShowStudyMode(false);
              resumeGame();
            }}
          />,
          document.body
        )}

      {/* Render User Settings Modal with Portal */}
      {showSettings &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <UserSettings onClose={() => setShowSettings(false)} />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
