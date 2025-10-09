/**
 * Theme Toggle Component
 *
 * Purpose: Toggle button to switch between light/dark/system themes
 * Features: Animated icons, dropdown menu with all theme options, keyboard accessible
 *
 * Usage:
 *   <ThemeToggle />
 *
 * Last updated: 2025-10-09
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, type ThemeMode } from '@/stores/themeStore';
import { Moon, Sun, Monitor } from 'lucide-react';

export interface ThemeToggleProps {
  /** Show label text next to icon */
  showLabel?: boolean;

  /** Button size variant */
  size?: 'small' | 'medium' | 'large';

  /** Custom className */
  className?: string;
}

/**
 * Theme Toggle Button with Dropdown
 *
 * CONCEPT: Multi-mode theme switcher with visual feedback
 * WHY: Users need to choose light, dark, or auto (system) theme
 * PATTERN: Button + dropdown menu with current state indicator
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  size = 'medium',
  className = '',
}) => {
  const { mode, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Size classes
  const sizeClasses = {
    small: 'p-1.5',
    medium: 'p-2',
    large: 'p-3',
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  // Get current theme icon
  const getIcon = () => {
    if (resolvedTheme === 'dark') {
      return <Moon className={iconSizeClasses[size]} />;
    }
    return <Sun className={iconSizeClasses[size]} />;
  };

  // Theme options
  const themeOptions: Array<{ mode: ThemeMode; label: string; icon: React.ReactNode }> = [
    { mode: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { mode: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { mode: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ];

  const handleThemeChange = (newMode: ThemeMode) => {
    setTheme(newMode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]}
          rounded-xl
          transition-all
          duration-200
          flex
          items-center
          gap-2
          bg-gray-100 dark:bg-gray-800
          text-gray-700 dark:text-gray-300
          hover:bg-gray-200 dark:hover:bg-gray-700
          hover:scale-105
          active:scale-95
          shadow-sm
          hover:shadow-md
        `}
        title={`Current theme: ${mode} (${resolvedTheme})`}
        aria-label={`Toggle theme menu. Current theme: ${mode}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {getIcon()}
        {showLabel && <span className="text-sm font-medium capitalize">{mode}</span>}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute
            right-0
            top-full
            mt-2
            w-40
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-xl
            shadow-xl
            overflow-hidden
            z-50
            animate-in
            fade-in-0
            zoom-in-95
            duration-200
          "
          role="menu"
          aria-label="Theme options"
        >
          {themeOptions.map((option) => (
            <button
              key={option.mode}
              onClick={() => handleThemeChange(option.mode)}
              className={`
                w-full
                px-4
                py-3
                flex
                items-center
                gap-3
                text-sm
                transition-colors
                ${
                  mode === option.mode
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
              role="menuitem"
              aria-label={`Switch to ${option.label} theme`}
            >
              <span
                className={
                  mode === option.mode
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }
              >
                {option.icon}
              </span>
              <span>{option.label}</span>
              {mode === option.mode && (
                <svg
                  className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Simple Theme Toggle (just toggles, no dropdown)
 *
 * CONCEPT: Quick toggle between light/dark
 * WHY: Simpler UI for users who don't use system mode
 * PATTERN: Click to toggle, shows current state
 */
export const SimpleThemeToggle: React.FC<Omit<ThemeToggleProps, 'showLabel'>> = ({
  size = 'medium',
  className = '',
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  const sizeClasses = {
    small: 'p-1.5',
    medium: 'p-2',
    large: 'p-3',
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        ${className}
        rounded-xl
        transition-all
        duration-200
        bg-gray-100 dark:bg-gray-800
        text-gray-700 dark:text-gray-300
        hover:bg-gray-200 dark:hover:bg-gray-700
        hover:scale-105
        active:scale-95
        shadow-sm
        hover:shadow-md
      `}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label={`Toggle theme to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Moon className={iconSizeClasses[size]} />
      ) : (
        <Sun className={iconSizeClasses[size]} />
      )}
    </button>
  );
};

export default ThemeToggle;
