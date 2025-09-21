import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { County } from '../../data/californiaCountiesComplete';
import { useStudyStore } from '../../stores/studyStore';

interface CountyInfoPanelProps {
  county: County | null;
  onClose: () => void;
  onStudied?: (countyId: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  showStudyControls?: boolean;
  position?: 'right' | 'bottom' | 'modal';
}

const CountyInfoPanel: React.FC<CountyInfoPanelProps> = ({
  county,
  onClose,
  onStudied,
  showStudyControls = true,
  position = 'right'
}) => {
  const { markCountyAsStudied, getCountyStudyInfo } = useStudyStore();
  const [userRating, setUserRating] = React.useState<'easy' | 'medium' | 'hard' | null>(null);

  const handleRating = (rating: 'easy' | 'medium' | 'hard') => {
    if (!county) return;

    setUserRating(rating);
    markCountyAsStudied(county.id, rating);
    onStudied?.(county.id, rating);
  };

  const formatPopulation = (population: number) => {
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)} million`;
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(0)},000`;
    }
    return population.toLocaleString();
  };

  const formatArea = (area: number) => {
    return `${area.toLocaleString()} square miles`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'right':
        return 'fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto';
      case 'bottom':
        return 'fixed bottom-0 left-0 right-0 max-h-80 bg-white shadow-2xl z-50 overflow-y-auto rounded-t-xl';
      case 'modal':
        return 'fixed inset-4 bg-white shadow-2xl z-50 overflow-y-auto rounded-xl max-w-lg mx-auto my-auto max-h-96';
      default:
        return 'fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto';
    }
  };

  if (!county) return null;

  const studyInfo = getCountyStudyInfo(county.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          x: position === 'right' ? '100%' : 0,
          y: position === 'bottom' ? '100%' : 0,
          opacity: position === 'modal' ? 0 : 1,
          scale: position === 'modal' ? 0.9 : 1
        }}
        animate={{
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1
        }}
        exit={{
          x: position === 'right' ? '100%' : 0,
          y: position === 'bottom' ? '100%' : 0,
          opacity: position === 'modal' ? 0 : 1,
          scale: position === 'modal' ? 0.9 : 1
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={getPositionClasses()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{county.name}</h2>
              <p className="text-blue-100">{county.region}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(county.difficulty)}`}>
              {county.difficulty.toUpperCase()}
            </span>
            {studyInfo.timesStudied > 0 && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                Studied {studyInfo.timesStudied}x
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Basic Information */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Capital</label>
                <p className="text-lg font-semibold text-gray-800">{county.capital}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Founded</label>
                <p className="text-lg font-semibold text-gray-800">{county.founded}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Population</label>
                <p className="text-lg font-semibold text-gray-800">{formatPopulation(county.population)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Area</label>
                <p className="text-lg font-semibold text-gray-800">{formatArea(county.area)}</p>
              </div>
            </div>
          </div>

          {/* Fun Fact */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span>💡</span>
              Fun Fact
            </h3>
            <p className="text-gray-700">{county.funFact}</p>
          </div>

          {/* Study Progress */}
          {studyInfo.timesStudied > 0 && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Study Progress</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Times studied: {studyInfo.timesStudied}</p>
                <p>Last studied: {studyInfo.lastStudied ? new Date(studyInfo.lastStudied).toLocaleDateString() : 'Never'}</p>
                {studyInfo.nextReview && (
                  <p>Next review: {new Date(studyInfo.nextReview).toLocaleDateString()}</p>
                )}
                {studyInfo.difficulty && (
                  <p>Your rating: <span className={`px-2 py-1 rounded ${getDifficultyColor(studyInfo.difficulty)}`}>
                    {studyInfo.difficulty}
                  </span></p>
                )}
              </div>
            </div>
          )}

          {/* Study Controls */}
          {showStudyControls && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">How well do you know this county?</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRating('hard')}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    userRating === 'hard' || studyInfo.difficulty === 'hard'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  Need Review
                </button>
                <button
                  onClick={() => handleRating('medium')}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    userRating === 'medium' || studyInfo.difficulty === 'medium'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  Good
                </button>
                <button
                  onClick={() => handleRating('easy')}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    userRating === 'easy' || studyInfo.difficulty === 'easy'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  Know Well
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2 text-center">
                Rating helps improve your study schedule with spaced repetition
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Backdrop for modal */}
      {position === 'modal' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
    </AnimatePresence>
  );
};

export default CountyInfoPanel;