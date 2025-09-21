import React from 'react';
import { motion } from 'framer-motion';
import { StudyModeType } from '../../types/study';

interface StudyModeOption {
  id: StudyModeType;
  title: string;
  description: string;
  icon: string;
  features: string[];
  recommended?: boolean;
}

interface StudyModeSelectorProps {
  onModeSelect: (mode: StudyModeType) => void;
  selectedMode?: StudyModeType | null;
}

const studyModes: StudyModeOption[] = [
  {
    id: 'flashcard',
    title: 'Flashcard Mode',
    description: 'Learn with interactive flashcards and spaced repetition',
    icon: '📚',
    features: [
      'Flip cards to reveal details',
      'Spaced repetition algorithm',
      'Progress tracking',
      'Self-assessment rating'
    ],
    recommended: true
  },
  {
    id: 'map-exploration',
    title: 'Map Exploration',
    description: 'Explore counties by clicking on an interactive map',
    icon: '🗺️',
    features: [
      'Interactive California map',
      'Click counties to learn',
      'Visual location context',
      'Regional grouping'
    ]
  },
  {
    id: 'grid-study',
    title: 'Grid Study',
    description: 'Browse all counties in an organized grid layout',
    icon: '📊',
    features: [
      'All counties at once',
      'Filter by region/difficulty',
      'Quick overview cards',
      'Sort and search options'
    ]
  }
];

const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({
  onModeSelect,
  selectedMode
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Choose Your Study Method
        </h2>
        <p className="text-gray-600">
          Select the learning approach that works best for you
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {studyModes.map((mode, index) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative cursor-pointer rounded-xl p-6 border-2 transition-all duration-300
              ${selectedMode === mode.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-white/30 bg-white/80 hover:border-blue-300 hover:shadow-md'
              }
              backdrop-blur-sm
            `}
            onClick={() => onModeSelect(mode.id)}
          >
            {/* Recommended Badge */}
            {mode.recommended && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Recommended
              </div>
            )}

            {/* Icon */}
            <div className="text-4xl mb-4 text-center">
              {mode.icon}
            </div>

            {/* Title and Description */}
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
              {mode.title}
            </h3>
            <p className="text-gray-600 text-center mb-4 text-sm">
              {mode.description}
            </p>

            {/* Features */}
            <ul className="space-y-2">
              {mode.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500 text-xs">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Selection Indicator */}
            <motion.div
              className={`
                mt-4 w-full h-1 rounded-full transition-all duration-300
                ${selectedMode === mode.id ? 'bg-blue-500' : 'bg-gray-200'}
              `}
              layoutId={selectedMode === mode.id ? 'selected-indicator' : undefined}
            />

            {/* Hover overlay */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 pointer-events-none"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center text-sm text-gray-500"
      >
        <p>
          💡 <strong>Pro Tip:</strong> Try different modes to find what works best for your learning style.
          You can switch between modes at any time during your study session.
        </p>
      </motion.div>
    </div>
  );
};

export default StudyModeSelector;