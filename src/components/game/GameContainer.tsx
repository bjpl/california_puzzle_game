import { useState, useEffect, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  closestCenter,
} from '@dnd-kit/core';
import { useGame } from '../../context/GameContext';
import { useSoundEffect } from '../../utils/simpleSoundManager';
import { Button, Card, Heading, Text } from '../ui';
import CountyTray from '../county/CountyTray';
import CaliforniaMapSimple from '../map/CaliforniaMapSimple';
import GameHeader from './GameHeader';
import GameComplete from './GameComplete';
import RegionsPanel from '../shared/RegionsPanel';
import MobileGameInstructions from './MobileGameInstructions';
import { MapErrorBoundary } from '../map/MapErrorBoundary';
import { StudyErrorBoundary } from '../study/StudyErrorBoundary';
import { GAME_CONFIG } from '@/constants';
import LoadingSpinner from '../shared/LoadingSpinner';
import { prefetchStudyMode, prefetchGameFeatures } from '../../utils/prefetch';
import { useDeviceInfo } from '../../mobile/hooks/useDeviceInfo';

// Lazy load heavy components
const EnhancedStudyMode = lazy(() => import('../study/EnhancedStudyMode'));

export default function GameContainer() {
  const {
    isGameStarted,
    isGameComplete,
    startGame,
    resetGame: _resetGame,
    selectCounty,
    placeCounty,
    clearCurrentCounty,
    currentCounty,
    counties,
    placedCounties,
  } = useGame();

  const [isDragging, setIsDragging] = useState(false);
  const [activeCounty, setActiveCounty] = useState<Record<string, unknown> | null>(null);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [selectedCountyForTouch, setSelectedCountyForTouch] = useState<Record<string, unknown> | null>(null);
  const sound = useSoundEffect();
  const deviceInfo = useDeviceInfo();

  // Prefetch game features when game starts
  useEffect(() => {
    if (isGameStarted) {
      prefetchGameFeatures();
    }
  }, [isGameStarted]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use touch sensor for mobile, pointer sensor for desktop
  const sensors = useSensors(
    useSensor(deviceInfo.isTouch ? TouchSensor : PointerSensor, {
      activationConstraint: {
        distance: deviceInfo.isTouch ? 10 : GAME_CONFIG.DRAG_ACTIVATION_DISTANCE,
        delay: deviceInfo.isTouch ? 250 : 0, // Add delay for touch to prevent accidental drags
        tolerance: deviceInfo.isTouch ? 5 : 0,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const countyId = event.active.id as string;
    const county = counties.find((c) => c.id === countyId);
    if (county && !placedCounties.has(countyId)) {
      selectCounty(county);
      setActiveCounty(county as unknown as Record<string, unknown>);
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
        {showStudyMode && (
          <StudyErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading Study Mode..." />}>
              <EnhancedStudyMode onClose={() => setShowStudyMode(false)} onStartGame={startGame} />
            </Suspense>
          </StudyErrorBoundary>
        )}
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
                    <Heading level={3} size="label" weight="semibold">
                      Interactive Learning
                    </Heading>
                    <Text color="secondary">
                      Explore each county's unique location by placing them on the map
                    </Text>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🌟</span>
                  <div>
                    <Heading level={3} size="label" weight="semibold">
                      Build Knowledge
                    </Heading>
                    <Text color="secondary">
                      Learn about California's diverse regions and county boundaries
                    </Text>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎓</span>
                  <div>
                    <Heading level={3} size="label" weight="semibold">
                      Master Geography
                    </Heading>
                    <Text color="secondary">
                      Develop a deep understanding of California's 58 counties
                    </Text>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <Button variant="primary" size="large" onClick={startGame}>
                  Begin Exploration
                </Button>
                <Button
                  variant="primary"
                  size="large"
                  onClick={() => setShowStudyMode(true)}
                  onMouseEnter={prefetchStudyMode}
                  onFocus={prefetchStudyMode}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-2 max-w-7xl">
        <GameHeader />

        {/* Regions Panel */}
        <RegionsPanel />

        {/* Mobile instructions */}
        {(deviceInfo.isMobile || deviceInfo.isTablet) && (
          <MobileGameInstructions />
        )}

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <div className={`
            ${deviceInfo.isMobile || deviceInfo.isTablet
              ? 'flex flex-col gap-2'
              : 'flex flex-col lg:grid lg:grid-cols-4 gap-3 lg:gap-4'
            } mt-2
          `}>
            {/* County Tray - Optimized for mobile scrolling */}
            <div className={`
              ${deviceInfo.isMobile || deviceInfo.isTablet
                ? 'order-2'
                : 'lg:col-span-1 order-2 lg:order-1'
              }
            `}>
              <CountyTray />
            </div>

            {/* Map - Larger on mobile for better gameplay */}
            <div className={`
              ${deviceInfo.isMobile || deviceInfo.isTablet
                ? 'order-1'
                : 'lg:col-span-3 order-1 lg:order-2'
              }
            `}>
              <div className={`
                bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg
                p-3 lg:p-4 border border-gray-100 dark:border-gray-800
                ${deviceInfo.isMobile || deviceInfo.isTablet
                  ? 'h-[40vh]'
                  : 'h-[55vh] lg:h-[520px]'
                }
              `}>
                <MapErrorBoundary>
                  <CaliforniaMapSimple isDragging={isDragging} />
                </MapErrorBoundary>
              </div>
            </div>
          </div>

          {/* Drag Overlay - This renders the dragged item outside of its container */}
          <DragOverlay dropAnimation={null}>
            {activeCounty ? (
              <div
                className="px-1 py-0 bg-yellow-100 dark:bg-yellow-800/80 border border-yellow-400 dark:border-yellow-600 rounded shadow-md cursor-grabbing pointer-events-none"
                style={{ fontSize: '11px' }}
              >
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {activeCounty.name}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        {/* Render Study Mode with Portal to ensure it appears above everything */}
        {showStudyMode &&
          createPortal(
            <StudyErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading Study Mode..." />}>
                <EnhancedStudyMode
                  onClose={() => setShowStudyMode(false)}
                  onStartGame={startGame}
                />
              </Suspense>
            </StudyErrorBoundary>,
            document.body
          )}
      </div>
    </div>
  );
}
