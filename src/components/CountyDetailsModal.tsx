import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import CountyShapeDisplay from './CountyShapeDisplay';

interface CountyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  county: any;
  educationContent?: any;
  memoryAid?: any;
  onViewEducationalContent?: () => void;
}

export default function CountyDetailsModal({
  isOpen,
  onClose,
  county,
  educationContent,
  memoryAid,
  onViewEducationalContent
}: CountyDetailsModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !county) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{
          animation: 'fadeIn 0.2s ease-out',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden z-[10000]"
        onClick={e => e.stopPropagation()}
        style={{
          animation: 'slideUp 0.3s ease-out',
          transform: 'translateY(0)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md hover:shadow-lg transition-all duration-200"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Header with County Shape - Clean solid color */}
        <div className="bg-blue-600 p-8 relative">
          <div className="flex items-center gap-6 relative">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <CountyShapeDisplay
                countyId={county.id}
                size={90}
                className="flex-shrink-0"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-2 text-white">{county.name}</h2>
              <p className="text-blue-100 text-xl">{county.region}</p>
              {county.id && (
                <p className="text-blue-200 text-sm mt-2 font-mono">ID: {county.id}</p>
              )}
            </div>
          </div>
        </div>

        {/* County Details - Scrollable content */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {/* Key Information Grid - Consistent color scheme */}
          <div className="grid grid-cols-2 gap-4">
            {/* County Seat - Blue theme */}
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
              <div className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-2">County Seat</div>
              <div className="text-2xl font-bold text-blue-900">
                {county.capital || county.countySeat || 'N/A'}
              </div>
            </div>

            {/* Population - Neutral gray */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Population</div>
              <div className="text-2xl font-bold text-gray-900">
                {county.population ? county.population.toLocaleString() : 'N/A'}
              </div>
            </div>

            {/* Area - Green theme */}
            <div className="bg-green-50 p-5 rounded-xl border border-green-200">
              <div className="text-xs font-medium text-green-600 uppercase tracking-wider mb-2">Area</div>
              <div className="text-2xl font-bold text-green-900">
                {county.area ? `${county.area.toLocaleString()} sq mi` : 'N/A'}
              </div>
            </div>

            {/* Established - Amber/warm theme */}
            <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
              <div className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-2">Established</div>
              <div className="text-2xl font-bold text-amber-900">
                {county.founded || county.established || 'N/A'}
              </div>
            </div>
          </div>

          {/* Fun Facts - Clean presentation */}
          {county.funFacts && county.funFacts.length > 0 && (
            <div className="relative">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🎉</span> Fun Facts
              </h3>
              <div className="space-y-2">
                {county.funFacts.slice(0, 3).map((fact: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span className="text-gray-700 leading-relaxed">{fact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Natural Features - Simple chips */}
          {county.naturalFeatures && county.naturalFeatures.length > 0 && (
            <div className="relative">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🏔️</span> Natural Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {county.naturalFeatures.map((feature: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Economic Focus - Simple chips */}
          {county.economicFocus && county.economicFocus.length > 0 && (
            <div className="relative">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>💼</span> Economic Focus
              </h3>
              <div className="flex flex-wrap gap-2">
                {county.economicFocus.map((focus: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200">
                    {focus}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Educational Content Button - Simple design */}
          {onViewEducationalContent && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onViewEducationalContent}
                className="w-full py-4 px-6 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  View Full Educational Content
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Simple scrollbar for content area */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>,
    document.body
  );
}