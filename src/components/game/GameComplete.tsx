import { useEffect } from 'react';
import { useScoringStore } from '@/stores/scoringStore';
import { useGameLifecycleStore } from '@/stores/gameLifecycleStore';
import { useSoundEffect } from '../../utils/simpleSoundManager';
import { Card, Heading, Text, Button } from '../ui';
import { GAME_GRADES } from '@/constants';

export default function GameComplete() {
  const { score, mistakes } = useScoringStore();
  const { resetGame } = useGameLifecycleStore();
  const sound = useSoundEffect();

  // Play win sound when component mounts
  useEffect(() => {
    sound.playSound('win');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getGrade = () => {
    if (mistakes === GAME_GRADES.PERFECT.mistakeThreshold) {
      return {
        grade: GAME_GRADES.PERFECT.label,
        emoji: GAME_GRADES.PERFECT.emoji,
        color: GAME_GRADES.PERFECT.color,
      };
    }
    if (mistakes <= GAME_GRADES.EXCELLENT.mistakeThreshold) {
      return {
        grade: GAME_GRADES.EXCELLENT.label,
        emoji: GAME_GRADES.EXCELLENT.emoji,
        color: GAME_GRADES.EXCELLENT.color,
      };
    }
    if (mistakes <= GAME_GRADES.GOOD.mistakeThreshold) {
      return {
        grade: GAME_GRADES.GOOD.label,
        emoji: GAME_GRADES.GOOD.emoji,
        color: GAME_GRADES.GOOD.color,
      };
    }
    return {
      grade: GAME_GRADES.COMPLETE.label,
      emoji: GAME_GRADES.COMPLETE.emoji,
      color: GAME_GRADES.COMPLETE.color,
    };
  };

  const { grade, emoji, color } = getGrade();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <Card variant="elevated" className="max-w-lg w-full text-center">
        <div className="p-8">
          <div className="text-6xl mb-4">{emoji}</div>
          <Heading level={1} size="title" align="center" className={`mb-4 ${color}`}>
            {grade}
          </Heading>
          <Text size="xl" align="center" className="text-gray-700 dark:text-gray-300 mb-6">
            You've completed the California Counties Puzzle!
          </Text>

          <Card variant="default" className="bg-gray-50 dark:bg-gray-800 mb-6">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text color="secondary">Final Score</Text>
                  <Heading level={2} size="section" className="text-green-600">
                    {score}
                  </Heading>
                </div>
                <div>
                  <Text color="secondary">Mistakes</Text>
                  <Heading level={2} size="section" className="text-red-600">
                    {mistakes}
                  </Heading>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Button variant="primary" size="large" fullWidth onClick={resetGame}>
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
            <Text size="sm" color="secondary" align="center">
              Share your achievement!
            </Text>
            <div className="flex justify-center gap-4 mt-2">
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">
                📧
              </span>
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">
                📱
              </span>
              <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">
                💬
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
