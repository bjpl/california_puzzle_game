import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useGame } from '../context/GameContext';
import { useSoundEffect, SoundType } from '../utils/simpleSoundManager';
import CountyTray from './CountyTray';
import CaliforniaMapFixed from './CaliforniaMapFixed';
import CaliforniaMapSimple from './CaliforniaMapSimple';
import GameHeader from './GameHeader';
import GameComplete from './GameComplete';
import StudyMode from './StudyMode';
import RegionsPanel from './RegionsPanel';
import SimpleMapTest from './SimpleMapTest';

export default function GameContainer() {
  const {
    isGameStarted,
    isGameComplete,
    startGame,
    resetGame,
    selectCounty,
    placeCounty,
    clearCurrentCounty,
    currentCounty,
    counties,
    placedCounties
  } = useGame();

  const [isDragging, setIsDragging] = useState(false);
  const [activeCounty, setActiveCounty] = useState<any>(null);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const sound = useSoundEffect();

  // Initialize sound system on first user interaction
  useEffect(() => {
    const initSoundOnInteraction = () => {
      sound.initSound();
      // Remove listeners after first interaction
      document.removeEventListener('click', initSoundOnInteraction);
      document.removeEventListener('touchstart', initSoundOnInteraction);
    };

    document.addEventListener('click', initSoundOnInteraction);
    document.addEventListener('touchstart', initSoundOnInteraction);

    return () => {
      document.removeEventListener('click', initSoundOnInteraction);
      document.removeEventListener('touchstart', initSoundOnInteraction);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const countyId = event.active.id as string;
    const county = counties.find(c => c.id === countyId);
    if (county && !placedCounties.has(countyId)) {
      selectCounty(county);
      setActiveCounty(county);
      setIsDragging(true);
      // Sound now plays on click in CountyPill component
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    setActiveCounty(null);

    if (over) {
      const draggedId = active.id as string;
      const targetId = over.id as string;

      // Check if the county was dropped on its correct position
      const isCorrect = draggedId === targetId;

      // Play appropriate sound based on placement result
      if (isCorrect) {
        sound.playSound('correct');
      } else {
        sound.playSound('incorrect');
      }

      placeCounty(draggedId, isCorrect);
    } else {
      clearCurrentCounty();
    }
  };

  if (!isGameStarted) {
    return (
      <>
        {showStudyMode && <StudyMode onClose={() => setShowStudyMode(false)} />}
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            🗺️ California Counties Puzzle
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Learn California geography by placing counties in their correct locations!
          </p>
          <div className="space-y-4 text-left mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold">How to Play</h3>
                <p className="text-gray-600">Drag counties from the tray and drop them on the correct location on the map</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <h3 className="font-semibold">Score Points</h3>
                <p className="text-gray-600">Earn 100 points for each correct placement, lose 10 for mistakes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h3 className="font-semibold">Complete the Map</h3>
                <p className="text-gray-600">Place all 20 major California counties to win!</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={startGame}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Start Game
            </button>
            <button
              onClick={() => setShowStudyMode(true)}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors"
            >
              📚 Study Mode
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (isGameComplete) {
    return <GameComplete />;
  }

  return (
    <div className="container mx-auto p-2 max-w-7xl">
      <GameHeader />

      {/* Regions Panel */}
      <RegionsPanel />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-2">
          {/* County Tray */}
          <div className="lg:col-span-1">
            <CountyTray />
          </div>

          {/* Map - Using simplified version for better rendering */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-4 h-[520px]">
              <CaliforniaMapSimple isDragging={isDragging} />
            </div>
          </div>
        </div>

        {/* Drag Overlay - This renders the dragged item outside of its container */}
        <DragOverlay dropAnimation={null}>
          {activeCounty ? (
            <div className="px-1 py-0 bg-yellow-100 border border-yellow-400 rounded shadow-md cursor-grabbing pointer-events-none" style={{ fontSize: '11px' }}>
              <span className="font-semibold text-gray-700">{activeCounty.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}