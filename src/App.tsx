import './styles/globals.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-900 mb-3">
            🗺️ California Counties Puzzle Game
          </h1>
          <p className="text-xl text-gray-700">
            Learn California geography through an interactive puzzle game
          </p>
        </header>

        {/* Main Content */}
        <main className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🏗️</div>
            <h2 className="text-3xl font-semibold text-gray-800">
              Coming Soon!
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're building an engaging educational game to help you learn all 58 California counties.
              Drag and drop counties to their correct locations, explore regional challenges,
              and test your knowledge with fun quizzes!
            </p>

            {/* Feature List */}
            <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-3xl mx-auto text-left">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span>🧩</span> Interactive Puzzle
                </h3>
                <p className="text-gray-700">
                  Drag and drop California counties to their correct positions
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <span>📚</span> Educational Content
                </h3>
                <p className="text-gray-700">
                  Learn interesting facts about each county's history and culture
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <span>🏆</span> Achievements
                </h3>
                <p className="text-gray-700">
                  Unlock badges and track your progress as you master California geography
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <span>🎮</span> Multiple Game Modes
                </h3>
                <p className="text-gray-700">
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
        <footer className="text-center mt-12 text-gray-600">
          <p>© 2025 California Counties Puzzle Game</p>
          <p className="text-sm mt-2">
            Built with React, TypeScript, and D3.js
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;