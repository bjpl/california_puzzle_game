import React from 'react';
import { Volume2, VolumeX, Music, Gamepad2, Trophy, MousePointer } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { CaliforniaButton } from './CaliforniaButton';

interface SoundSettingsProps {
  className?: string;
  onClose?: () => void;
}

export const SoundSettings: React.FC<SoundSettingsProps> = ({ className, onClose }) => {
  const {
    settings,
    updateSoundSettings,
    toggleMute,
    startBackgroundMusic,
    stopBackgroundMusic
  } = useGameStore();

  const { soundSettings } = settings;

  const handleVolumeChange = (type: 'masterVolume' | 'effectsVolume' | 'musicVolume', value: number) => {
    updateSoundSettings({ [type]: value });
  };

  const handleToggle = (setting: keyof typeof soundSettings) => {
    const newValue = !soundSettings[setting];
    updateSoundSettings({ [setting]: newValue });

    // Handle background music toggle
    if (setting === 'enableBackgroundMusic') {
      if (newValue && !soundSettings.muted) {
        startBackgroundMusic();
      } else {
        stopBackgroundMusic();
      }
    }
  };

  const VolumeSlider: React.FC<{
    label: string;
    icon: React.ReactNode;
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
  }> = ({ label, icon, value, onChange, disabled = false }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        <span>{label}</span>
        <span className="ml-auto text-gray-500">{Math.round(value * 100)}%</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled || soundSettings.muted}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
            disabled || soundSettings.muted
              ? 'bg-gray-200'
              : 'bg-gradient-to-r from-ca-ocean-200 to-ca-tech-400'
          } slider`}
          style={{
            background: disabled || soundSettings.muted
              ? '#e5e7eb'
              : `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${value * 100}%, #e5e7eb ${value * 100}%, #e5e7eb 100%)`
          }}
        />
      </div>
    </div>
  );

  const ToggleOption: React.FC<{
    label: string;
    icon: React.ReactNode;
    description: string;
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
  }> = ({ label, icon, description, checked, onChange, disabled = false }) => (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${
      disabled ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-ca-ocean-300'
    } transition-colors`}>
      <div className="flex-shrink-0 mt-0.5 text-ca-ocean-600">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
            {label}
          </h4>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={onChange}
              disabled={disabled}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${
              disabled
                ? 'bg-gray-200'
                : checked
                  ? 'bg-ca-tech-500'
                  : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                checked ? 'translate-x-5' : 'translate-x-0'
              } mt-0.5 ml-0.5`} />
            </div>
          </label>
        </div>
        <p className={`text-sm mt-1 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 max-w-md w-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Sound Settings</h3>
        {onClose && (
          <CaliforniaButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            enableSounds={false}
          >
            ✕
          </CaliforniaButton>
        )}
      </div>

      {/* Master Mute Toggle */}
      <div className="mb-6">
        <CaliforniaButton
          variant={soundSettings.muted ? "outline" : "primary"}
          onClick={toggleMute}
          className="w-full"
          icon={soundSettings.muted ? VolumeX : Volume2}
          enableSounds={false}
        >
          {soundSettings.muted ? 'Unmute All Sounds' : 'Mute All Sounds'}
        </CaliforniaButton>
      </div>

      {/* Volume Controls */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Volume Controls
        </h4>

        <VolumeSlider
          label="Master Volume"
          icon={<Volume2 className="w-4 h-4" />}
          value={soundSettings.masterVolume}
          onChange={(value) => handleVolumeChange('masterVolume', value)}
        />

        <VolumeSlider
          label="Game Effects"
          icon={<Gamepad2 className="w-4 h-4" />}
          value={soundSettings.effectsVolume}
          onChange={(value) => handleVolumeChange('effectsVolume', value)}
        />

        <VolumeSlider
          label="Background Music"
          icon={<Music className="w-4 h-4" />}
          value={soundSettings.musicVolume}
          onChange={(value) => handleVolumeChange('musicVolume', value)}
        />
      </div>

      {/* Sound Categories */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Sound Categories
        </h4>

        <ToggleOption
          label="Background Music"
          icon={<Music className="w-5 h-5" />}
          description="Ambient music during gameplay"
          checked={soundSettings.enableBackgroundMusic}
          onChange={() => handleToggle('enableBackgroundMusic')}
          disabled={soundSettings.muted}
        />

        <ToggleOption
          label="Game Sounds"
          icon={<Gamepad2 className="w-5 h-5" />}
          description="Pickup, placement, and feedback sounds"
          checked={soundSettings.enableGameSounds}
          onChange={() => handleToggle('enableGameSounds')}
          disabled={soundSettings.muted}
        />

        <ToggleOption
          label="UI Sounds"
          icon={<MousePointer className="w-5 h-5" />}
          description="Button clicks and hover effects"
          checked={soundSettings.enableClickSounds}
          onChange={() => handleToggle('enableClickSounds')}
          disabled={soundSettings.muted}
        />

        <ToggleOption
          label="Achievement Sounds"
          icon={<Trophy className="w-5 h-5" />}
          description="Sounds when unlocking achievements"
          checked={soundSettings.enableAchievementSounds}
          onChange={() => handleToggle('enableAchievementSounds')}
          disabled={soundSettings.muted}
        />
      </div>

      {/* Sound File Status */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Audio Status</h5>
        <p className="text-xs text-gray-600">
          The game includes placeholder tones that work without external sound files.
          For enhanced audio experience, place MP3 files in the <code className="bg-gray-200 px-1 rounded">public/sounds/</code> directory.
        </p>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #1e40af;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #1e40af;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider:disabled::-webkit-slider-thumb {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .slider:disabled::-moz-range-thumb {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default SoundSettings;