import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import CountyShapeDisplay from '../../county/CountyShapeDisplay';
import { County } from '@/types';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { decorativeEmoji } from '../../../utils/accessibility';

interface EducationalContent {
  overview?: string;
  uniqueFeatures?: string;
  historicalContext?: string;
  economicImportance?: string;
  culturalHeritage?: string;
  geographicalSignificance?: string;
  specificData?: {
    historicalEvents?: Array<{ year: number; event: string }>;
    industries?: string[];
    majorAttractions?: string[];
    climate?: string;
    elevation?: string;
  };
  history?: {
    founding?: string;
    keyEvents?: string[];
    historicalFigures?: string[];
    historicalEvents?: Array<{ year: number; event: string }>;
  };
  economy?: {
    industries?: string[];
    majorEmployers?: string[];
    economicFacts?: string[];
  };
  culture?: {
    landmarks?: string[];
    festivals?: string[];
    cuisine?: string[];
  };
  geography?: {
    area?: string;
    terrain?: string;
    climate?: string;
    features?: string[];
  };
}

interface MemoryAid {
  mnemonic?: string;
  visualCue?: string;
  visualCues?: string[];
  associations?: string[];
  locationMnemonic?: string;
  shapeMnemonic?: string;
  rhymes?: string[];
}

interface EducationalContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  county: County;
  educationContent: EducationalContent;
  memoryAid?: MemoryAid;
}

