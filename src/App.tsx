import { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import GameContainer from './components/game/GameContainer';
import { GameProvider } from './context/GameContext';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import './styles/globals.css';

function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
          <GameContainer />
        </div>
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
