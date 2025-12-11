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
  KeyboardSensor,
  closestCenter,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';

// Custom keyboard coordinate getter for map-based drag (not sortable list)
const customKeyboardCoordinates: KeyboardCoordinateGetter = (event, { currentCoordinates }) => {
  const delta = 20; // pixels to move per keypress
  switch (event.code) {
    case 'ArrowRight':
      return { ...currentCoordinates, x: currentCoordinates.x + delta };
    case 'ArrowLeft':
      return { ...currentCoordinates, x: currentCoordinates.x - delta };
    case 'ArrowDown':
      return { ...currentCoordinates, y: currentCoordinates.y + delta };
    case 'ArrowUp':
      return { ...currentCoordinates, y: currentCoordinates.y - delta };
  }
  return undefined;
};
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
import LoadingSpinner from '../shared/LoadingSpinner';
import { prefetchStudyMode, prefetchGameFeatures } from '../../utils/prefetch';
import { useDeviceInfo } from '../../mobile/hooks/useDeviceInfo';
import { useGameLifecycleStore } from '@/stores/gameLifecycleStore';
import { useCountyPlacementStore } from '@/stores/countyPlacementStore';
import { CountyPiece } from '@/types';
import { allCaliforniaCounties, County } from '@/data/californiaCountiesComplete';

// Lazy load heavy components
const EnhancedStudyMode = lazy(() => import('../study/EnhancedStudyMode'));

export default function GameContainer() {
  // Game lifecycle state (replaces isGameStarted, isGameComplete, startGame)
  const { isGameActive: isGameStarted, startGame } = useGameLifecycleStore();

  // County placement state (replaces counties, placedCounties, currentCounty)
  const {
    placedCounties: placedCountiesArray,
    remainingCounties,
    setCurrentHint,
    setRemainingCounties,
  } = useCountyPlacementStore();

  // Convert arrays to the format expected by the component
  const counties: County[] = allCaliforniaCounties;
  const placedCounties = new Set(placedCountiesArray.map((c) => c.id));
  const [currentCounty, setCurrentCounty] = useState<County | null>(null);

  // Derived state: check if game is complete
  const isGameComplete = placedCounties.size === counties.length && counties.length > 0;

  const [isDragging, setIsDragging] = useState(false);
  const [activeCounty, setActiveCounty] = useState<Record<string, unknown> | null>(null);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const sound = useSoundEffect();
  const deviceInfo = useDeviceInfo();

  // Actions that replace context methods
  const selectCounty = (county: County) => {
    setCurrentCounty(county);
    setCurrentHint({ id: county.id, name: county.name, region: county.region });
  };

  const clearCurrentCounty = () => {
    setCurrentCounty(null);
    setCurrentHint(undefined);
  };

  const placeCounty = (countyId: string, _isCorrect: boolean) => {
    const county = counties.find((c) => c.id === countyId);
    if (!county) return;

    // Mark county as placed - simplified since we're tracking by ID
    // The actual placement logic is handled by the drag-and-drop system
    // For now, just clear the current county selection
    clearCurrentCounty();
  };

  // Initialize remaining counties when game starts
  useEffect(() => {
    if (isGameStarted && remainingCounties.length === 0 && placedCountiesArray.length === 0) {
      // Convert County[] to CountyPiece[] format expected by store
      // Note: fips, geometry, centroid are only needed for map rendering, not for tray display
      const countyPieces = counties.map((county, index) => ({
        ...county,
        // Required by CountyPiece interface but not used by CountyTray
        fips: county.id,
        geometry: { type: 'Point' as const, coordinates: [0, 0] },
        centroid: [0, 0] as [number, number],
        // CountyPiece display properties
        isPlaced: false,
        currentPosition: { x: 0, y: 0 },
        targetPosition: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        zIndex: index,
      })) as unknown as CountyPiece[];
      setRemainingCounties(countyPieces);
    }
  }, [
    isGameStarted,
    remainingCounties.length,
    placedCountiesArray.length,
    counties,
    setRemainingCounties,
  ]);

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

  // Use touch, pointer, and keyboard sensors for full accessibility (WCAG 2.1.1)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Small distance to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Delay for touch to prevent accidental drags
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: customKeyboardCoordinates, // Use custom for map drag (not sortable)
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

  // Handle mobile tap-to-place functionality
  const handleMobilePlacement = (targetCountyId: string) => {
    if (!currentCounty) return;

    const isCorrect = currentCounty.id === targetCountyId;

    if (isCorrect) {
      sound.playSound('correct', 0.7);
    } else {
      sound.playSound('incorrect', 0.5);
    }

    // Place the county
    placeCounty(currentCounty.id, isCorrect);
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
                <Button variant="primary" size="large" onClick={() => startGame()}>
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
        {(deviceInfo.isMobile || deviceInfo.isTablet) && <MobileGameInstructions />}

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <div
            className={`
            ${
              deviceInfo.isMobile || deviceInfo.isTablet
                ? 'flex flex-col gap-2'
                : 'flex flex-col lg:grid lg:grid-cols-4 gap-3 lg:gap-4'
            } mt-2
          `}
          >
            {/* County Tray - Optimized for mobile scrolling */}
            <div
              className={`
              ${
                deviceInfo.isMobile || deviceInfo.isTablet
                  ? 'order-2'
                  : 'lg:col-span-1 order-2 lg:order-1'
              }
            `}
            >
              <CountyTray />
            </div>

            {/* Map - Larger on mobile for better gameplay */}
            <div
              className={`
              ${
                deviceInfo.isMobile || deviceInfo.isTablet
                  ? 'order-1'
                  : 'lg:col-span-3 order-1 lg:order-2'
              }
            `}
            >
              <div
                className={`
                bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg
                p-3 lg:p-4 border border-gray-100 dark:border-gray-800
                ${deviceInfo.isMobile || deviceInfo.isTablet ? 'h-[40vh]' : 'h-[55vh] lg:h-[520px]'}
              `}
              >
                <MapErrorBoundary>
                  <CaliforniaMapSimple
                    isDragging={isDragging}
                    onMobilePlacement={handleMobilePlacement}
                  />
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
                  {activeCounty.name as string}
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