export default function EducationalContentModal({
  isOpen,
  onClose,
  county,
  educationContent,
  memoryAid,
}: EducationalContentModalProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'history' | 'economy' | 'culture' | 'geography' | 'memory'
  >('overview');
  const dialogRef = useRef<HTMLDivElement>(null);

  // Implement focus trap for accessibility (WCAG 2.1.1, 2.4.3)
  useFocusTrap({
    isOpen,
    dialogRef,
    onEscape: onClose,
  });

  useEffect(() => {
    // Reset to overview when county changes
    setActiveTab('overview');
  }, [county?.id]);

  if (!isOpen || !county) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 dark:bg-opacity-70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="educational-modal-title"
        className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-slideInUp"
      >
        {/* Header - Clean solid background */}
        <div className="bg-blue-600 dark:bg-blue-800 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                <CountyShapeDisplay countyId={county.id} size={70} className="" />
              </div>
              <div>
                <h2 id="educational-modal-title" className="text-3xl font-bold text-white">{county.name} County</h2>
                <p className="text-blue-100 dark:text-blue-200 mt-1">
                  Complete Educational Resource
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="bg-blue-500 dark:bg-blue-700 px-3 py-1 rounded-full text-sm">
                    {county.region}
                  </span>
                  {county.population && (
                    <span className="bg-blue-500 dark:bg-blue-700 px-3 py-1 rounded-full text-sm">
                      Pop: {county.population.toLocaleString()}
                    </span>
                  )}
                  {county.area && (
                    <span className="bg-blue-500 dark:bg-blue-700 px-3 py-1 rounded-full text-sm">
                      {county.area.toLocaleString()} sq mi
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 dark:hover:bg-blue-900 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'history', label: 'History', icon: '📜' },
            { id: 'economy', label: 'Economy', icon: '💼' },
            { id: 'culture', label: 'Culture', icon: '🎭' },
            { id: 'geography', label: 'Geography', icon: '🗺️' },
            { id: 'memory', label: 'Memory Aids', icon: '🧠' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-3 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={`${tab.label} tab`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {decorativeEmoji(tab.icon)}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Facts Grid - Using consistent color scheme */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* County Seat - Blue governance theme */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
                    {decorativeEmoji('🏛️')} County Seat
                  </h4>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {county.capital || county.countySeat || 'N/A'}
                  </p>
                </div>

                {/* Established - Warm historical theme */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
                  <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
                    {decorativeEmoji('📅')} Established
                  </h4>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {county.founded || county.established || 'Unknown'}
                  </p>
                </div>

                {/* Known For - Neutral with accent */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
                    {decorativeEmoji('⭐')} Known For
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                    {county.knownFor ||
                      educationContent?.uniqueFeatures ||
                      'Rich history and culture'}
                  </p>
                </div>
              </div>

              {/* Fun Facts - Clean neutral styling */}
              {county.funFacts && county.funFacts.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-lg flex items-center gap-2">
                    <span>✨</span> Interesting Facts
                  </h3>
                  <div className="grid gap-3">
                    {county.funFacts.map((fact: string, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {idx + 1}.
                        </span>
                        <p className="text-gray-700 dark:text-gray-300">{fact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Natural Features & Landmarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {county.naturalFeatures && county.naturalFeatures.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-700">
                    <h4 className="font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                      <span>🏔️</span> Natural Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {county.naturalFeatures.map((feature: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {county.culturalLandmarks && county.culturalLandmarks.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-700">
                    <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                      <span>🏛️</span> Cultural Landmarks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {county.culturalLandmarks.map((landmark: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-600 rounded-full text-sm"
                        >
                          {landmark}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Economic Focus - Amber/yellow theme */}
              {county.economicFocus && county.economicFocus.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-700">
                  <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                    <span>💼</span> Economic Focus Areas
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {county.economicFocus.map((focus: string, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-amber-800/30 p-3 rounded-lg border border-amber-300 dark:border-amber-600"
                      >
                        <span className="font-medium text-amber-900 dark:text-amber-200">
                          {focus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  Historical Background
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {educationContent?.historicalContext ||
                    'Historical information is being compiled for this county.'}
                </p>
              </div>

              {educationContent?.specificData?.historicalEvents && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700">
                  <h4 className="font-bold text-yellow-900 dark:text-yellow-200 mb-4 text-lg">
                    Key Historical Events
                  </h4>
                  <div className="space-y-3">
                    {educationContent.specificData.historicalEvents.map(
                      (event: { year: number; event: string }, idx: number) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-yellow-200 dark:bg-yellow-800/50 rounded-full flex items-center justify-center">
                            <span className="text-yellow-800 dark:text-yellow-200 font-bold text-sm">
                              {event.year}
                            </span>
                          </div>
                          <p className="text-yellow-800 dark:text-yellow-200">{event.event}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'economy' && (
            <div className="space-y-6">
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  Economic Profile
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {educationContent?.economicImportance ||
                    'Economic data is being analyzed for this county.'}
                </p>
              </div>

              {educationContent?.specificData?.industries && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-700">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-4 text-lg">
                    Major Industries
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {educationContent.specificData.industries.map(
                      (industry: string, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-blue-800/30 p-4 rounded-lg border border-blue-300 dark:border-blue-600 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🏭</span>
                            <span className="text-blue-800 dark:text-blue-200 font-medium">
                              {industry}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'culture' && (
            <div className="space-y-6">
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  Cultural Heritage
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {educationContent?.culturalHeritage ||
                    'Cultural information is being researched for this county.'}
                </p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-700">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-4 text-lg">
                  Unique Features
                </h4>
                <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed">
                  {educationContent?.uniqueFeatures ||
                    'This county has many unique characteristics that make it special.'}
                </p>
              </div>

              {educationContent?.specificData?.majorAttractions && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-700">
                  <h4 className="font-bold text-green-900 dark:text-green-200 mb-4 text-lg">
                    Major Attractions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {educationContent.specificData.majorAttractions.map(
                      (attraction: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-white dark:bg-green-800/30 p-3 rounded-lg border border-green-300 dark:border-green-600"
                        >
                          <span className="text-2xl">📍</span>
                          <span className="text-green-800 dark:text-green-200">{attraction}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'geography' && (
            <div className="space-y-6">
              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  Geographical Features
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {educationContent?.geographicalSignificance ||
                    'Geographic analysis is being prepared for this county.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {educationContent?.specificData?.climate && (
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-5 border border-cyan-200 dark:border-cyan-700">
                    <h4 className="font-bold text-cyan-900 dark:text-cyan-200 mb-3 flex items-center gap-2">
                      <span>🌤️</span> Climate
                    </h4>
                    <p className="text-cyan-800 dark:text-cyan-200">
                      {educationContent.specificData.climate}
                    </p>
                  </div>
                )}

                {educationContent?.specificData?.elevation && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-5 border border-orange-200 dark:border-orange-700">
                    <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3 flex items-center gap-2">
                      <span>⛰️</span> Elevation
                    </h4>
                    <p className="text-orange-800 dark:text-orange-200">
                      {educationContent.specificData.elevation}
                    </p>
                  </div>
                )}
              </div>

              {/* County Shape Visual */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-4 text-center">
                  County Geographic Shape
                </h4>
                <div className="flex justify-center">
                  <CountyShapeDisplay
                    countyId={county.id}
                    size={200}
                    showLabel={true}
                    className="shadow-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'memory' && memoryAid && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Memory Techniques
              </h3>

              <div className="grid gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700">
                  <h4 className="font-bold text-yellow-900 dark:text-yellow-200 mb-3 flex items-center gap-2">
                    <span>📍</span> Location Memory Aid
                  </h4>
                  <p className="text-yellow-800 dark:text-yellow-200 text-lg">
                    {memoryAid.locationMnemonic}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-700">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                    <span>🔷</span> Shape Memory Aid
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200 text-lg">
                    {memoryAid.shapeMnemonic}
                  </p>
                </div>

                {memoryAid.rhymes && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-700">
                    <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-2">
                      <span>🎵</span> Rhyme to Remember
                    </h4>
                    <p className="text-purple-800 dark:text-purple-200 text-lg italic">
                      {memoryAid.rhymes}
                    </p>
                  </div>
                )}

                {memoryAid.visualCues && memoryAid.visualCues.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-700">
                    <h4 className="font-bold text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
                      <span>👁️</span> Visual Cues
                    </h4>
                    <ul className="space-y-2">
                      {memoryAid.visualCues.map((cue: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-green-800 dark:text-green-200"
                        >
                          <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                          <span>{cue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Educational content for {county.name} County
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document root
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

// Add animation styles to globals.css if not already present
/* const animationStyles = `
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideInUp {
  animation: slideInUp 0.3s ease-out;
}
`; */
