import { useGame } from '../context/GameContext';

export default function GameHeader() {
  const { score, mistakes, placedCounties, counties, resetGame } = useGame();
  const progress = (placedCounties.size / counties.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <h1 className="text-lg font-bold text-blue-900">California Counties Puzzle</h1>
        </div>

        <div className="flex gap-4 items-center">
          <div className="text-center">
            <p className="text-xs text-gray-600">Score</p>
            <p className="text-sm font-bold text-green-600">{score}</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">Mistakes</p>
            <p className="text-sm font-bold text-red-600">{mistakes}</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">Progress</p>
            <p className="text-sm font-bold text-blue-600">
              {placedCounties.size}/{counties.length}
            </p>
          </div>

          <button
            onClick={resetGame}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
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