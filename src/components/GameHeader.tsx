import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager, SoundType } from '../utils/soundManager';

export default function GameHeader() {
  const { score, mistakes, placedCounties, counties, resetGame, timerState, pauseGame, resumeGame, isGameStarted, isPaused, hints, useHint, showRegions, toggleShowRegions } = useGame();
  const [soundEnabled, setSoundEnabled] = useState(!soundManager.isMuted());
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
    if (useHint()) {
      soundManager.playSound(SoundType.HOVER);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <h1 className="text-lg font-bold text-blue-900">California Counties Puzzle</h1>
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
            className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600 transition-colors disabled:bg-gray-300"
            disabled={hints === 0}
          >
            💡 Hint
          </button>

          <button
            onClick={toggleShowRegions}
            className={`px-2 py-1 rounded text-sm transition-all ${
              showRegions
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
            title={showRegions ? 'Hide Regions' : 'Show Regions'}
          >
            🗺️ Regions
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
    </div>
  );
}