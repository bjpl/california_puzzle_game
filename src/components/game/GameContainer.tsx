import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useGame } from '../../context/GameContext';
import { useSoundEffect, SoundType } from '../../utils/simpleSoundManager';
import { Button, Card, Heading, Text } from '../ui';
import CountyTray from '../county/CountyTray';
import CaliforniaMapFixed from '../map/CaliforniaMapFixed';
import CaliforniaMapSimple from '../map/CaliforniaMapSimple';
import GameHeader from './GameHeader';
import GameComplete from './GameComplete';
import StudyMode from '../study-new/StudyMode';
import EnhancedStudyMode from '../study-new/EnhancedStudyMode';
import RegionsPanel from '../regions/RegionsPanel';
import SimpleMapTest from '../_deprecated/SimpleMapTest';

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
        {showStudyMode && <EnhancedStudyMode onClose={() => setShowStudyMode(false)} onStartGame={startGame} />}
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card variant="elevated" className="max-w-2xl w-full text-center">
          <div className="p-8">
            <Heading level={1} size="display" align="center" className="text-blue-900 mb-4">
              🗺️ California Counties Explorer
            </Heading>
            <Text size="lg" color="secondary" align="center" className="mb-8">
              Discover California's geography through interactive exploration and learning
            </Text>
            <div className="space-y-4 text-left mb-8">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <Heading level={3} size="label" weight="semibold">Interactive Learning</Heading>
                  <Text color="secondary">Explore each county's unique location by placing them on the map</Text>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌟</span>
                <div>
                  <Heading level={3} size="label" weight="semibold">Build Knowledge</Heading>
                  <Text color="secondary">Learn about California's diverse regions and county boundaries</Text>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎓</span>
                <div>
                  <Heading level={3} size="label" weight="semibold">Master Geography</Heading>
                  <Text color="secondary">Develop a deep understanding of California's 58 counties</Text>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                variant="primary"
                size="large"
                onClick={startGame}
              >
                Begin Exploration
              </Button>
              <Button
                variant="primary"
                size="large"
                onClick={() => setShowStudyMode(true)}
                icon={<span>📚</span>}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Study Mode
              </Button>
            </div>
          </div>
        </Card>
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
      {/* Render Study Mode with Portal to ensure it appears above everything */}
      {showStudyMode && createPortal(
        <EnhancedStudyMode onClose={() => setShowStudyMode(false)} onStartGame={startGame} />,
        document.body
      )}
    </div>
  );
}