import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useSoundEffect } from '../utils/simpleSoundManager';

export default function GameComplete() {
  const { score, mistakes, resetGame } = useGame();
  const sound = useSoundEffect();

  // Play win sound when component mounts
  useEffect(() => {
    sound.playSound('win');
  }, []);

  const getGrade = () => {
    if (mistakes === 0) return { grade: 'Perfect!', color: 'text-yellow-500' };
    if (mistakes <= 3) return { grade: 'Excellent!', color: 'text-blue-500' };
    if (mistakes <= 6) return { grade: 'Good Job!', color: 'text-green-500' };
    return { grade: 'Complete!', color: 'text-gray-500' };
  };

  const { grade, color } = getGrade();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full text-center">
        <div className="text-6xl mb-4 celebration-bounce">
          <svg className="w-20 h-20 mx-auto text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className={`text-4xl font-bold mb-4 ${color}`}>
          {grade}
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          You've completed the California Counties Puzzle!
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Final Score</p>
              <p className="text-2xl font-bold text-green-600">{score}</p>
            </div>
            <div>
              <p className="text-gray-600">Mistakes</p>
              <p className="text-2xl font-bold text-red-600">{mistakes}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={resetGame}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Play Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            Main Menu
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Share your achievement!</p>
          <div className="flex justify-center gap-4 mt-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm hover:bg-blue-200">Email</button>
            <button className="px-3 py-1 bg-green-100 text-green-600 rounded-md text-sm hover:bg-green-200">SMS</button>
            <button className="px-3 py-1 bg-purple-100 text-purple-600 rounded-md text-sm hover:bg-purple-200">Share</button>
          </div>
        </div>
      </div>
    </div>
  );
}