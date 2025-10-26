import { useEffect, useState, memo } from 'react';
import { geographicHints, getCountyCharacteristics } from '../../../data/californiaGeographicHints';
import { County } from '@/types';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  county: County | null;
  hintLevel: number;
}

function HintModal({ isOpen, onClose, county, hintLevel }: HintModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay content to create smooth animation
      setTimeout(() => setShowContent(true), 50);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen || !county) {
    return null;
  }

  const hints = geographicHints[county.name];
  const characteristics = getCountyCharacteristics(county.name);

  const getHintContent = () => {
    // If no hints found for this county, show a generic message
    if (!hints) {
      return (
        <>
          <div className="text-6xl mb-4 animate-bounce">🗺️</div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-500 bg-clip-text text-transparent">
            {county.name} County
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Looking for {county.name}?
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Region: {county.region || 'California'}
              </p>
              {county.capital && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  County Seat: {county.capital}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                💡 Try looking in the {county.region || 'California'} region
              </p>
            </div>
          </div>
        </>
      );
    }

    // Progressive hints based on level
    if (hintLevel === 1) {
      // Level 1: General characteristics and region

      // Special case for coastal counties
      if (characteristics.isCoastal) {
        return (
          <>
            <div className="text-6xl mb-4 animate-bounce">🌊</div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Hint Level 1: Coastal County
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  {county.name} is a coastal county
                </p>
                {hints?.position && (
                  <p className="text-blue-700 dark:text-blue-300 mb-2">📍 {hints.position}</p>
                )}
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  Look along California's coastline
                </p>
              </div>
            </div>
          </>
        );
      }

      // For border counties
      if (characteristics.isBorder) {
        return (
          <>
            <div className="text-6xl mb-4 animate-pulse">🗺️</div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent">
              Hint Level 1: Border County
            </h3>
            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-l-4 border-orange-400 dark:border-orange-700">
                <p className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  {county.name} borders {characteristics.borderLocation}
                </p>
                {hints?.landmark && (
                  <p className="text-orange-700 dark:text-orange-300 mb-2">
                    🏛️ Known for: {hints.landmark}
                  </p>
                )}
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                  Search along the {characteristics.borderLocation} border
                </p>
              </div>
            </div>
          </>
        );
      }

      // For small counties
      if (characteristics.isSmall) {
        return (
          <>
            <div className="text-6xl mb-4 animate-bounce">🔍</div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Hint Level 1: Small County
            </h3>
            <div className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  {county.name} is one of California's smaller counties
                </p>
                {hints?.position && (
                  <p className="text-purple-700 dark:text-purple-300 mb-2">📍 {hints.position}</p>
                )}
                <div className="bg-purple-100 dark:bg-purple-800/30 rounded p-2 mt-2">
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    💡 Region: {county.region}
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      }

      // For large counties
      if (characteristics.isLarge) {
        return (
          <>
            <div className="text-6xl mb-4 animate-pulse">🗾</div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-400 dark:to-teal-400 bg-clip-text text-transparent">
              Hint Level 1: Large County
            </h3>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  {county.name} is one of California's largest counties
                </p>
                {hints?.size && (
                  <p className="text-green-700 dark:text-green-300 mb-2">🔍 {hints.size}</p>
                )}
                {hints?.position && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    📍 {hints.position}
                  </p>
                )}
              </div>
            </div>
          </>
        );
      }

      // Default hint for other counties
      return (
        <>
          <div className="text-6xl mb-4 animate-bounce">📍</div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
            Hint Level 1: Location Clue
          </h3>
          <div className="space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
              <p className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                {county.name} County
              </p>
              <p className="text-indigo-700 dark:text-indigo-300 mb-2">
                🏛️ Region: {county.region}
              </p>
              {hints?.position && (
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">
                  📍 {hints.position}
                </p>
              )}
            </div>
          </div>
        </>
      );
    }

    if (hintLevel === 2) {
      // Level 2: Neighboring counties and landmarks
      return (
        <>
          <div className="text-6xl mb-4 animate-pulse">🧭</div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
            Hint Level 2: Neighbors & Landmarks
          </h3>
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-2 border-yellow-300 dark:border-yellow-700">
              <p className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
                {county.name} County Details
              </p>

              {hints?.neighbors && hints.neighbors.length > 0 && (
                <div className="mb-3">
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                    Neighboring Counties:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hints.neighbors.map((neighbor) => (
                      <span
                        key={neighbor}
                        className="bg-yellow-200 dark:bg-yellow-800/50 px-2 py-1 rounded text-sm text-yellow-900 dark:text-yellow-100"
                      >
                        {neighbor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hints?.landmark && (
                <div className="bg-yellow-100 dark:bg-yellow-800/30 rounded p-2 mt-2">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    🏛️ Famous for: {hints.landmark}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      );
    }

    if (hintLevel === 3) {
      // Level 3: Exact position and shape description
      return (
        <>
          <div className="text-6xl mb-4 animate-bounce">🎯</div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-400 dark:to-pink-400 bg-clip-text text-transparent">
            Hint Level 3: Exact Location
          </h3>
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-2 border-red-300 dark:border-red-700">
              <p className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">
                {county.name} County - Final Hint
              </p>

              {hints?.position && (
                <div className="bg-red-100 dark:bg-red-800/30 rounded p-3 mb-3">
                  <p className="text-red-800 dark:text-red-200 font-medium">📍 Exact Position:</p>
                  <p className="text-red-700 dark:text-red-300">{hints.position}</p>
                </div>
              )}

              {hints?.size && (
                <p className="text-red-700 dark:text-red-300 mb-2">📏 Size/Shape: {hints.size}</p>
              )}

              {hints?.landmark && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                  🎯 Look for: {hints.landmark}
                </p>
              )}

              <div className="bg-red-200 dark:bg-red-800/50 rounded p-2 mt-3">
                <p className="text-xs text-red-800 dark:text-red-200">
                  💡 This county is in the {county.region} region
                </p>
              </div>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black dark:bg-black transition-opacity z-[9998] ${
          showContent ? 'bg-opacity-50 dark:bg-opacity-70' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
        <div
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all pointer-events-auto border border-gray-100 dark:border-gray-800 ${
            showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
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

          {/* Content */}
          {getHintContent()}

          {/* Footer */}
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Hint {hintLevel} of 3</p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all transform hover:scale-105"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(HintModal, (prevProps, nextProps) => {
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.hintLevel === nextProps.hintLevel &&
    prevProps.county?.name === nextProps.county?.name
  );
});
