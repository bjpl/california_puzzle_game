import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../../stores/studyStore';
import { allCaliforniaCounties } from '../../data/californiaCountiesComplete';
import StudyCard from './StudyCard';
import StudyProgress from './StudyProgress';
import CaliforniaButton from '../CaliforniaButton';

interface FlashcardModeProps {
  onBack: () => void;
}

const FlashcardMode: React.FC<FlashcardModeProps> = ({ onBack }) => {
  const {
    flashcardSettings,
    startStudySession,
    endStudySession,
    markCountyAsStudied,
    getNextCountyToStudy,
    isStudySessionActive,
    updateFlashcardSettings
  } = useStudyStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyQueue, setStudyQueue] = useState<string[]>([]);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Initialize study session and queue
    startStudySession('flashcard');
    generateStudyQueue();

    return () => {
      if (isStudySessionActive) {
        endStudySession();
      }
    };
  }, []);

  const generateStudyQueue = () => {
    let counties = [...allCaliforniaCounties];

    if (flashcardSettings.focusOnWeakAreas) {
      // Prioritize counties that need review
      const nextToStudy = getNextCountyToStudy('flashcard');
      if (nextToStudy) {
        counties = counties.sort((a, b) => {
          if (a.id === nextToStudy) return -1;
          if (b.id === nextToStudy) return 1;
          return 0;
        });
      }
    }

    if (flashcardSettings.randomOrder) {
      counties = counties.sort(() => Math.random() - 0.5);
    } else {
      counties = counties.sort((a, b) => a.name.localeCompare(b.name));
    }

    setStudyQueue(counties.map(c => c.id));
  };

  const getCurrentCounty = () => {
    if (currentIndex >= studyQueue.length) return null;
    const countyId = studyQueue[currentIndex];
    return allCaliforniaCounties.find(c => c.id === countyId) || null;
  };

  const handleStudied = (countyId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    markCountyAsStudied(countyId, difficulty);
    setCompletedCards(prev => [...prev, countyId]);

    if (flashcardSettings.repeatIncorrect && difficulty === 'hard') {
      // Add to end of queue for retry
      setStudyQueue(prev => [...prev, countyId]);
    }
  };

  const handleNext = () => {
    if (currentIndex < studyQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (flashcardSettings.repeatIncorrect && completedCards.length > 0) {
      // Start over with incorrect cards
      generateStudyQueue();
      setCurrentIndex(0);
      setCompletedCards([]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinishSession = () => {
    endStudySession();
    onBack();
  };

  const currentCounty = getCurrentCounty();
  const progress = (currentIndex + 1) / studyQueue.length * 100;
  const isComplete = currentIndex >= studyQueue.length;

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center"
      >
        <div className="max-w-md mx-auto text-center bg-white rounded-xl p-8 shadow-lg">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Flashcard Session Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            You've studied {completedCards.length} counties in this session.
            Great work on expanding your California knowledge!
          </p>

          <div className="space-y-3">
            <CaliforniaButton
              onClick={handleFinishSession}
              variant="primary"
              size="large"
              className="w-full"
            >
              Continue Learning
            </CaliforniaButton>

            <CaliforniaButton
              onClick={() => {
                generateStudyQueue();
                setCurrentIndex(0);
                setCompletedCards([]);
              }}
              variant="outline"
              size="large"
              className="w-full"
            >
              Study Again
            </CaliforniaButton>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span>←</span>
              <span>Back to Study Modes</span>
            </button>

            <div>
              <h1 className="text-xl font-bold text-gray-800">Flashcard Mode</h1>
              <p className="text-sm text-gray-600">
                Card {currentIndex + 1} of {studyQueue.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ⚙️
            </button>

            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-lg font-semibold text-blue-600">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-6xl mx-auto mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Flashcard */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentCounty && (
                <motion.div
                  key={currentCounty.id}
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ duration: 0.3 }}
                >
                  <StudyCard
                    county={currentCounty}
                    onStudied={handleStudied}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    autoFlip={flashcardSettings.autoFlip}
                    flipDelay={flashcardSettings.flipDelay}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress Panel */}
          <div className="space-y-6">
            <StudyProgress compact showDetails={false} />

            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold text-gray-800 mb-3">Session Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cards completed:</span>
                  <span className="font-medium">{completedCards.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium">{studyQueue.length - currentIndex - 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => generateStudyQueue()}
                  className="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  🔄 Shuffle Cards
                </button>
                <button
                  onClick={() => setCurrentIndex(0)}
                  className="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  ⏮️ Restart Session
                </button>
                <button
                  onClick={handleFinishSession}
                  className="w-full p-2 text-left text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  🏁 End Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Flashcard Settings</h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={flashcardSettings.autoFlip}
                    onChange={(e) => updateFlashcardSettings({ autoFlip: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700">Auto-flip cards</span>
                </label>

                {flashcardSettings.autoFlip && (
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Flip delay: {flashcardSettings.flipDelay / 1000}s
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="10000"
                      step="500"
                      value={flashcardSettings.flipDelay}
                      onChange={(e) => updateFlashcardSettings({ flipDelay: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={flashcardSettings.randomOrder}
                    onChange={(e) => updateFlashcardSettings({ randomOrder: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700">Random order</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={flashcardSettings.focusOnWeakAreas}
                    onChange={(e) => updateFlashcardSettings({ focusOnWeakAreas: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700">Focus on weak areas</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={flashcardSettings.repeatIncorrect}
                    onChange={(e) => updateFlashcardSettings({ repeatIncorrect: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700">Repeat incorrect cards</span>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlashcardMode;