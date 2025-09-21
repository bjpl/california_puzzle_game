import { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import GameContainer from './components/GameContainer';
import { GameProvider } from './context/GameContext';
import './styles/globals.css';

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <GameContainer />
      </div>
    </GameProvider>
  );
}

export default App;