import { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useSoundEffect } from '../../utils/simpleSoundManager';
import { Card, Heading, Text, Button, Badge } from '../ui';

/**
 * GameComplete - Victory screen displayed when all counties are correctly placed
 *
 * Shows final game statistics with performance-based grading and options to
 * replay or return to the main menu. Automatically plays a victory sound on mount.
 *
 * **Performance Grading:**
 * - Perfect (🏆): 0 mistakes
 * - Excellent (⭐): 1-3 mistakes
 * - Good Job (👍): 4-6 mistakes
 * - Complete (✅): 7+ mistakes
 *
 * **Displayed Statistics:**
 * - Final score
 * - Total mistakes made
 * - Performance grade with emoji
 *
 * **Actions:**
 * - Play Again: Resets game and starts new session
 * - Main Menu: Reloads application to welcome screen
 * - Share Achievement: Placeholder for social sharing (future feature)
 *
 * @component
 * @example
 * ```tsx
 * import GameComplete from '@/components/game/GameComplete';
 *
 * function GameContainer() {
 *   const { isGameComplete } = useGame();
 *
 *   if (isGameComplete) {
 *     return <GameComplete />;
 *   }
 *
 *   return <Game />;
 * }
 * ```
 *
 * @returns {JSX.Element} The game completion screen with statistics and options
 */
export default function GameComplete() {
  const { score, mistakes, resetGame } = useGame();
  const sound = useSoundEffect();

  // Play win sound when component mounts
  useEffect(() => {
    sound.playSound('win');
  }, []);

  const getGrade = () => {
    if (mistakes === 0) return { grade: 'Perfect!', emoji: '🏆', color: 'text-yellow-500' };
    if (mistakes <= 3) return { grade: 'Excellent!', emoji: '⭐', color: 'text-blue-500' };
    if (mistakes <= 6) return { grade: 'Good Job!', emoji: '👍', color: 'text-green-500' };
    return { grade: 'Complete!', emoji: '✅', color: 'text-gray-500' };
  };

  const { grade, emoji, color } = getGrade();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-green-50">
      <Card variant="elevated" className="max-w-lg w-full text-center">
        <div className="p-8">
          <div className="text-6xl mb-4">{emoji}</div>
          <Heading level={1} size="title" align="center" className={`mb-4 ${color}`}>
            {grade}
          </Heading>
          <Text size="xl" align="center" className="text-gray-700 mb-6">
            You've completed the California Counties Puzzle!
          </Text>

          <Card variant="default" className="bg-gray-50 mb-6">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text color="secondary">Final Score</Text>
                  <Heading level={2} size="section" className="text-green-600">{score}</Heading>
                </div>
                <div>
                  <Text color="secondary">Mistakes</Text>
                  <Heading level={2} size="section" className="text-red-600">{mistakes}</Heading>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={resetGame}
            >
              Play Again
            </Button>
            <Button
              variant="secondary"
              size="large"
              fullWidth
              onClick={() => window.location.reload()}
            >
              Main Menu
            </Button>
          </div>

          <div className="mt-6">
            <Text size="sm" color="secondary" align="center">Share your achievement!</Text>
            <div className="flex justify-center gap-4 mt-2">
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📧</span>
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📱</span>
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">💬</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}