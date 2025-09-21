import { useGame } from '../context/GameContext';

export default function GameComplete() {
  const { score, mistakes, resetGame } = useGame();

  const getGrade = () => {
    if (mistakes === 0) return { grade: 'Perfect!', emoji: '🏆', color: 'text-yellow-500' };
    if (mistakes <= 3) return { grade: 'Excellent!', emoji: '⭐', color: 'text-blue-500' };
    if (mistakes <= 6) return { grade: 'Good Job!', emoji: '👍', color: 'text-green-500' };
    return { grade: 'Complete!', emoji: '✅', color: 'text-gray-500' };
  };

  const { grade, emoji, color } = getGrade();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full text-center">
        <div className="text-6xl mb-4">{emoji}</div>
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
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Main Menu
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Share your achievement!</p>
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📧</span>
            <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📱</span>
            <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">💬</span>
          </div>
        </div>
      </div>
    </div>
  );
}