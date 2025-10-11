import GameContainer from './components/game/GameContainer';
import { GameProvider } from './context/GameContext';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { UpdateToast } from './components/shared/UpdateToast';
import './styles/globals.css';

function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
          <GameContainer />
          <UpdateToast />
        </div>
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
