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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{
          animation: 'slideUp 0.3s ease-out',
          transform: 'translateY(0)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Header with County Shape */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-start gap-4">
            <div className="bg-white p-3 rounded-xl shadow-lg">
              <CountyShapeDisplay
                countyId={county.id}
                size={80}
                className="flex-shrink-0"
              />
            </div>
            <div className="text-white flex-1">
              <h2 className="text-3xl font-bold mb-1">{county.name}</h2>
              <p className="text-blue-100 text-lg">{county.region}</p>
              {county.id && (
                <p className="text-blue-200 text-sm mt-1">County ID: {county.id}</p>
              )}
            </div>
          </div>
        </div>

        {/* County Details */}
        <div className="p-6 space-y-4">
          {/* Key Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-sm text-gray-500 mb-1">County Seat:</div>
              <div className="text-xl font-semibold text-gray-900">
                {county.capital || county.countySeat || 'N/A'}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-sm text-gray-500 mb-1">Population:</div>
              <div className="text-xl font-semibold text-gray-900">
                {county.population ? county.population.toLocaleString() : 'N/A'}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-sm text-gray-500 mb-1">Area:</div>
              <div className="text-xl font-semibold text-gray-900">
                {county.area ? `${county.area.toLocaleString()} sq mi` : 'N/A'}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="text-sm text-gray-500 mb-1">Established:</div>
              <div className="text-xl font-semibold text-gray-900">
                {county.founded || county.established || 'N/A'}
              </div>
            </div>
          </div>

          {/* Fun Facts */}
          {county.funFacts && county.funFacts.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">🎉</span> Fun Facts
              </h3>
              <ul className="space-y-2">
                {county.funFacts.slice(0, 3).map((fact: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-700">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Natural Features */}
          {county.naturalFeatures && county.naturalFeatures.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">🏔️</span> Natural Features
              </h3>
              <div className="flex flex-wrap gap-2">
                {county.naturalFeatures.map((feature: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Economic Focus */}
          {county.economicFocus && county.economicFocus.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">💼</span> Economic Focus
              </h3>
              <div className="flex flex-wrap gap-2">
                {county.economicFocus.map((focus: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {focus}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Educational Content Button */}
          {educationContent && (
            <div className="border-t pt-4">
              <button
                onClick={onViewEducationalContent}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-[1.02]"
              >
                <span className="flex items-center justify-center gap-2">
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
      `}</style>
    </div>,
    document.body
  );
}