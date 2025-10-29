import React, { useEffect } from 'react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
  showDragHandle?: boolean;
  className?: string;
}

/**
 * MobileBottomSheet - A reusable mobile bottom sheet component
 *
 * Features:
 * - Dismissible backdrop overlay
 * - Drag handle indicator
 * - Smooth slide-up animation
 * - Scroll support with max height
 * - Dark mode support
 * - Accessibility features
 */
const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = '80vh',
  showDragHandle = true,
  className = '',
}) => {
  // Prevent body scroll when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay - dismissible */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-white dark:bg-gray-800
          rounded-t-3xl shadow-2xl
          transform transition-transform duration-300 ease-out
          overflow-y-auto
          ${className}
        `}
        style={{ maxHeight }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
      >
        {/* Drag handle */}
        {showDragHandle && (
          <div className="sticky top-0 bg-white dark:bg-gray-800 pt-3 pb-2 flex justify-center border-b border-gray-200 dark:border-gray-700 rounded-t-3xl z-10">
            <div
              className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full cursor-grab active:cursor-grabbing"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Title header */}
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h3
                id="bottom-sheet-title"
                className="font-bold text-lg text-gray-900 dark:text-gray-100"
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close bottom sheet"
              >
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Children content */}
          {children}
        </div>
      </div>
    </>
  );
};

export default MobileBottomSheet;
