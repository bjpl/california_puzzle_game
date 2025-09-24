import { useEffect, useState } from 'react';
import { shouldShowReturnToGame, generateReturnToGameUrl, loadGameState } from '../utils/gameStateManager';

interface ReturnToGameBannerProps {
  className?: string;
}

export default function ReturnToGameBanner({ className = '' }: ReturnToGameBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [gameInfo, setGameInfo] = useState<{
    placedCount: number;
    totalCount: number;
    score: number;
    timeSpent: number;
  } | null>(null);

  useEffect(() => {
    // Check if we should show the banner
    const shouldShow = shouldShowReturnToGame();
    setShowBanner(shouldShow);

    if (shouldShow) {
      // Load game state to show progress info
      const gameState = loadGameState();
      if (gameState) {
        setGameInfo({
          placedCount: gameState.placedCounties.length,
          totalCount: 58, // Total California counties
          score: gameState.score,
          timeSpent: gameState.timerState.time
        });
      }
    }
  }, []);

  if (!showBanner) return null;

  const handleReturnToGame = () => {
    window.location.href = generateReturnToGameUrl();
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg">Game in Progress</h3>
              <p className="text-blue-100 text-sm">
                You have a puzzle game waiting for you!
              </p>
            </div>

            {gameInfo && (
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{gameInfo.placedCount}/{gameInfo.totalCount}</div>
                  <div className="text-blue-200">Counties</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{gameInfo.score.toLocaleString()}</div>
                  <div className="text-blue-200">Score</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{formatTime(gameInfo.timeSpent)}</div>
                  <div className="text-blue-200">Time</div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleReturnToGame}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Game
          </button>
        </div>

        {/* Mobile game info */}
        {gameInfo && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/20">
            <div className="flex justify-around text-sm">
              <div className="text-center">
                <div className="font-semibold">{gameInfo.placedCount}/{gameInfo.totalCount}</div>
                <div className="text-blue-200">Counties</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{gameInfo.score.toLocaleString()}</div>
                <div className="text-blue-200">Score</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{formatTime(gameInfo.timeSpent)}</div>
                <div className="text-blue-200">Time</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}