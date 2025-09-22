import { useEffect, useState } from 'react';
import { geographicHints, getCountyCharacteristics } from '../data/californiaGeographicHints';
import { County } from '../data/californiaCounties';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  county: County | null;
  hintLevel: number;
}

export default function HintModal({ isOpen, onClose, county, hintLevel }: HintModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay content to create smooth animation
      setTimeout(() => setShowContent(true), 50);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen || !county) return null;

  // Debug: Log county info to see what we're working with
  console.log('HintModal - County:', county);
  console.log('HintModal - County name:', county.name);
  console.log('HintModal - Hint level:', hintLevel);

  const hints = geographicHints[county.name];
  const characteristics = getCountyCharacteristics(county.name);

  console.log('HintModal - Found hints:', hints);
  console.log('HintModal - Characteristics:', characteristics);

  const getHintContent = () => {
    // If no hints found for this county, show a generic message
    if (!hints) {
      return (
        <>
          <div className="text-6xl mb-4 animate-bounce">🗺️</div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-gray-500 to-gray-600 bg-clip-text text-transparent">
            {county.name} County
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Looking for {county.name}?
              </p>
              <p className="text-gray-700 mb-2">
                Region: {county.region || 'California'}
              </p>
              {county.capital && (
                <p className="text-gray-600 text-sm mt-2">
                  County Seat: {county.capital}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-3">
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
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Hint Level 1: Coastal County
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
                <p className="text-lg font-semibold text-blue-900 mb-2">
                  {county.name} is a coastal county
                </p>
                {hints?.position && (
                  <p className="text-blue-700 mb-2">
                    📍 {hints.position}
                  </p>
                )}
                <p className="text-sm text-blue-600 mt-2">
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
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Hint Level 1: Border County
            </h3>
            <div className="space-y-4">
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
                <p className="text-lg font-semibold text-orange-900 mb-2">
                  {county.name} borders {characteristics.borderLocation}
                </p>
                {hints?.landmark && (
                  <p className="text-orange-700 mb-2">
                    🏛️ Known for: {hints.landmark}
                  </p>
                )}
                <p className="text-sm text-orange-600 mt-2">
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
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Hint Level 1: Small County
            </h3>
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-lg font-semibold text-purple-900 mb-2">
                  {county.name} is one of California's smaller counties
                </p>
                {hints?.position && (
                  <p className="text-purple-700 mb-2">
                    📍 {hints.position}
                  </p>
                )}
                <div className="bg-purple-100 rounded p-2 mt-2">
                  <p className="text-sm text-purple-800">
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
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
              Hint Level 1: Large County
            </h3>
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-lg font-semibold text-green-900 mb-2">
                  {county.name} is one of California's largest counties
                </p>
                {hints?.size && (
                  <p className="text-green-700 mb-2">
                    🔍 {hints.size}
                  </p>
                )}
                {hints?.position && (
                  <p className="text-sm text-green-600 mt-2">
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
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
            Hint Level 1: Location Clue
          </h3>
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-lg font-semibold text-indigo-900 mb-2">
                {county.name} County
              </p>
              <p className="text-indigo-700 mb-2">
                🏛️ Region: {county.region}
              </p>
              {hints?.position && (
                <p className="text-sm text-indigo-600 mt-2">
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
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            Hint Level 2: Neighbors & Landmarks
          </h3>
          <div className="space-y-4">
            <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300">
              <p className="text-lg font-semibold text-yellow-900 mb-3">
                {county.name} County Details
              </p>

              {hints?.neighbors && hints.neighbors.length > 0 && (
                <div className="mb-3">
                  <p className="text-yellow-800 font-medium mb-1">Neighboring Counties:</p>
                  <div className="flex flex-wrap gap-2">
                    {hints.neighbors.map(neighbor => (
                      <span key={neighbor} className="bg-yellow-200 px-2 py-1 rounded text-sm text-yellow-900">
                        {neighbor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hints?.landmark && (
                <div className="bg-yellow-100 rounded p-2 mt-2">
                  <p className="text-sm text-yellow-800">
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
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Hint Level 3: Exact Location
          </h3>
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4 border-2 border-red-300">
              <p className="text-lg font-semibold text-red-900 mb-3">
                {county.name} County - Final Hint
              </p>

              {hints?.position && (
                <div className="bg-red-100 rounded p-3 mb-3">
                  <p className="text-red-800 font-medium">
                    📍 Exact Position:
                  </p>
                  <p className="text-red-700">
                    {hints.position}
                  </p>
                </div>
              )}

              {hints?.size && (
                <p className="text-red-700 mb-2">
                  📏 Size/Shape: {hints.size}
                </p>
              )}

              {hints?.landmark && (
                <p className="text-red-600 text-sm mt-2">
                  🎯 Look for: {hints.landmark}
                </p>
              )}

              <div className="bg-red-200 rounded p-2 mt-3">
                <p className="text-xs text-red-800">
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
        className={`fixed inset-0 bg-black transition-opacity z-[9998] ${
          showContent ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
        <div
          className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all pointer-events-auto ${
            showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          {getHintContent()}

          {/* Footer */}
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Hint {hintLevel} of 3
            </p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all transform hover:scale-105"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  );
}