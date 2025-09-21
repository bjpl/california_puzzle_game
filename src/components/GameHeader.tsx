import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager, SoundType } from '../utils/soundManager';
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
      soundManager.playSound(SoundType.PICKUP);
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
    <div className="bg-white rounded-lg shadow-lg p-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <h1 className="text-lg font-bold text-blue-900">California Counties Puzzle</h1>
          {currentCounty && (
            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              Selected: {currentCounty.name}
            </span>
          )}
        </div>

        <div className="flex gap-3 items-center">
          <div className="text-center">
            <p className="text-xs text-gray-600">Score</p>
            <p className="text-sm font-bold text-green-600">{score}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-1">
              <button
                onClick={handlePausePlay}
                className={`p-0.5 rounded text-xs ${isPaused ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? '▶️' : '⏸️'}
              </button>
              <div>
                <p className="text-sm font-bold text-purple-600">{formatTime(timerState.elapsed)}</p>
                <p className="text-xs text-gray-600">{isPaused ? 'Paused' : 'Time'}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">Progress</p>
            <p className="text-sm font-bold text-blue-600">{progress}%</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">Hints</p>
            <p className="text-sm font-bold text-yellow-600">{hints}</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">Mistakes</p>
            <p className="text-sm font-bold text-red-600">{mistakes}</p>
          </div>

          <button
            onClick={toggleSound}
            className={`px-2 py-1 rounded text-sm transition-all ${
              soundEnabled
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-400 text-gray-700 hover:bg-gray-500'
            }`}
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          <button
            onClick={handleUseHint}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
              hints === 0 || !currentCounty
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md hover:shadow-lg'
            }`}
            disabled={hints === 0 || !currentCounty}
            title={
              hints === 0
                ? 'No hints remaining'
                : !currentCounty
                  ? 'Select a county first to use hint'
                  : `Use hint (${hints} remaining)`
            }
          >
            <span className="flex items-center gap-1">
              <span>💡</span>
              <span>Hint ({hints})</span>
            </span>
          </button>


          <button
            onClick={resetGame}
            className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Hint Modal */}
      <HintModal
        isOpen={showHintModal}
        onClose={() => setShowHintModal(false)}
        county={currentCounty}
        hintLevel={hintLevel}
      />
    </div>
  );
}