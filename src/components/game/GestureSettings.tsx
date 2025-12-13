import { useState, useEffect } from 'react';
import { GestureConfig } from '../../hooks/useGestureRecognition';
import { useGestureStore } from '../../stores/gestureStore';

interface GestureSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: GestureConfig;
  onConfigChange: (config: Partial<GestureConfig>) => void;
}

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

export default function GestureSettings({
  isOpen,
  onClose,
  currentConfig,
  onConfigChange,
}: GestureSettingsProps) {
  const [localConfig, setLocalConfig] = useState<GestureConfig>(currentConfig);
  const { gesturePreferences, setGesturePreferences, clearGesturePreferences } = useGestureStore();

  useEffect(() => {
    setLocalConfig(currentConfig);
  }, [currentConfig]);

  useEffect(() => {
    // Load saved preferences from Zustand persist store
    if (gesturePreferences) {
      setLocalConfig({ ...DEFAULT_GESTURE_CONFIG, ...gesturePreferences });
    }
  }, [gesturePreferences]);

  const handleChange = (key: keyof GestureConfig, value: boolean | number) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
  };

  const handleSave = () => {
    // Save to Zustand persist store
    setGesturePreferences(localConfig);
    // Apply changes
    onConfigChange(localConfig);
    onClose();
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_GESTURE_CONFIG);
    clearGesturePreferences();
    onConfigChange(DEFAULT_GESTURE_CONFIG);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gesture Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Basic Gestures */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Basic Gestures
            </h3>
            <div className="space-y-3">
              <ToggleSetting
                label="Two-Finger Rotation"
                description="Rotate the map with two fingers"
                enabled={localConfig.enableRotation}
                onChange={(value) => handleChange('enableRotation', value)}
              />
              <ToggleSetting
                label="Pinch to Zoom"
                description="Zoom in and out with pinch gesture"
                enabled={localConfig.enablePinchZoom}
                onChange={(value) => handleChange('enablePinchZoom', value)}
              />
            </div>
          </div>

          {/* Advanced Gestures */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Power User Gestures
            </h3>
            <div className="space-y-3">
              <ToggleSetting
                label="Three-Finger Swipe"
                description="Swipe with three fingers to reset game"
                enabled={localConfig.enableThreeFingerSwipe}
                onChange={(value) => handleChange('enableThreeFingerSwipe', value)}
              />
              <ToggleSetting
                label="Double-Tap"
                description="Double-tap to quick zoom to county"
                enabled={localConfig.enableDoubleTap}
                onChange={(value) => handleChange('enableDoubleTap', value)}
              />
              <ToggleSetting
                label="Long Press"
                description="Long press for county info popup"
                enabled={localConfig.enableLongPress}
                onChange={(value) => handleChange('enableLongPress', value)}
              />
            </div>
          </div>

          {/* Zoom Range */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Zoom Range</h3>
            <div className="space-y-4">
              <RangeSetting
                label="Minimum Zoom"
                value={localConfig.minScale}
                min={0.5}
                max={1.5}
                step={0.1}
                onChange={(value) => handleChange('minScale', value)}
              />
              <RangeSetting
                label="Maximum Zoom"
                value={localConfig.maxScale}
                min={2}
                max={5}
                step={0.25}
                onChange={(value) => handleChange('maxScale', value)}
              />
            </div>
          </div>

          {/* Sensitivity Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Sensitivity
            </h3>
            <div className="space-y-4">
              <RangeSetting
                label="Rotation Threshold"
                description="Lower = more sensitive"
                value={localConfig.rotationThreshold}
                min={1}
                max={15}
                step={1}
                onChange={(value) => handleChange('rotationThreshold', value)}
              />
              <RangeSetting
                label="Long Press Delay (ms)"
                value={localConfig.longPressDelay}
                min={300}
                max={1000}
                step={50}
                onChange={(value) => handleChange('longPressDelay', value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Reset to Defaults
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toggle Setting Component
interface ToggleSettingProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

function ToggleSetting({ label, description, enabled, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900 dark:text-white">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
            transition duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

// Range Setting Component
interface RangeSettingProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function RangeSetting({ label, description, value, min, max, step, onChange }: RangeSettingProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-900 dark:text-white">{label}</label>
        <span className="text-sm text-gray-500 dark:text-gray-400">{value}</span>
      </div>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
