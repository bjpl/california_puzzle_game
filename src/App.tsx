import './styles/globals.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-3">
            🗺️ California Counties Puzzle Game
          </h1>
          <p className="text-lg md:text-xl text-gray-700 px-4">
            Learn California geography through an interactive puzzle game
          </p>
        </header>

        {/* Main Content */}
        <main className="bg-white rounded-lg shadow-xl p-4 md:p-6 lg:p-8">
          <div className="text-center space-y-4 md:space-y-6">
            <div className="text-5xl md:text-6xl mb-4">🏗️</div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
              Coming Soon!
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              We're building an engaging educational game to help you learn all 58 California counties.
              Drag and drop counties to their correct locations, explore regional challenges,
              and test your knowledge with fun quizzes!
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8 max-w-3xl mx-auto text-left">
              <div className="bg-blue-50 p-4 md:p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm md:text-base">
                  <span>🧩</span> Interactive Puzzle
                </h3>
                <p className="text-gray-700 text-sm md:text-base">
                  Drag and drop California counties to their correct positions
                </p>
              </div>

              <div className="bg-green-50 p-4 md:p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm md:text-base">
                  <span>📚</span> Educational Content
                </h3>
                <p className="text-gray-700 text-sm md:text-base">
                  Learn interesting facts about each county's history and culture
                </p>
              </div>

              <div className="bg-yellow-50 p-4 md:p-6 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2 text-sm md:text-base">
                  <span>🏆</span> Achievements
                </h3>
                <p className="text-gray-700 text-sm md:text-base">
                  Unlock badges and track your progress as you master California geography
                </p>
              </div>

              <div className="bg-purple-50 p-4 md:p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2 text-sm md:text-base">
                  <span>🎮</span> Multiple Game Modes
                </h3>
                <p className="text-gray-700 text-sm md:text-base">
                  Challenge yourself with time trials, accuracy tests, and regional quizzes
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-12">
              <p className="text-sm text-gray-600 mb-2">Development Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">75% Complete</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-8 md:mt-12 text-gray-600 pb-4">
          <p className="text-sm md:text-base">© 2025 California Counties Puzzle Game</p>
          <p className="text-xs md:text-sm mt-2">
            Built with React, TypeScript, and D3.js
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;