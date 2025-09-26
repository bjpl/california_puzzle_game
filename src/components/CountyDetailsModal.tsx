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
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden z-[10000]"
        onClick={e => e.stopPropagation()}
        style={{
          animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
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

        {/* Header with County Shape - More elegant gradient */}
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 p-8 relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>

          <div className="flex items-center gap-6 relative">
            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl ring-4 ring-white/20">
              <CountyShapeDisplay
                countyId={county.id}
                size={90}
                className="flex-shrink-0"
              />
            </div>
            <div className="text-white flex-1">
              <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">{county.name}</h2>
              <p className="text-white/90 text-xl font-medium">{county.region}</p>
              {county.id && (
                <p className="text-white/70 text-sm mt-2 font-mono">ID: {county.id}</p>
              )}
            </div>
          </div>
        </div>

        {/* County Details - Scrollable content */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {/* Key Information Grid - More elegant cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="group bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 rounded-2xl border border-gray-200/50 hover:shadow-md transition-all duration-200">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">County Seat</div>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {county.capital || county.countySeat || 'N/A'}
              </div>
            </div>

            <div className="group bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 rounded-2xl border border-gray-200/50 hover:shadow-md transition-all duration-200">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Population</div>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                {county.population ? county.population.toLocaleString() : 'N/A'}
              </div>
            </div>

            <div className="group bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 rounded-2xl border border-gray-200/50 hover:shadow-md transition-all duration-200">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Area</div>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                {county.area ? `${county.area.toLocaleString()} sq mi` : 'N/A'}
              </div>
            </div>

            <div className="group bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 rounded-2xl border border-gray-200/50 hover:shadow-md transition-all duration-200">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Established</div>
              <div className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                {county.founded || county.established || 'N/A'}
              </div>
            </div>
          </div>

          {/* Fun Facts - More elegant presentation */}
          {county.funFacts && county.funFacts.length > 0 && (
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl shadow-sm">
                  <span className="text-white text-lg">✨</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Fun Facts</h3>
              </div>
              <div className="space-y-3">
                {county.funFacts.slice(0, 3).map((fact: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200/30">
                    <span className="text-orange-500 mt-0.5 text-lg">•</span>
                    <span className="text-gray-700 leading-relaxed">{fact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Natural Features - Improved chip design */}
          {county.naturalFeatures && county.naturalFeatures.length > 0 && (
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-sm">
                  <span className="text-white text-lg">🏔️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Natural Features</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {county.naturalFeatures.map((feature: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-medium border border-green-200/30 hover:shadow-md transition-shadow cursor-default">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Economic Focus - Enhanced chip style */}
          {county.economicFocus && county.economicFocus.length > 0 && (
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl shadow-sm">
                  <span className="text-white text-lg">💼</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Economic Focus</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {county.economicFocus.map((focus: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200/30 hover:shadow-md transition-shadow cursor-default">
                    {focus}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Educational Content Button - Enhanced design */}
          {onViewEducationalContent && (
            <div className="mt-6 pt-6 border-t border-gray-200/50">
              <button
                onClick={onViewEducationalContent}
                className="w-full group relative overflow-hidden py-4 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <span className="relative flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  View Full Educational Content
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Animation Styles */}
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
            transform: translateY(30px) scale(0.98);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        /* Custom scrollbar for content area */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </div>,
    document.body
  );
}