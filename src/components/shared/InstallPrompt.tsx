/**
 * InstallPrompt Component
 *
 * Custom PWA installation prompt with platform-specific UI and instructions.
 * Supports iOS manual instructions and Android/Desktop auto-install.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { Button } from '../ui/Button';
import { logger } from '../../utils/logger';

interface InstallPromptProps {
  /** Whether to show as a banner (default) or modal */
  variant?: 'banner' | 'modal' | 'button';
  /** Custom className */
  className?: string;
  /** Callback when installation succeeds */
  onInstallSuccess?: () => void;
  /** Callback when prompt is dismissed */
  onDismiss?: () => void;
}

/**
 * InstallPrompt Component
 */
export const InstallPrompt: React.FC<InstallPromptProps> = ({
  variant = 'banner',
  className = '',
  onInstallSuccess,
  onDismiss,
}) => {
  const {
    platform,
    canInstall,
    isInstalled,
    isDismissed,
    showInstallPrompt,
    dismissPrompt,
  } = useInstallPrompt();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  /**
   * Handle install click
   */
  const handleInstall = async () => {
    if (platform === 'ios') {
      setShowInstructions(true);
      return;
    }

    const success = await showInstallPrompt();

    if (success) {
      logger.info('Install prompt accepted');
      onInstallSuccess?.();
    }
  };

  /**
   * Handle dismiss
   */
  const handleDismiss = () => {
    dismissPrompt();
    setIsExpanded(false);
    setShowInstructions(false);
    onDismiss?.();
  };

  /**
   * Auto-show on mount if conditions are met
   */
  useEffect(() => {
    if (canInstall && variant === 'banner') {
      const timer = setTimeout(() => setIsExpanded(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, variant]);

  // Don't render if installed or dismissed
  if (isInstalled || isDismissed || !canInstall) {
    return null;
  }

  /**
   * Button-only variant (for menu/header)
   */
  if (variant === 'button') {
    return (
      <button
        onClick={handleInstall}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all ${className}`}
        aria-label="Install app to home screen"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Install App</span>
      </button>
    );
  }

  /**
   * Modal variant
   */
  if (variant === 'modal') {
    return (
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleDismiss}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 ${className}`}
            >
              <InstallPromptContent
                platform={platform}
                showInstructions={showInstructions}
                onInstall={handleInstall}
                onDismiss={handleDismiss}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  /**
   * Banner variant (default)
   */
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 ${className}`}
        >
          <InstallPromptContent
            platform={platform}
            showInstructions={showInstructions}
            onInstall={handleInstall}
            onDismiss={handleDismiss}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Prompt content component
 */
interface InstallPromptContentProps {
  platform: 'ios' | 'android' | 'desktop' | 'unsupported';
  showInstructions: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

const InstallPromptContent: React.FC<InstallPromptContentProps> = ({
  platform,
  showInstructions,
  onInstall,
  onDismiss,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">CA</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Install California Counties
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn on the go, offline support
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Dismiss install prompt"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        <BenefitItem icon="⚡" text="Instant loading" />
        <BenefitItem icon="📴" text="Works offline" />
        <BenefitItem icon="🏠" text="Quick access from home screen" />
        <BenefitItem icon="💾" text="Save progress automatically" />
      </div>

      {/* Platform-specific instructions or install button */}
      {showInstructions && platform === 'ios' ? (
        <IOSInstructions />
      ) : (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="medium"
            fullWidth
            onClick={onInstall}
            className="flex-1"
          >
            {platform === 'ios' ? 'Show Instructions' : 'Install Now'}
          </Button>
          <Button
            variant="ghost"
            size="medium"
            onClick={onDismiss}
          >
            Not Now
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * Benefit item component
 */
const BenefitItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
    <span className="text-lg">{icon}</span>
    <span>{text}</span>
  </div>
);

/**
 * iOS installation instructions
 */
const IOSInstructions: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-3"
  >
    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
      To install on iOS:
    </p>
    <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
      <li className="flex items-start gap-2">
        <span className="flex-shrink-0 w-5 h-5 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
        <span>
          Tap the <strong>Share</strong> button{' '}
          <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          {' '}in the browser toolbar
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="flex-shrink-0 w-5 h-5 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
        <span>
          Scroll and tap <strong>Add to Home Screen</strong>
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="flex-shrink-0 w-5 h-5 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
        <span>
          Tap <strong>Add</strong> in the top right corner
        </span>
      </li>
    </ol>
  </motion.div>
);

export default InstallPrompt;
