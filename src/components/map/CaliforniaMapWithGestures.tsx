import { useState } from 'react';
// Migrated from monolithic gameStore to domain stores
import { useGestureStore } from '../../stores/gestureStore';
import { useGestureRecognition, GestureType, type GestureConfig } from '../../hooks/useGestureRecognition';
import GestureSettings from '../game/GestureSettings';
import CaliforniaMapSimple from './CaliforniaMapSimple';

const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  enableRotation: true,
  enablePinchZoom: true,
  enableThreeFingerSwipe: true,
  enableDoubleTap: true,
  enableLongPress: true,
  minScale: 1,
  maxScale: 3,
  doubleTapDelay: 300,
  longPressDelay: 500,
  rotationThreshold: 5,
  pinchThreshold: 0.05,
};

interface CaliforniaMapWithGesturesProps {
  isDragging: boolean;
}

export default function CaliforniaMapWithGestures({ isDragging }: CaliforniaMapWithGesturesProps) {
  const {
    gestureState,
    setMapRotation,
    setMapZoom,
    setMapPan,
    resetGestureState,
    updateGestureState,
  } = useGestureStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showResetNotification, setShowResetNotification] = useState(false);

  // Load gesture preferences from Zustand persist store
  const { gesturePreferences = {}, helpSeen, setHelpSeen } = useGestureStore();

  // Gesture callbacks
  const { handlers, gestureState: currentGesture, updateConfig } = useGestureRecognition(
    {
      onPinch: (scale, _center) => {
        // Smooth zoom scaling
        const newZoom = Math.max(1, Math.min(3, scale));
        setMapZoom(newZoom);
      },

      onRotate: (rotation, _center) => {
        // Update map rotation
        setMapRotation(rotation);
      },

      onPan: (delta) => {
        // Update pan position
        const newPan = {
          x: gestureState.pan.x + delta.x,
          y: gestureState.pan.y + delta.y,
        };
        setMapPan(newPan);
      },

      onThreeFingerSwipe: (direction) => {
        // Three-finger swipe resets the game
        if (direction === 'down' || direction === 'up') {
          resetGestureState();
          setShowResetNotification(true);
          setTimeout(() => setShowResetNotification(false), 2000);
        }
      },

      onDoubleTap: (position) => {
        // Double-tap to toggle zoom between 1x and 2x
        const targetZoom = gestureState.zoom === 1 ? 2 : 1;
        setMapZoom(targetZoom);

        // Center zoom on tap position
        if (targetZoom > 1) {
          const centerOffset = {
            x: (400 - position.x) * 0.5,
            y: (300 - position.y) * 0.5,
          };
          setMapPan(centerOffset);
        } else {
          setMapPan({ x: 0, y: 0 });
        }
      },

      onLongPress: (_position) => {
        // Long press shows gesture settings
        setShowSettings(true);
      },

      onGestureStart: (_type) => {
        // Gesture started
      },

      onGestureEnd: (_type) => {
        // Gesture ended
      },
    },
    gesturePreferences ?? undefined
  );

  // Handle settings change
  const handleConfigChange = (config: Partial<import('../../hooks/useGestureRecognition').GestureConfig>) => {
    updateConfig(config);
    updateGestureState({ gestureEnabled: true });
  };

  return (
    <div className="relative w-full h-full" {...handlers}>
      {/* Map Container with transform applied */}
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={{
          transform: `
            translate(${gestureState.pan.x}px, ${gestureState.pan.y}px)
            scale(${gestureState.zoom})
            rotate(${gestureState.rotation}deg)
          `,
          transformOrigin: 'center center',
        }}
      >
        <CaliforniaMapSimple isDragging={isDragging} />
      </div>

      {/* Gesture Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
        {/* Rotation Reset Button */}
        {gestureState.rotation !== 0 && (
          <button
            onClick={() => setMapRotation(0)}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Reset Rotation"
            aria-label="Reset map rotation"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="sr-only">Reset rotation</span>
          </button>
        )}

        {/* Zoom Level Indicator */}
        {gestureState.zoom !== 1 && (
          <div className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-sm font-medium text-gray-700 dark:text-gray-300">
            {gestureState.zoom.toFixed(1)}x
          </div>
        )}

        {/* Reset All Button */}
        {(gestureState.rotation !== 0 || gestureState.zoom !== 1 || gestureState.pan.x !== 0 || gestureState.pan.y !== 0) && (
          <button
            onClick={() => resetGestureState()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            title="Reset View"
            aria-label="Reset all map transformations"
          >
            Reset View
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Gesture Settings"
          aria-label="Open gesture settings"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Gesture Indicator (shows active gesture type) */}
      {currentGesture.activeGesture !== GestureType.NONE && currentGesture.activeGesture !== GestureType.DRAG && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black bg-opacity-75 text-white rounded-lg text-sm font-medium z-10">
          {currentGesture.activeGesture === GestureType.PINCH && 'Pinch to Zoom'}
          {currentGesture.activeGesture === GestureType.ROTATE && 'Rotating Map'}
          {currentGesture.activeGesture === GestureType.THREE_FINGER_SWIPE && 'Three-Finger Swipe'}
          {currentGesture.activeGesture === GestureType.DOUBLE_TAP && 'Double Tap'}
          {currentGesture.activeGesture === GestureType.LONG_PRESS && 'Long Press'}
        </div>
      )}

      {/* Reset Notification */}
      {showResetNotification && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-4 bg-green-600 text-white rounded-lg shadow-xl text-center z-20 animate-fade-in-out">
          <div className="text-lg font-bold mb-1">View Reset</div>
          <div className="text-sm">Map returned to default position</div>
        </div>
      )}

      {/* Gesture Help Overlay (shows on first use) */}
      {!helpSeen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md p-6 m-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Gesture Controls
            </h3>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🤏</span>
                <div>
                  <div className="font-semibold">Pinch to Zoom</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Pinch with two fingers to zoom in/out
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <div className="font-semibold">Two-Finger Rotate</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Twist two fingers to rotate the map
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">👆👆</span>
                <div>
                  <div className="font-semibold">Double-Tap</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Quick zoom to 2x
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">👆👆👆</span>
                <div>
                  <div className="font-semibold">Three-Finger Swipe</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Swipe down to reset view
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <div className="font-semibold">Long Press</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Open gesture settings
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setHelpSeen(true);
                setShowResetNotification(false);
              }}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Gesture Settings Modal */}
      <GestureSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentConfig={{ ...DEFAULT_GESTURE_CONFIG, ...gesturePreferences }}
        onConfigChange={handleConfigChange}
      />

      {/* CSS for animations */}
      <style>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
