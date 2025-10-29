import React from 'react';
import CountyFormationAnimation from '../../../county/CountyFormationAnimation';

interface FormationModeProps {
  onClose: () => void;
}

/**
 * Formation Mode - Full Screen Immersive Experience
 *
 * Displays the County Formation Animation with a floating close button.
 * This is the simplest study mode - just wraps CountyFormationAnimation.
 */
const FormationMode: React.FC<FormationModeProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Floating Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all flex items-center gap-2 text-sm font-medium min-h-[44px] active:scale-95"
        aria-label="Return to Menu"
      >
        <span>Return to Menu</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <CountyFormationAnimation />
    </div>
  );
};

export default FormationMode;
