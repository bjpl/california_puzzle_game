import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { soundManager } from '../utils/simpleSoundManager';
import HintModal from './HintModal';

export default function GameHeader() {
  const { score, mistakes, placedCounties, counties, resetGame, timerState, pauseGame, resumeGame, isGameStarted, isPaused, hints, useHint, currentCounty } = useGame();
  const [soundEnabled, setSoundEnabled] = useState(!soundManager.isMuted());
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [countyHintAttempts, setCountyHintAttempts] = useState<Record<string, number>>({});
  const progress = Math.round((placedCounties.size / counties.length) * 100);

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
      soundManager.play('pickup', 0.3);
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

      setCountyHintAttempts(prev => ({
        ...prev,
        [countyName]: newAttempts
      }));

      // Determine hint level based on attempts
      let level = 1;
      if (newAttempts >= 2) level = 2;
      if (newAttempts >= 3) level = 3;

      setHintLevel(level);

      if (useHint()) {
        soundManager.playSound(SoundType.HOVER);
        setShowHintModal(true);
      }
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-4">
      {/* Top Section - Title and Current Selection */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-sm">CA</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              California Counties Puzzle
            </h1>
          </div>
          {currentCounty && (
            <div className="flex items-center gap-2 ml-10">
              <span className="text-xs text-gray-500">Now placing:</span>
              <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {currentCounty.name}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUseHint}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              hints === 0 || !currentCounty
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
            }`}
            disabled={hints === 0 || !currentCounty}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span>Hint</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-xs">{hints}</span>
          </button>

          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl transition-all ${
              soundEnabled
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              {soundEnabled ? (
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              )}
            </svg>
          </button>

          <button
            onClick={handlePausePlay}
            className={`p-2 rounded-xl transition-all ${
              isPaused
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              {isPaused ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              )}
            </svg>
          </button>

          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all"
            title="Reset Game"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 mb-3">
        {/* Score */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 text-xs font-bold">{score}</span>
          </div>
          <span className="text-xs text-gray-500">Points</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <div className="w-auto min-w-[3.5rem] px-2 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 text-xs font-bold">{formatTime(timerState.elapsed)}</span>
          </div>
          <span className="text-xs text-gray-500">{isPaused ? 'Paused' : 'Time'}</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-gray-500">Progress</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-white/30 rounded-full animate-pulse"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-700">{progress}%</span>
        </div>

        {/* Mistakes */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-red-600 text-xs font-bold">{mistakes}</span>
          </div>
          <span className="text-xs text-gray-500">Mistakes</span>
        </div>
      </div>

      {/* Render HintModal via Portal to ensure it's on top */}
      {typeof document !== 'undefined' && createPortal(
        <HintModal
          isOpen={showHintModal}
          onClose={() => setShowHintModal(false)}
          county={currentCounty}
          hintLevel={hintLevel}
        />,
        document.body
      )}
    </div>
  );
}