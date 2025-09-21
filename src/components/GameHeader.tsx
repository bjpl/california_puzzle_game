import { useGame } from '../context/GameContext';

export default function GameHeader() {
  const { score, mistakes, placedCounties, counties, resetGame } = useGame();
  const progress = (placedCounties.size / counties.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-blue-900">California Counties Puzzle</h1>
          <span className="text-2xl">🗺️</span>
        </div>

        <div className="flex gap-6 items-center">
          <div className="text-center">
            <p className="text-sm text-gray-600">Score</p>
            <p className="text-xl font-bold text-green-600">{score}</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">Mistakes</p>
            <p className="text-xl font-bold text-red-600">{mistakes}</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">Progress</p>
            <p className="text-xl font-bold text-blue-600">
              {placedCounties.size}/{counties.length}
            </p>
          </div>

          <button
            onClick={resetGame}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}