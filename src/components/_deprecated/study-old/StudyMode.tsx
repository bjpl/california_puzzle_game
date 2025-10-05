import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../../stores/studyStore';
import { StudyModeType } from '../../types/study';
import StudyModeSelector from './StudyModeSelector';
import FlashcardMode from './FlashcardMode';
import MapExplorationMode from './MapExplorationMode';
import GridStudyMode from './GridStudyMode';
import StudyProgress from './StudyProgress';
import CaliforniaButton from '../CaliforniaButton';

interface StudyModeProps {
  onStartGame: () => void;
  onBackToMenu: () => void;
}

const StudyMode: React.FC<StudyModeProps> = ({ onStartGame, onBackToMenu }) => {
  const [selectedMode, setSelectedMode] = useState<StudyModeType | null>(null);
  const { progress, resetProgress, isStudySessionActive } = useStudyStore();

  const handleModeSelect = (mode: StudyModeType) => {
    setSelectedMode(mode);
  };

  const handleBackToModeSelection = () => {
    setSelectedMode(null);
  };

  const renderStudyContent = () => {
    switch (selectedMode) {
      case 'flashcard':
        return <FlashcardMode onBack={handleBackToModeSelection} />;
      case 'map-exploration':
        return <MapExplorationMode onBack={handleBackToModeSelection} />;
      case 'grid-study':
        return <GridStudyMode onBack={handleBackToModeSelection} />;
      default:
        return null;
    }
  };

  if (selectedMode) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4"
        >
          {renderStudyContent()}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Study California Counties
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn about California's 58 counties through interactive study modes.
            Master the geography, facts, and details before taking on the puzzle challenge!
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <StudyProgress compact />
        </motion.div>

        {/* Study Mode Selection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <StudyModeSelector onModeSelect={handleModeSelect} />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <CaliforniaButton
            onClick={onStartGame}
            variant="primary"
            size="large"
            className="min-w-48"
          >
            {progress.totalStudied > 0 ? 'Start Game Challenge' : 'Skip to Game'}
          </CaliforniaButton>

          <CaliforniaButton
            onClick={onBackToMenu}
            variant="secondary"
            size="large"
            className="min-w-48"
          >
            Back to Menu
          </CaliforniaButton>

          {progress.totalStudied > 10 && (
            <CaliforniaButton
              onClick={resetProgress}
              variant="outline"
              size="large"
              className="min-w-48 text-red-600 border-red-300 hover:bg-red-50"
            >
              Reset Progress
            </CaliforniaButton>
          )}
        </motion.div>

        {/* Study Tips */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Study Tips</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 text-lg">💡</span>
              <div>
                <strong>Flashcards:</strong> Perfect for memorizing county names, capitals, and fun facts. Use spaced repetition for best results.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-lg">🗺️</span>
              <div>
                <strong>Map Exploration:</strong> Click counties on the interactive map to learn their locations and regional context.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-500 text-lg">📊</span>
              <div>
                <strong>Grid Study:</strong> Review all counties at once in an organized grid layout with filtering options.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudyMode;