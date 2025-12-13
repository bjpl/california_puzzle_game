import React, { useState } from 'react';
import { Shield, Lock, X } from 'lucide-react';

interface SecurityBadgeProps {
  /**
   * Optional click handler to show detailed security information
   */
  onClick?: () => void;
  /**
   * Whether to show the pulse animation
   * @default true
   */
  showPulse?: boolean;
  /**
   * Size variant of the badge
   * @default 'sm'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Position of the tooltip
   * @default 'top'
   */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * SecurityBadge - A badge component displaying security features and encryption status
 *
 * Features:
 * - Shield icon with lock symbol
 * - Hover tooltip with security details
 * - Optional click handler for detailed modal
 * - Responsive design with pulse animation
 * - Accessible with proper ARIA labels
 * - Dark mode support
 */
export const SecurityBadge: React.FC<SecurityBadgeProps> = ({
  onClick,
  showPulse = true,
  size = 'sm',
  tooltipPosition = 'top',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowModal(true);
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const tooltipPositionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const tooltipArrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right:
      'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className={`
            ${sizeClasses[size]}
            inline-flex items-center gap-1.5 rounded-full
            bg-gradient-to-r from-green-500/10 to-blue-500/10
            dark:from-green-400/20 dark:to-blue-400/20
            border border-green-500/20 dark:border-green-400/30
            text-green-700 dark:text-green-300
            hover:from-green-500/20 hover:to-blue-500/20
            dark:hover:from-green-400/30 dark:hover:to-blue-400/30
            transition-all duration-300 ease-in-out
            cursor-pointer group
            focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2
            dark:focus:ring-green-400/50 dark:focus:ring-offset-gray-900
            ${showPulse ? 'animate-pulse-subtle' : ''}
          `}
          aria-label="Security information"
          aria-describedby="security-tooltip"
        >
          <div className="relative">
            <Shield
              size={iconSizes[size]}
              className="text-green-600 dark:text-green-400 transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
            <Lock
              size={iconSizes[size] * 0.6}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-700 dark:text-green-300"
              aria-hidden="true"
            />
          </div>
          <span className="font-medium whitespace-nowrap">Secured with E2E Encryption</span>
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div
            id="security-tooltip"
            role="tooltip"
            className={`
              absolute z-50 w-64 p-3 rounded-lg shadow-lg
              bg-gray-900 dark:bg-gray-800 text-white
              border border-gray-700 dark:border-gray-600
              ${tooltipPositionClasses[tooltipPosition]}
              animate-fade-in
            `}
          >
            {/* Tooltip Arrow */}
            <div
              className={`
                absolute w-0 h-0 border-8
                border-gray-900 dark:border-gray-800
                ${tooltipArrowClasses[tooltipPosition]}
              `}
            />

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Shield size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Your data is encrypted using AES-256</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Anonymous authentication for privacy</span>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>No personal data collected</span>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                  />
                </svg>
                <span>Local-first data storage</span>
              </div>
              <div className="pt-2 mt-2 border-t border-gray-700 dark:border-gray-600 text-xs text-gray-400">
                Click for detailed security information
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Security Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="security-modal-title"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Shield size={32} className="text-green-600 dark:text-green-400" />
                  <Lock
                    size={20}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-700 dark:text-green-300"
                  />
                </div>
                <h2
                  id="security-modal-title"
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  Security & Privacy
                </h2>
              </div>

              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
                    <Shield size={18} />
                    End-to-End Encryption (AES-256)
                  </h3>
                  <p className="text-sm">
                    Your game data is encrypted using industry-standard AES-256 encryption before
                    being stored. Only you can decrypt and access your data.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Lock size={18} />
                    Anonymous Authentication
                  </h3>
                  <p className="text-sm">
                    We use Supabase anonymous authentication. No email, phone number, or personal
                    information is required. Your identity is protected at all times.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                    Zero Personal Data Collection
                  </h3>
                  <p className="text-sm">
                    We do not collect, store, or share any personal information. Only your game
                    progress and puzzle solutions are saved, all encrypted and anonymized.
                  </p>
                </div>

                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
                    Local-First Architecture
                  </h3>
                  <p className="text-sm">
                    Data is stored locally on your device first, then optionally synced to the
                    cloud. You remain in control of your data at all times.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Your privacy and security are our top priorities. We are committed to protecting
                  your data and maintaining your trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};
